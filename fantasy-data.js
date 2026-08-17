(function () {
  "use strict";

  const panel = document.querySelector("[data-private-league]");
  if (!panel) return;

  const text = (selector, value) => {
    const element = panel.querySelector(selector);
    if (element && value !== undefined && value !== null) element.textContent = value;
  };

  const formatDate = (value) => {
    if (!value) return "never";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const setSyncState = (status, hasSnapshot) => {
    const label = panel.querySelector("[data-private-sync]");
    const note = panel.querySelector("[data-private-note]");
    if (!label || !note) return;

    label.classList.remove("is-manual", "is-live", "is-stale");
    if (status.state === "current") {
      label.classList.add("is-live");
      label.lastChild.textContent = " synced";
      note.textContent = `Fantrax data last refreshed ${formatDate(status.lastSuccessfulSync)}.`;
    } else if (status.state === "authentication-required") {
      label.classList.add("is-stale");
      label.lastChild.textContent = " login needs refresh";
      note.textContent = hasSnapshot
        ? `Showing the last successful snapshot from ${formatDate(status.lastSuccessfulSync)}. The Fantrax login cookie needs to be replaced.`
        : "The Fantrax login cookie needs to be added or replaced before the first private-league sync.";
    } else if (status.state === "failed") {
      label.classList.add("is-stale");
      label.lastChild.textContent = " sync interrupted";
      note.textContent = hasSnapshot
        ? `Showing the last successful snapshot from ${formatDate(status.lastSuccessfulSync)}.`
        : "The first private-league sync was interrupted. No Fantrax data has been published.";
    } else {
      label.classList.add("is-manual");
      label.lastChild.textContent = " awaiting setup";
    }
  };

  const rosterList = (players) => {
    const list = document.createElement("ul");
    players.forEach((player) => {
      const item = document.createElement("li");
      const slot = document.createElement("span");
      slot.textContent = player.position || "—";
      item.append(slot, document.createTextNode(player.name));
      list.append(item);
    });
    return list;
  };

  const renderRoster = (players) => {
    const container = panel.querySelector("[data-private-roster]");
    if (!container || !players.length) return;
    const active = players.filter((player) => player.group === "active");
    const bench = players.filter((player) => player.group !== "active");
    const columns = container.querySelector(".roster-columns");
    columns.replaceChildren();
    [["active lineup", active], ["bench + development", bench]].forEach(([heading, group]) => {
      const column = document.createElement("div");
      const title = document.createElement("h4");
      title.textContent = heading;
      column.append(title, rosterList(group));
      columns.append(column);
    });
    container.hidden = false;
  };

  Promise.all([
    fetch("data/fantasy/private-league.json", { cache: "no-store" }).then((response) => response.json()),
    fetch("data/fantasy/sync-status.json", { cache: "no-store" }).then((response) => response.json()),
  ])
    .then(([snapshot, status]) => {
      const hasSnapshot = Boolean(snapshot.team && snapshot.lastSuccessfulSync);
      setSyncState(status, hasSnapshot);
      if (!hasSnapshot) return;

      const { league, team } = snapshot;
      const record = team.record || {};
      const hasRecord = [record.wins, record.losses, record.ties].every(Number.isInteger);
      text("[data-private-league-name]", league.name);
      text("[data-private-team-name]", team.name);
      text("[data-private-record]", hasRecord ? `${record.wins}–${record.losses}–${record.ties}` : "—");
      text("[data-private-record-note]", record.rank ? `rank ${record.rank} of ${league.teamCount}` : "rank begins when the season does");
      text("[data-private-season]", league.season);
      text("[data-private-team-count]", `${league.teamCount} teams`);
      text("[data-private-roster-count]", `${team.rosterCount} players`);
      renderRoster(team.roster || []);
    })
    .catch(() => setSyncState({ state: "failed" }, false));
})();
