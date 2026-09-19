const $ = (id) => document.getElementById(id);

const state = { watchId: null, battery: null };

function safeText(value, fallback) {
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua)) return "Microsoft Edge";
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return "Opera";
  if (/Firefox\//i.test(ua)) return "Mozilla Firefox";
  if (/CriOS\//i.test(ua) || /Chrome\//i.test(ua)) return "Google Chrome";
  if (/Safari\//i.test(ua) && !/Chrome|CriOS|Android/i.test(ua)) return "Safari";
  return "Browser information unavailable";
}

function updateScreen() {
  $("screenValue").textContent = `${window.innerWidth} × ${window.innerHeight} px`;
}

function setBatteryUnavailable() {
  $("batteryValue").textContent = "Battery information unavailable";
  $("chargingValue").textContent = "";
}

async function loadBattery() {
  if (!("getBattery" in navigator)) return setBatteryUnavailable();
  try {
    const battery = await navigator.getBattery();
    state.battery = battery;
    const render = () => {
      $("batteryValue").textContent = `${Math.round(battery.level * 100)}%`;
      $("chargingValue").textContent = battery.charging ? "Charging" : "Not charging";
    };
    ["levelchange", "chargingchange"].forEach(e => battery.addEventListener(e, render));
    render();
  } catch {
    setBatteryUnavailable();
  }
}

function detectBrand() {
  const ua = navigator.userAgent;
  const hints = navigator.userAgentData;
  const direct = [
    [/SamsungBrowser/i, "Samsung"],
    [/SM-|Samsung/i, "Samsung"],
    [/Xiaomi|Redmi|POCO/i, "Xiaomi / Redmi / POCO"],
    [/MiuiBrowser/i, "Xiaomi / Redmi / POCO"],
    [/OnePlus/i, "OnePlus"],
    [/OPPO/i, "OPPO"],
    [/vivo/i, "vivo"],
    [/realme/i, "realme"],
    [/HUAWEI/i, "Huawei"],
    [/iPhone|iPad|iPod/i, "Apple"]
  ];
  for (const [rx, name] of direct) if (rx.test(ua)) return name;

  if (hints?.mobile) {
    // Generic Android UA usually does not expose a trustworthy manufacturer.
    return "Device brand unavailable";
  }
  if (/Macintosh/i.test(ua)) return "Apple";
  return "Device brand unavailable";
}

async function getIPAndISP() {
  $("ipValue").textContent = "Checking…";
  $("ispValue").textContent = "Checking…";
  try {
    const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!response.ok) throw new Error("IP service unavailable");
    const data = await response.json();
    const ip = typeof data.ip === "string" ? data.ip : "";
    const org = typeof data.org === "string" ? data.org.trim() : "";
    $("ipValue").textContent = ip || "Public IP unavailable";
    $("ispValue").textContent = org || "ISP information unavailable";
  } catch {
    $("ipValue").textContent = "Public IP unavailable";
    $("ispValue").textContent = "ISP information unavailable";
  }
}

function initDevice() {
  $("browserValue").textContent = detectBrowser();
  updateScreen();
  $("brandValue").textContent = detectBrand();
  loadBattery();
  getIPAndISP();
}

function mapUrl(lat, lon) {
  const delta = 0.01;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(lon-delta)},${encodeURIComponent(lat-delta)},${encodeURIComponent(lon+delta)},${encodeURIComponent(lat+delta)}&layer=mapnik&marker=${encodeURIComponent(lat)},${encodeURIComponent(lon)}`;
}

function showLocation(position) {
  const { latitude, longitude, accuracy } = position.coords;
  $("locationStatus").textContent = "Location permission granted. Showing your current browser-provided position.";
  $("lat").textContent = latitude.toFixed(6);
  $("lon").textContent = longitude.toFixed(6);
  $("accuracy").textContent = `${Math.round(accuracy)} m`;
  $("mapFrame").src = mapUrl(latitude, longitude);
  $("locationData").classList.remove("hidden");
  $("locationBtn").textContent = "Location Active";
}

function locationError(error) {
  const messages = {
    1: "Location permission denied.",
    2: "Location unavailable.",
    3: "Location request timed out."
  };
  $("locationStatus").textContent = messages[error.code] || "Location unavailable.";
  $("locationData").classList.add("hidden");
  $("locationBtn").textContent = "Allow Location";
}

function requestLocation() {
  if (!window.isSecureContext && location.hostname !== "localhost") {
    $("locationStatus").textContent = "Location requires a secure HTTPS connection.";
    return;
  }
  if (!("geolocation" in navigator)) {
    $("locationStatus").textContent = "Geolocation is not supported by this browser.";
    return;
  }
  if (state.watchId !== null) navigator.geolocation.clearWatch(state.watchId);
  $("locationStatus").textContent = "Requesting location permission…";
  state.watchId = navigator.geolocation.watchPosition(showLocation, locationError, {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 15000
  });
}

$("startBtn").addEventListener("click", () => {
  $("dashboard").classList.remove("hidden");
  initDevice();
  $("dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
});

$("locationBtn").addEventListener("click", requestLocation);
window.addEventListener("resize", updateScreen);

$("menuBtn").addEventListener("click", () => {
  const nav = $("navMenu");
  const open = nav.classList.toggle("open");
  $("menuBtn").setAttribute("aria-expanded", String(open));
});
document.querySelectorAll("#navMenu a").forEach(a => a.addEventListener("click", () => {
  $("navMenu").classList.remove("open");
  $("menuBtn").setAttribute("aria-expanded", "false");
}));

const passwordInput = $("passwordInput");
$("togglePassword").addEventListener("click", () => {
  const visible = passwordInput.type === "text";
  passwordInput.type = visible ? "password" : "text";
  $("togglePassword").textContent = visible ? "Show" : "Hide";
  $("togglePassword").setAttribute("aria-label", visible ? "Show password" : "Hide password");
});

function repeatedOrSimple(p) {
  if (!p) return false;
  if (/^(.)\1+$/.test(p)) return true;
  const lower = p.toLowerCase();
  if (/^(123456|12345678|password|qwerty|admin|letmein|welcome|iloveyou)$/.test(lower)) return true;
  let sequential = 0;
  for (let i = 1; i < lower.length; i++) {
    if (lower.charCodeAt(i) === lower.charCodeAt(i - 1) + 1) sequential++;
  }
  return sequential >= Math.max(4, lower.length - 3);
}

function crackCategory(score, length) {
  if (!length) return "—";
  if (score <= 25) return "Very easy";
  if (score <= 45) return "Easy";
  if (score <= 65) return "Moderate";
  if (score <= 80) return "Hard";
  return "Very hard";
}

function checkPassword() {
  const p = passwordInput.value;
  const checks = [];
  const add = (ok, good, bad) => checks.push({ok, text: ok ? `✓ ${good}` : `✗ ${bad}`});

  add(p.length >= 12, "Good length (12+)", "Use at least 12 characters");
  add(/[A-Z]/.test(p), "Uppercase letter", "Add an uppercase letter");
  add(/[a-z]/.test(p), "Lowercase letter", "Add a lowercase letter");
  add(/[0-9]/.test(p), "Number", "Add a number");
  add(/[^A-Za-z0-9]/.test(p), "Special character", "Add a special character");
  add(p.length > 0 && !repeatedOrSimple(p), "No obvious simple/repeated pattern", "Avoid repeated or simple patterns");

  const types = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(rx => rx.test(p)).length;
  let score = 0;
  if (p.length >= 8) score += 20;
  if (p.length >= 12) score += 20;
  if (p.length >= 16) score += 10;
  score += types * 8;
  if (p && !repeatedOrSimple(p)) score += 10;
  if (p.length >= 20 && types >= 3) score += 8;
  score = Math.min(100, score);

  let label = "Enter password";
  if (p) label = score < 40 ? "Weak" : score < 70 ? "Medium" : "Strong";

  $("score").textContent = `${score}/100`;
  $("strength").textContent = label;
  $("lengthDetail").textContent = `${p.length} characters`;
  $("typesDetail").textContent = `${types}/4`;
  $("crackTime").textContent = crackCategory(score, p.length);
  $("meterBar").style.width = `${p ? score : 0}%`;
  $("meterBar").style.background = score < 40 ? "#ff6666" : score < 70 ? "#ffd166" : "#63e6a8";

  if (!p) {
    $("checks").innerHTML = '<div class="check">Enter a password to see local checks.</div>';
    $("suggestions").innerHTML = "<strong>💡 Suggestions</strong><p>Use 12+ characters with different character types. Avoid common words and repeated patterns.</p>";
    return;
  }

  $("checks").innerHTML = checks.map(c => `<div class="check ${c.ok ? "good" : "bad"}">${c.text}</div>`).join("");

  const tips = [];
  if (p.length < 12) tips.push("Make it at least 12 characters.");
  if (types < 4) tips.push("Mix uppercase, lowercase, numbers and symbols.");
  if (repeatedOrSimple(p)) tips.push("Avoid sequences, repeated characters and common passwords.");
  if (p.length >= 12 && types >= 3 && !repeatedOrSimple(p)) tips.push("Good structure. Prefer a unique password for every account.");
  $("suggestions").innerHTML = `<strong>💡 Suggestions</strong><p>${tips.join(" ")}</p>`;
}

passwordInput.addEventListener("input", checkPassword);

$("clearPassword").addEventListener("click", () => {
  passwordInput.value = "";
  passwordInput.type = "password";
  $("togglePassword").textContent = "Show";
  checkPassword();
  passwordInput.focus();
});

function secureRandomInt(max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function generatePassword() {
  let sets = "";
  if ($("genUpper").checked) sets += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if ($("genLower").checked) sets += "abcdefghijklmnopqrstuvwxyz";
  if ($("genNumber").checked) sets += "0123456789";
  if ($("genSymbol").checked) sets += "!@#$%^&*()-_=+[]{}?";
  let length = Math.max(8, Math.min(64, Number($("genLength").value) || 16));
  if (!sets) {
    $("generatedPassword").value = "";
    $("suggestions").innerHTML = "<strong>💡 Generator</strong><p>Select at least one character type.</p>";
    return;
  }
  let out = "";
  for (let i = 0; i < length; i++) out += sets[secureRandomInt(sets.length)];
  $("generatedPassword").value = out;
}

$("generateBtn").addEventListener("click", generatePassword);
$("copyGenerated").addEventListener("click", async () => {
  const value = $("generatedPassword").value;
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    $("copyGenerated").textContent = "Copied";
    setTimeout(() => $("copyGenerated").textContent = "Copy", 1200);
  } catch {
    $("copyGenerated").textContent = "Copy failed";
    setTimeout(() => $("copyGenerated").textContent = "Copy", 1200);
  }
});

checkPassword();
