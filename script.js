// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const attendeeInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const waterCountEl = document.getElementById("waterCount");
const zeroCountEl = document.getElementById("zeroCount");
const powerCountEl = document.getElementById("powerCount");

const MAX_ATTENDEES = 50;
const celebrationOverlay = document.getElementById("celebrationOverlay");
const celebrationText = document.getElementById("celebrationText");
const closeCelebrationBtn = document.getElementById("closeCelebration");

function readCounts() {
  var total = parseInt(localStorage.getItem("totalAttendees") || "0", 10);
  var water = parseInt(localStorage.getItem("team_water") || "0", 10);
  var zero = parseInt(localStorage.getItem("team_zero") || "0", 10);
  var power = parseInt(localStorage.getItem("team_power") || "0", 10);
  return { total: total, water: water, zero: zero, power: power };
}

function writeCounts(counts) {
  localStorage.setItem("totalAttendees", String(counts.total));
  localStorage.setItem("team_water", String(counts.water));
  localStorage.setItem("team_zero", String(counts.zero));
  localStorage.setItem("team_power", String(counts.power));
}

function updateUI() {
  var counts = readCounts();
  attendeeCountEl.textContent = counts.total;
  waterCountEl.textContent = counts.water;
  zeroCountEl.textContent = counts.zero;
  powerCountEl.textContent = counts.power;
  var pct = Math.min(100, Math.round((counts.total / MAX_ATTENDEES) * 100));
  progressBar.style.width = pct + "%";
  if (counts.total >= MAX_ATTENDEES) {
    var winner = computeWinner(counts);
    greeting.style.display = "block";
    greeting.textContent = "Goal reached! Winning team: " + winner + " 🎉";
    greeting.className = "success-message celebration";
    if (
      celebrationOverlay &&
      !celebrationOverlay.classList.contains("active")
    ) {
      showCelebrationPopup(winner);
    }
  } else if (
    celebrationOverlay &&
    celebrationOverlay.classList.contains("active")
  ) {
    hideCelebrationPopup();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateUI();
  renderAttendees();
  closeCelebrationBtn.addEventListener("click", hideCelebrationPopup);
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  var name = attendeeInput.value.trim();
  var team = teamSelect.value;
  if (!name || !team) {
    return;
  }
  var counts = readCounts();
  if (counts.total >= MAX_ATTENDEES) {
    greeting.style.display = "block";
    greeting.textContent = "Event is full. Thank you.";
    greeting.className = "success-message";
    return;
  }
  counts.total = counts.total + 1;
  if (team === "water") {
    counts.water = counts.water + 1;
  } else if (team === "zero") {
    counts.zero = counts.zero + 1;
  } else if (team === "power") {
    counts.power = counts.power + 1;
  }
  writeCounts(counts);
  // save attendee entry
  var attendees = readAttendees();
  attendees.push({ name: name, team: team });
  writeAttendees(attendees);
  renderAttendees();
  updateUI();
  greeting.style.display = "block";
  greeting.textContent = `${name} — checked in to ${teamDisplay(team)}. Thanks!`;
  greeting.className = "success-message";
  form.reset();
  setTimeout(function () {
    greeting.style.display = "none";
  }, 3000);
});

function teamDisplay(team) {
  if (team === "water") {
    return "Team Water Wise";
  }
  if (team === "zero") {
    return "Team Net Zero";
  }
  if (team === "power") {
    return "Team Renewables";
  }
  return "";
}

// Attendee list persistence and rendering
function readAttendees() {
  try {
    return JSON.parse(localStorage.getItem("attendees") || "[]");
  } catch (e) {
    return [];
  }
}

function writeAttendees(list) {
  localStorage.setItem("attendees", JSON.stringify(list));
}

function renderAttendees() {
  var list = readAttendees();
  var ul = document.getElementById("attendeeList");
  if (!ul) return;
  ul.innerHTML = "";
  list.forEach(function (a) {
    var li = document.createElement("li");
    li.className = "attendee-item";
    li.textContent = a.name + " — " + teamDisplay(a.team);
    ul.appendChild(li);
  });
}

function computeWinner(counts) {
  var teams = [
    { key: "water", name: "Team Water Wise", count: counts.water },
    { key: "zero", name: "Team Net Zero", count: counts.zero },
    { key: "power", name: "Team Renewables", count: counts.power },
  ];
  teams.sort(function (a, b) {
    return b.count - a.count;
  });
  if (teams.length >= 2 && teams[0].count === teams[1].count) {
    var top = teams
      .filter(function (t) {
        return t.count === teams[0].count;
      })
      .map(function (t) {
        return t.name;
      });
    return top.join(" & ");
  }
  return teams[0].name;
}

function showCelebrationPopup(teamName) {
  if (!celebrationOverlay || !celebrationText) return;
  celebrationText.textContent = "The winning team is " + teamName + "!";
  celebrationOverlay.setAttribute("aria-hidden", "false");
  celebrationOverlay.classList.add("active");
}

function hideCelebrationPopup() {
  if (!celebrationOverlay) return;
  celebrationOverlay.setAttribute("aria-hidden", "true");
  celebrationOverlay.classList.remove("active");
}
