(function () {
  "use strict";

  const panels = [...document.querySelectorAll("[data-fantrax-league]")];
  if (!panels.length) return;

  const formatDate = (value) => {
    if (!value) return "never";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  };

  const setText = (panel, selector, value) => {
    const element = panel.querySelector(selector);
    if (element && value !== undefined && value !== null) element.textContent = value;
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

  const renderRoster = (panel, players) => {
    const container = panel.querySelector("[data-roster]");
    if (!container || !players.length) return;
    const columns = container.querySelector(".roster-columns");
    columns.replaceChildren();
    const groups = [
      ["active lineup", players.filter((player) => player.group === "active")],
      ["bench + development", players.filter((player) => player.group !== "active")],
    ];
    groups.forEach(([heading, group]) => {
      const column = document.createElement("div");
      const title = document.createElement("h4");
      title.textContent = heading;
      column.append(title, rosterList(group));
      columns.append(column);
    });
    container.hidden = false;
  };

  const setSyncState = (panel, status, snapshot) => {
    const label = panel.querySelector("[data-sync]");
    const note = panel.querySelector("[data-note]");
    if (!label || !note) return;

    label.classList.remove("is-manual", "is-live", "is-stale");
    if (status.state === "current") {
      label.classList.add("is-live");
      label.lastChild.textContent = " synced";
      note.textContent = `Fantrax data last refreshed ${formatDate(status.lastSuccessfulSync)}.`;
    } else if (status.state === "authentication-required") {
      label.classList.add("is-stale");
      label.lastChild.textContent = " login needs refresh";
      note.textContent = snapshot
        ? `Showing the last successful snapshot from ${formatDate(snapshot.lastSuccessfulSync)}.`
        : "The Fantrax login cookie needs to be refreshed before this league can be imported.";
    } else if (status.state === "failed") {
      label.classList.add("is-stale");
      label.lastChild.textContent = " sync interrupted";
      note.textContent = snapshot
        ? `Showing the last successful snapshot from ${formatDate(snapshot.lastSuccessfulSync)}.`
        : "No Fantrax snapshot is available yet.";
    }
  };

  const renderPanel = (panel, snapshot, status) => {
    setSyncState(panel, status || {}, snapshot);
    if (!snapshot) return;

    const { league, team } = snapshot;
    const record = team.record || {};
    const hasRecord = [record.wins, record.losses, record.ties].every(Number.isInteger);
    setText(panel, "[data-league-name]", league.name);
    setText(panel, "[data-team-name]", team.name);
    setText(panel, "[data-record]", hasRecord ? `${record.wins}–${record.losses}–${record.ties}` : "—");
    setText(panel, "[data-record-note]", record.rank ? `rank ${record.rank} of ${league.teamCount}` : "rank begins when the season does");
    setText(panel, "[data-season]", league.season);
    setText(panel, "[data-team-count]", `${league.teamCount} teams`);
    setText(panel, "[data-roster-count]", `${team.rosterCount} players`);
    setText(panel, "[data-roster-summary]", `${team.rosterCount} players · expand`);
    renderRoster(panel, team.roster || []);
  };

  Promise.all([
    fetch("data/fantasy/leagues.json", { cache: "no-store" }).then((response) => response.json()),
    fetch("data/fantasy/leagues-sync-status.json", { cache: "no-store" }).then((response) => response.json()),
  ])
    .then(([payload, statusPayload]) => {
      const snapshots = new Map((payload.leagues || []).map((item) => [item.league.id, item]));
      panels.forEach((panel) => {
        const leagueId = panel.dataset.fantraxLeague;
        renderPanel(panel, snapshots.get(leagueId), statusPayload.leagues?.[leagueId]);
      });
    })
    .catch(() => {
      panels.forEach((panel) => setSyncState(panel, { state: "failed" }, null));
    });
})();
