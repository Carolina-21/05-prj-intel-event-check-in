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
    greeting.style.display = "block";
    greeting.textContent = "Capacity reached. Check-in is closed.";
    greeting.className = "success-message";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateUI();
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
