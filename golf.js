(function () {
  "use strict";

  const history = document.querySelector("[data-round-history]");
  if (!history) return;

  const rounds = Array.isArray(window.GOLF_ROUNDS) ? window.GOLF_ROUNDS : [];

  const displayToPar = (value) => value === 0 ? "E" : value > 0 ? `+${value}` : String(value);
  const displayDate = (value) => {
    if (!value) return "date not set";
    const date = new Date(`${value}T00:00:00Z`);
    const day = date.getUTCDate();
    const teen = day % 100 >= 11 && day % 100 <= 13;
    const suffix = teen ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th");
    const month = new Intl.DateTimeFormat(undefined, { month: "long", timeZone: "UTC" }).format(date);
    return `${month} ${day}${suffix}, ${date.getUTCFullYear()}`;
  };

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  const calculate = (round) => {
    const holes = Array.isArray(round.holeData) ? round.holeData : [];
    const completed = holes.filter((hole) => Number.isFinite(hole.score) && Number.isFinite(hole.par));
    const score = completed.reduce((sum, hole) => sum + hole.score, 0);
    const par = completed.reduce((sum, hole) => sum + hole.par, 0);
    return {
      complete: holes.length === round.holes && completed.length === round.holes,
      score,
      par,
      toPar: score - par,
    };
  };

  const roundDifferential = (round) => {
    if (Number.isFinite(round.differential)) return Number(round.differential);
    if (round.holes !== 18 || !Number.isFinite(round.rating) || !Number.isFinite(round.slope) || round.slope <= 0) return null;
    const stats = calculate(round);
    if (!stats.complete) return null;
    const adjustedGrossScore = Number.isFinite(round.adjustedGrossScore)
      ? round.adjustedGrossScore
      : round.holeData.reduce((sum, hole) => sum + Math.min(hole.score, hole.par + 5), 0);
    const pcc = Number.isFinite(round.pcc) ? round.pcc : 0;
    return Math.round(((113 / round.slope) * (adjustedGrossScore - round.rating - pcc)) * 10) / 10;
  };

  const handicapFromRounds = (allRounds) => {
    const holesLogged = allRounds.reduce((sum, round) => {
      const stats = calculate(round);
      const rated = Number.isFinite(round.rating) && Number.isFinite(round.slope) && round.slope > 0;
      return sum + (stats.complete && rated ? (Number(round.holes) || 0) : 0);
    }, 0);
    const recentDifferentials = allRounds
      .slice()
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .map(roundDifferential)
      .filter(Number.isFinite)
      .slice(0, 20);
    if (holesLogged < 54 || recentDifferentials.length < 3) {
      return { index: null, note: `${Math.min(holesLogged, 54)} / 54 holes logged` };
    }

    const count = recentDifferentials.length;
    let used = 1;
    let adjustment = 0;
    if (count === 3) adjustment = -2;
    else if (count === 4) adjustment = -1;
    else if (count === 5) adjustment = 0;
    else if (count === 6) { used = 2; adjustment = -1; }
    else if (count <= 8) used = 2;
    else if (count <= 11) used = 3;
    else if (count <= 14) used = 4;
    else if (count <= 16) used = 5;
    else if (count <= 18) used = 6;
    else if (count === 19) used = 7;
    else used = 8;
    const selected = recentDifferentials.slice().sort((a, b) => a - b).slice(0, used);
    const average = selected.reduce((sum, value) => sum + value, 0) / selected.length;
    const index = Math.min(54, Math.round((average + adjustment) * 10) / 10);
    return { index, note: `best ${used} of latest ${count} differentials` };
  };

  const historyScorecard = (round, stats) => {
    const wrapper = document.createElement("div");
    wrapper.className = "scorecard-wrap round-scorecard-wrap";
    const table = document.createElement("table");
    table.className = "scorecard round-scorecard";
    table.innerHTML = "<thead><tr><th scope=\"col\">hole</th><th scope=\"col\">par</th><th scope=\"col\">yards</th><th scope=\"col\" title=\"Hole handicap: 1 is the hardest\">HCP</th><th scope=\"col\">score</th></tr></thead><tbody></tbody><tfoot><tr><th scope=\"row\">total</th><td></td><td></td><td></td><td></td></tr></tfoot>";
    const body = table.querySelector("tbody");
    round.holeData.forEach((hole) => {
      const row = document.createElement("tr");
      [hole.hole, hole.par, hole.yardage ?? "—", hole.handicap ?? "—", hole.score].forEach((value, index) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        if (index === 0) cell.scope = "row";
        cell.textContent = value;
        row.append(cell);
      });
      body.append(row);
    });
    const totals = table.querySelectorAll("tfoot td");
    const yardage = round.holeData.reduce((sum, hole) => sum + (hole.yardage || 0), 0);
    [stats.par, yardage || "—", "—", stats.score].forEach((value, index) => {
      totals[index].textContent = value;
    });
    wrapper.append(table);
    return wrapper;
  };

  const roundCard = (round) => {
    const stats = calculate(round);
    const article = document.createElement("details");
    article.className = "round-card";
    article.innerHTML = `
      <summary class="round-card-summary">
        <img class="round-summary-image" alt="">
        <span class="round-summary-shade" aria-hidden="true"></span>
        <span class="round-summary-course"><strong></strong><small></small></span>
        <span class="round-summary-score"><small>score</small><strong>${stats.complete ? `${stats.score} · ${displayToPar(stats.toPar)}` : "pending"}</strong></span>
        <span class="round-summary-toggle">view scorecard</span>
      </summary>
      <div class="round-card-expanded"><div class="round-card-meta"></div><div data-scorecard-slot></div></div>`;
    const image = article.querySelector(".round-summary-image");
    image.src = round.image || "assets/golf/course-banner.jpg";
    image.alt = round.course ? `${round.course} golf course` : "Golf course";
    article.querySelector(".round-summary-course strong").textContent = round.course;
    article.querySelector(".round-summary-course small").textContent = displayDate(round.date);

    const details = [
      round.location,
      round.tees,
      round.yardage ? `${Number(round.yardage).toLocaleString()} yd` : null,
      round.rating && round.slope ? `${round.rating} / ${round.slope}` : null,
      round.holes ? `${round.holes} holes` : null,
    ].filter(Boolean);
    const metadata = article.querySelector(".round-card-meta");
    metadata.textContent = details.join(" · ");

    const slot = article.querySelector("[data-scorecard-slot]");
    if (stats.complete) {
      slot.replaceWith(historyScorecard(round, stats));
    } else {
      const note = document.createElement("p");
      note.className = "draft-scorecard-note";
      note.textContent = "Scorecard details to be added.";
      slot.replaceWith(note);
    }

    if (round.notes) {
      const notes = document.createElement("p");
      notes.className = "round-card-notes";
      notes.textContent = round.notes;
      metadata.after(notes);
    }
    return article;
  };

  const render = () => {
    history.replaceChildren();
    rounds
      .slice()
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .forEach((round) => history.append(roundCard(round)));

    const completed = rounds.map((round) => ({ round, stats: calculate(round) })).filter((item) => item.stats.complete);
    const preferredLength = completed.some((item) => item.round.holes === 18) ? 18 : 9;
    const comparable = completed.filter((item) => item.round.holes === preferredLength);
    const scores = comparable.map((item) => item.stats.score);
    const average = scores.length ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : "—";
    const best = scores.length ? Math.min(...scores) : "—";
    const suffix = scores.length ? ` · ${preferredLength}h` : "";
    setText("[data-round-count]", `${rounds.length} ${rounds.length === 1 ? "round" : "rounds"}`);
    setText("[data-stat-rounds]", rounds.length);
    setText("[data-stat-average]", `${average}${suffix}`);
    setText("[data-stat-best]", `${best}${suffix}`);
    setText("[data-stat-courses]", new Set(rounds.map((round) => round.course.trim().toLowerCase())).size);
    const handicap = handicapFromRounds(rounds);
    const handicapLabel = handicap.index === null
      ? "pending"
      : handicap.index < 0 ? `+${Math.abs(handicap.index).toFixed(1)}` : handicap.index.toFixed(1);
    setText("[data-stat-handicap]", handicapLabel);
    setText("[data-stat-handicap-note]", handicap.note);
  };

  render();
})();
