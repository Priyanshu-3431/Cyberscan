const $ = (id) => document.getElementById(id);

const state = {
  watchId: null,
  battery: null
};

// ======================================================
// SAFE TEXT
// ======================================================

function safeText(value, fallback = "Unavailable") {
  return value === undefined || value === null || value === ""
    ? fallback
    : String(value);
}

// ======================================================
// BROWSER DETECTION
// ======================================================

function detectBrowser() {
  const ua = navigator.userAgent || "";

  if (/Edg\//i.test(ua)) return "Microsoft Edge";
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return "Opera";
  if (/Firefox\//i.test(ua)) return "Mozilla Firefox";
  if (/CriOS\//i.test(ua)) return "Google Chrome";
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
    return "Google Chrome";
  }

  if (
    /Safari\//i.test(ua) &&
    !/Chrome|CriOS|Android|Edg|OPR/i.test(ua)
  ) {
    return "Safari";
  }

  return "Browser information unavailable";
}

// ======================================================
// SCREEN SIZE
// ======================================================

function updateScreen() {
  const element = $("screenValue");

  if (!element) return;

  element.textContent =
    `${window.innerWidth} × ${window.innerHeight} px`;
}

// ======================================================
// BATTERY
// ======================================================

function setBatteryUnavailable() {
  const batteryValue = $("batteryValue");
  const chargingValue = $("chargingValue");

  if (batteryValue) {
    batteryValue.textContent = "Battery information unavailable";
  }

  if (chargingValue) {
    chargingValue.textContent = "";
  }
}

async function loadBattery() {
  if (!("getBattery" in navigator)) {
    setBatteryUnavailable();
    return;
  }

  try {
    const battery = await navigator.getBattery();

    state.battery = battery;

    const render = () => {
      const batteryValue = $("batteryValue");
      const chargingValue = $("chargingValue");

      if (batteryValue) {
        batteryValue.textContent =
          `${Math.round(battery.level * 100)}%`;
      }

      if (chargingValue) {
        chargingValue.textContent =
          battery.charging ? "Charging" : "Not charging";
      }
    };

    battery.addEventListener("levelchange", render);
    battery.addEventListener("chargingchange", render);

    render();

  } catch (error) {
    console.log("Battery information unavailable:", error);
    setBatteryUnavailable();
  }
}

// ======================================================
// DEVICE BRAND DETECTION
// ======================================================
async function detectBrand() {
  const ua = navigator.userAgent || "";

  // ==========================================
  // APPLE
  // ==========================================

  if (/iPhone|iPad|iPod/i.test(ua)) {
    return "Apple";
  }


  // ==========================================
  // DIRECT USER-AGENT BRAND DETECTION
  // ==========================================

  const brands = [

    // Samsung
    [/Samsung|SM-[A-Z0-9]+/i, "Samsung"],

    // Xiaomi / Redmi / POCO
    [
      /Xiaomi|Redmi|POCO|MiuiBrowser|MIUI/i,
      "Xiaomi / Redmi / POCO"
    ],

    // OnePlus
    [/OnePlus|ONEPLUS/i, "OnePlus"],

    // OPPO
    [/OPPO|CPH[0-9]+/i, "OPPO"],

    // vivo
    [/vivo/i, "vivo"],

    // realme
    [/realme|RMX[0-9]+/i, "realme"],

    // Motorola
    [/Motorola|Moto|moto/i, "Motorola"],

    // Huawei
    [/Huawei|HUAWEI/i, "Huawei"],

    // HONOR
    [/HONOR|Honor/i, "HONOR"],

    // Google
    [/Pixel/i, "Google"],

    // Nokia
    [/Nokia/i, "Nokia"],

    // Sony
    [/Sony|Xperia/i, "Sony"],

    // ASUS
    [/ASUS|Zenfone|ROG Phone|ROG/i, "ASUS"],

    // ZTE
    [/ZTE/i, "ZTE"],

    // Nubia
    [/nubia/i, "nubia"],

    // REDMAGIC
    [/RedMagic|REDMAGIC/i, "REDMAGIC"],

    // Infinix
    [/Infinix/i, "Infinix"],

    // TECNO
    [/TECNO/i, "TECNO"],

    // itel
    [/itel/i, "itel"],

    // Nothing
    [/Nothing/i, "Nothing"],

    // iQOO
    [/iQOO/i, "iQOO"],

    // TCL
    [/TCL/i, "TCL"],

    // Lenovo
    [/Lenovo/i, "Lenovo"],

    // LG
    [/LG[-_ ]|LG[A-Z0-9]/i, "LG"],

    // HTC
    [/HTC/i, "HTC"],

    // Meizu
    [/Meizu/i, "Meizu"],

    // Lava
    [/Lava/i, "Lava"],

    // Micromax
    [/Micromax/i, "Micromax"],

    // Karbonn
    [/Karbonn/i, "Karbonn"],

    // Spice
    [/Spice/i, "Spice"],

    // Coolpad
    [/Coolpad/i, "Coolpad"],

    // LeEco
    [/LeEco|LeTV/i, "LeEco"],

    // Fairphone
    [/Fairphone/i, "Fairphone"],

    // Alcatel
    [/Alcatel/i, "Alcatel"],

    // BlackBerry
    [/BlackBerry/i, "BlackBerry"],

    // Sharp
    [/Sharp|AQUOS/i, "Sharp"],

    // Panasonic
    [/Panasonic/i, "Panasonic"],

    // Fujitsu
    [/Fujitsu/i, "Fujitsu"],

    // Kyocera
    [/Kyocera/i, "Kyocera"],

    // Gionee
    [/Gionee/i, "Gionee"],

    // Intex
    [/Intex/i, "Intex"],

    // XOLO
    [/XOLO/i, "XOLO"],

    // Videocon
    [/Videocon/i, "Videocon"],

    // DOOGEE
    [/Doogee|DOOGEE/i, "DOOGEE"],

    // Ulefone
    [/Ulefone/i, "Ulefone"],

    // OUKITEL
    [/OUKITEL/i, "OUKITEL"],

    // Blackview
    [/Blackview/i, "Blackview"],

    // UMIDIGI
    [/UMIDIGI/i, "UMIDIGI"],

    // Wiko
    [/Wiko/i, "Wiko"],

    // Hisense
    [/Hisense/i, "Hisense"],

    // Haier
    [/Haier/i, "Haier"],

    // Doro
    [/Doro/i, "Doro"]
  ];


  for (const [regex, brand] of brands) {
    if (regex.test(ua)) {
      return brand;
    }
  }


  // ==========================================
  // ANDROID USER AGENT CLIENT HINTS
  // ==========================================

  if (
    navigator.userAgentData &&
    typeof navigator.userAgentData.getHighEntropyValues ===
      "function"
  ) {

    try {

      const data =
        await navigator.userAgentData.getHighEntropyValues([
          "model",
          "platform",
          "platformVersion",
          "mobile"
        ]);


      const model =
        String(data.model || "").trim();

      const platform =
        String(data.platform || "").trim();


      const deviceInfo =
        `${model} ${platform}`;


      // ========================================
      // MODEL IDENTIFIER DETECTION
      // ========================================

      const modelBrands = [

        // Samsung
        [/^SM-/i, "Samsung"],
        [/Galaxy/i, "Samsung"],

        // Xiaomi / Redmi / POCO
        [/Redmi/i, "Xiaomi / Redmi / POCO"],
        [/POCO/i, "Xiaomi / Redmi / POCO"],
        [/Xiaomi/i, "Xiaomi / Redmi / POCO"],

        // OnePlus
        [/OnePlus/i, "OnePlus"],

        // OPPO
        [/^CPH/i, "OPPO"],
        [/OPPO/i, "OPPO"],

        // vivo
        [/^V[0-9]{2}/i, "vivo"],
        [/vivo/i, "vivo"],

        // realme
        [/^RMX/i, "realme"],
        [/realme/i, "realme"],

        // Motorola
        [/Moto/i, "Motorola"],
        [/Motorola/i, "Motorola"],

        // Huawei
        [/Huawei/i, "Huawei"],

        // HONOR
        [/Honor/i, "HONOR"],

        // Google
        [/Pixel/i, "Google"],

        // Nokia
        [/Nokia/i, "Nokia"],

        // Sony
        [/Xperia/i, "Sony"],
        [/Sony/i, "Sony"],

        // ASUS
        [/ASUS/i, "ASUS"],
        [/Zenfone/i, "ASUS"],
        [/ROG/i, "ASUS"],

        // ZTE
        [/ZTE/i, "ZTE"],

        // nubia
        [/nubia/i, "nubia"],

        // Infinix
        [/Infinix/i, "Infinix"],

        // TECNO
        [/TECNO/i, "TECNO"],

        // itel
        [/itel/i, "itel"],

        // Nothing
        [/Nothing/i, "Nothing"],

        // iQOO
        [/iQOO/i, "iQOO"],

        // TCL
        [/TCL/i, "TCL"],

        // Lenovo
        [/Lenovo/i, "Lenovo"],

        // LG
        [/^LG/i, "LG"],

        // HTC
        [/HTC/i, "HTC"],

        // Meizu
        [/Meizu/i, "Meizu"],

        // Lava
        [/Lava/i, "Lava"],

        // Micromax
        [/Micromax/i, "Micromax"],

        // Karbonn
        [/Karbonn/i, "Karbonn"],

        // Gionee
        [/Gionee/i, "Gionee"],

        // Intex
        [/Intex/i, "Intex"],

        // DOOGEE
        [/DOOGEE/i, "DOOGEE"],

        // Ulefone
        [/Ulefone/i, "Ulefone"],

        // OUKITEL
        [/OUKITEL/i, "OUKITEL"],

        // Blackview
        [/Blackview/i, "Blackview"],

        // UMIDIGI
        [/UMIDIGI/i, "UMIDIGI"]
      ];


      for (const [regex, brand] of modelBrands) {

        if (regex.test(model)) {
          return brand;
        }

      }


      // ========================================
      // COMBINED MODEL + PLATFORM CHECK
      // ========================================

      const combinedBrands = [

        [/Samsung|SM-/i, "Samsung"],

        [
          /Xiaomi|Redmi|POCO/i,
          "Xiaomi / Redmi / POCO"
        ],

        [/OnePlus/i, "OnePlus"],

        [/OPPO|CPH/i, "OPPO"],

        [/vivo/i, "vivo"],

        [/realme|RMX/i, "realme"],

        [/Motorola|Moto/i, "Motorola"],

        [/Huawei/i, "Huawei"],

        [/HONOR/i, "HONOR"],

        [/Pixel/i, "Google"],

        [/Nokia/i, "Nokia"],

        [/Sony|Xperia/i, "Sony"],

        [/ASUS|Zenfone|ROG/i, "ASUS"],

        [/ZTE/i, "ZTE"],

        [/nubia/i, "nubia"],

        [/Infinix/i, "Infinix"],

        [/TECNO/i, "TECNO"],

        [/itel/i, "itel"],

        [/Nothing/i, "Nothing"],

        [/iQOO/i, "iQOO"],

        [/TCL/i, "TCL"],

        [/Lenovo/i, "Lenovo"],

        [/LG/i, "LG"],

        [/HTC/i, "HTC"],

        [/Meizu/i, "Meizu"],

        [/Lava/i, "Lava"],

        [/Micromax/i, "Micromax"]
      ];


      for (const [regex, brand] of combinedBrands) {

        if (regex.test(deviceInfo)) {
          return brand;
        }

      }

    } catch (error) {

      console.log(
        "Browser restricted device information:",
        error
      );

    }

  }


  // ==========================================
  // DESKTOP
  // ==========================================

  if (/Macintosh/i.test(ua)) {
    return "Apple";
  }


  // ==========================================
  // ANDROID FALLBACK
  // ==========================================

  if (/Android/i.test(ua)) {
    return "Android brand unavailable";
  }


  return "Device brand unavailable";
}

// ======================================================
// IP + ISP
// ======================================================

async function getIPAndISP() {
  const ipElement = $("ipValue");
  const ispElement = $("ispValue");

  if (ipElement) {
    ipElement.textContent = "Checking…";
  }

  if (ispElement) {
    ispElement.textContent = "Checking…";
  }

  try {
    const response = await fetch(
      "https://ipapi.co/json/",
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error("IP service unavailable");
    }

    const data = await response.json();

    const ip =
      typeof data.ip === "string"
        ? data.ip.trim()
        : "";

    const org =
      typeof data.org === "string"
        ? data.org.trim()
        : "";

    if (ipElement) {
      ipElement.textContent =
        ip || "Public IP unavailable";
    }

    if (ispElement) {
      ispElement.textContent =
        org || "ISP information unavailable";
    }

  } catch (error) {

    console.log("IP/ISP detection failed:", error);

    if (ipElement) {
      ipElement.textContent =
        "Public IP unavailable";
    }

    if (ispElement) {
      ispElement.textContent =
        "ISP information unavailable";
    }
  }
}

// ======================================================
// INITIALIZE DEVICE INFORMATION
// ======================================================

async function initDevice() {

  if ($("browserValue")) {
    $("browserValue").textContent =
      detectBrowser();
  }

  updateScreen();

  if ($("brandValue")) {
    $("brandValue").textContent =
      "Detecting...";
  }

  const brand = await detectBrand();

  if ($("brandValue")) {
    $("brandValue").textContent =
      safeText(brand, "Device brand unavailable");
  }

  loadBattery();
  getIPAndISP();
}

// ======================================================
// MAP URL
// ======================================================

function mapUrl(lat, lon) {

  const delta = 0.01;

  const minLon = lon - delta;
  const minLat = lat - delta;
  const maxLon = lon + delta;
  const maxLat = lat + delta;

  return (
    "https://www.openstreetmap.org/export/embed.html" +
    `?bbox=${encodeURIComponent(minLon)},` +
    `${encodeURIComponent(minLat)},` +
    `${encodeURIComponent(maxLon)},` +
    `${encodeURIComponent(maxLat)}` +
    `&layer=mapnik` +
    `&marker=${encodeURIComponent(lat)},` +
    `${encodeURIComponent(lon)}`
  );
}

// ======================================================
// LOCATION SUCCESS
// ======================================================

function showLocation(position) {

  const {
    latitude,
    longitude,
    accuracy
  } = position.coords;

  if ($("locationStatus")) {
    $("locationStatus").textContent =
      "Location permission granted. Showing your current browser-provided position.";
  }

  if ($("lat")) {
    $("lat").textContent =
      Number(latitude).toFixed(6);
  }

  if ($("lon")) {
    $("lon").textContent =
      Number(longitude).toFixed(6);
  }

  if ($("accuracy")) {
    $("accuracy").textContent =
      `${Math.round(Number(accuracy))} m`;
  }

  if ($("mapFrame")) {
    $("mapFrame").src =
      mapUrl(latitude, longitude);
  }

  if ($("locationData")) {
    $("locationData").classList.remove("hidden");
  }

  if ($("locationBtn")) {
    $("locationBtn").textContent =
      "Location Active";
  }
}

// ======================================================
// LOCATION ERROR
// ======================================================

function locationError(error) {

  const messages = {
    1: "Location permission denied.",
    2: "Location unavailable.",
    3: "Location request timed out."
  };

  if ($("locationStatus")) {
    $("locationStatus").textContent =
      messages[error.code] ||
      "Location unavailable.";
  }

  if ($("locationData")) {
    $("locationData").classList.add("hidden");
  }

  if ($("locationBtn")) {
    $("locationBtn").textContent =
      "Allow Location";
  }
}

// ======================================================
// REQUEST LOCATION
// ======================================================

function requestLocation() {

  if (
    !window.isSecureContext &&
    location.hostname !== "localhost"
  ) {
    $("locationStatus").textContent =
      "Location requires a secure HTTPS connection.";
    return;
  }

  if (!("geolocation" in navigator)) {
    $("locationStatus").textContent =
      "Geolocation is not supported by this browser.";
    return;
  }

  if (state.watchId !== null) {
    navigator.geolocation.clearWatch(
      state.watchId
    );
  }

  $("locationStatus").textContent =
    "Requesting location permission…";

  state.watchId =
    navigator.geolocation.watchPosition(
      showLocation,
      locationError,
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );
}

// ======================================================
// START BUTTON
// ======================================================

if ($("startBtn")) {

  $("startBtn").addEventListener(
    "click",
    () => {

      if ($("dashboard")) {
        $("dashboard").classList.remove(
          "hidden"
        );
      }

      initDevice();

      if ($("dashboard")) {
        $("dashboard").scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }
  );
}

// ======================================================
// LOCATION BUTTON
// ======================================================

if ($("locationBtn")) {
  $("locationBtn").addEventListener(
    "click",
    requestLocation
  );
}

// ======================================================
// SCREEN RESIZE
// ======================================================

window.addEventListener(
  "resize",
  updateScreen
);

// ======================================================
// MOBILE MENU
// ======================================================

if ($("menuBtn")) {

  $("menuBtn").addEventListener(
    "click",
    () => {

      const nav = $("navMenu");

      if (!nav) return;

      const open =
        nav.classList.toggle("open");

      $("menuBtn").setAttribute(
        "aria-expanded",
        String(open)
      );
    }
  );
}

document
  .querySelectorAll("#navMenu a")
  .forEach((a) => {

    a.addEventListener(
      "click",
      () => {

        if ($("navMenu")) {
          $("navMenu").classList.remove(
            "open"
          );
        }

        if ($("menuBtn")) {
          $("menuBtn").setAttribute(
            "aria-expanded",
            "false"
          );
        }
      }
    );
  });

// ======================================================
// PASSWORD CHECKER
// ======================================================

const passwordInput =
  $("passwordInput");

if (passwordInput && $("togglePassword")) {

  $("togglePassword").addEventListener(
    "click",
    () => {

      const visible =
        passwordInput.type === "text";

      passwordInput.type =
        visible ? "password" : "text";

      $("togglePassword").textContent =
        visible ? "Show" : "Hide";

      $("togglePassword").setAttribute(
        "aria-label",
        visible
          ? "Show password"
          : "Hide password"
      );
    }
  );
}

// ======================================================
// SIMPLE / REPEATED PASSWORD DETECTION
// ======================================================

function repeatedOrSimple(p) {

  if (!p) return false;

  // Same character repeated
  if (/^(.)\1+$/.test(p)) {
    return true;
  }

  const lower =
    p.toLowerCase();

  // Common passwords
  const commonPasswords = [
    "123456",
    "12345678",
    "password",
    "qwerty",
    "admin",
    "letmein",
    "welcome",
    "iloveyou",
    "123456789",
    "password123",
    "admin123"
  ];

  if (commonPasswords.includes(lower)) {
    return true;
  }

  // Sequential characters
  let sequential = 0;

  for (let i = 1; i < lower.length; i++) {

    if (
      lower.charCodeAt(i) ===
      lower.charCodeAt(i - 1) + 1
    ) {
      sequential++;
    }
  }

  return (
    sequential >=
    Math.max(4, lower.length - 3)
  );
}

// ======================================================
// CRACK-TIME CATEGORY
// ======================================================

function crackCategory(score, length) {

  if (!length) {
    return "—";
  }

  if (score <= 25) {
    return "Very easy";
  }

  if (score <= 45) {
    return "Easy";
  }

  if (score <= 65) {
    return "Moderate";
  }

  if (score <= 80) {
    return "Hard";
  }

  return "Very hard";
}

// ======================================================
// PASSWORD ANALYZER
// ======================================================

function checkPassword() {

  if (!passwordInput) return;

  const p =
    passwordInput.value;

  const checks = [];

  const add = (
    ok,
    good,
    bad
  ) => {

    checks.push({
      ok,
      text: ok
        ? `✓ ${good}`
        : `✗ ${bad}`
    });
  };

  add(
    p.length >= 12,
    "Good length (12+)",
    "Use at least 12 characters"
  );

  add(
    /[A-Z]/.test(p),
    "Uppercase letter",
    "Add an uppercase letter"
  );

  add(
    /[a-z]/.test(p),
    "Lowercase letter",
    "Add a lowercase letter"
  );

  add(
    /[0-9]/.test(p),
    "Number",
    "Add a number"
  );

  add(
    /[^A-Za-z0-9]/.test(p),
    "Special character",
    "Add a special character"
  );

  add(
    p.length > 0 &&
    !repeatedOrSimple(p),
    "No obvious simple/repeated pattern",
    "Avoid repeated or simple patterns"
  );

  const types = [
    /[A-Z]/,
    /[a-z]/,
    /[0-9]/,
    /[^A-Za-z0-9]/
  ].filter(
    (rx) => rx.test(p)
  ).length;

  let score = 0;

  if (p.length >= 8) {
    score += 20;
  }

  if (p.length >= 12) {
    score += 20;
  }

  if (p.length >= 16) {
    score += 10;
  }

  score += types * 8;

  if (
    p &&
    !repeatedOrSimple(p)
  ) {
    score += 10;
  }

  if (
    p.length >= 20 &&
    types >= 3
  ) {
    score += 8;
  }

  score =
    Math.min(100, score);

  let label =
    "Enter password";

  if (p) {

    if (score < 40) {
      label = "Weak";
    } else if (score < 70) {
      label = "Medium";
    } else {
      label = "Strong";
    }
  }

  if ($("score")) {
    $("score").textContent =
      `${score}/100`;
  }

  if ($("strength")) {
    $("strength").textContent =
      label;
  }

  if ($("lengthDetail")) {
    $("lengthDetail").textContent =
      `${p.length} characters`;
  }

  if ($("typesDetail")) {
    $("typesDetail").textContent =
      `${types}/4`;
  }

  if ($("crackTime")) {
    $("crackTime").textContent =
      crackCategory(
        score,
        p.length
      );
  }

  if ($("meterBar")) {

    $("meterBar").style.width =
      `${p ? score : 0}%`;

    $("meterBar").style.background =
      score < 40
        ? "#ff6666"
        : score < 70
          ? "#ffd166"
          : "#63e6a8";
  }

  if (!p) {

    if ($("checks")) {
      $("checks").innerHTML =
        '<div class="check">Enter a password to see local checks.</div>';
    }

    if ($("suggestions")) {
      $("suggestions").innerHTML =
        "<strong>💡 Suggestions</strong>" +
        "<p>Use 12+ characters with different character types. " +
        "Avoid common words and repeated patterns.</p>";
    }

    return;
  }

  if ($("checks")) {

    $("checks").innerHTML =
      checks
        .map(
          (c) =>
            `<div class="check ${
              c.ok ? "good" : "bad"
            }">${c.text}</div>`
        )
        .join("");
  }

  const tips = [];

  if (p.length < 12) {
    tips.push(
      "Make it at least 12 characters."
    );
  }

  if (types < 4) {
    tips.push(
      "Mix uppercase, lowercase, numbers and symbols."
    );
  }

  if (repeatedOrSimple(p)) {
    tips.push(
      "Avoid sequences, repeated characters and common passwords."
    );
  }

  if (
    p.length >= 12 &&
    types >= 3 &&
    !repeatedOrSimple(p)
  ) {
    tips.push(
      "Good structure. Prefer a unique password for every account."
    );
  }

  if ($("suggestions")) {

    $("suggestions").innerHTML =
      `<strong>💡 Suggestions</strong>` +
      `<p>${tips.join(" ")}</p>`;
  }
}

if (passwordInput) {
  passwordInput.addEventListener(
    "input",
    checkPassword
  );
}

// ======================================================
// CLEAR PASSWORD
// ======================================================

if ($("clearPassword")) {

  $("clearPassword").addEventListener(
    "click",
    () => {

      if (!passwordInput) return;

      passwordInput.value = "";
      passwordInput.type = "password";

      if ($("togglePassword")) {
        $("togglePassword").textContent =
          "Show";

        $("togglePassword").setAttribute(
          "aria-label",
          "Show password"
        );
      }

      checkPassword();

      passwordInput.focus();
    }
  );
}

// ======================================================
// SECURE RANDOM NUMBER
// ======================================================

function secureRandomInt(max) {

  if (
    !window.crypto ||
    !window.crypto.getRandomValues
  ) {
    return Math.floor(
      Math.random() * max
    );
  }

  const array =
    new Uint32Array(1);

  crypto.getRandomValues(array);

  return array[0] % max;
}

// ======================================================
// PASSWORD GENERATOR
// ======================================================

function generatePassword() {

  let sets = "";

  if ($("genUpper")?.checked) {
    sets +=
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if ($("genLower")?.checked) {
    sets +=
      "abcdefghijklmnopqrstuvwxyz";
  }

  if ($("genNumber")?.checked) {
    sets +=
      "0123456789";
  }

  if ($("genSymbol")?.checked) {
    sets +=
      "!@#$%^&*()-_=+[]{}?";
  }

  const length = Math.max(
    8,
    Math.min(
      64,
      Number(
        $("genLength")?.value
      ) || 16
    )
  );

  if (!sets) {

    if ($("generatedPassword")) {
      $("generatedPassword").value =
        "";
    }

    if ($("suggestions")) {
      $("suggestions").innerHTML =
        "<strong>💡 Generator</strong>" +
        "<p>Select at least one character type.</p>";
    }

    return;
  }

  let out = "";

  for (
    let i = 0;
    i < length;
    i++
  ) {
    out +=
      sets[
        secureRandomInt(
          sets.length
        )
      ];
  }

  if ($("generatedPassword")) {
    $("generatedPassword").value =
      out;
  }
}

// ======================================================
// GENERATE BUTTON
// ======================================================

if ($("generateBtn")) {

  $("generateBtn").addEventListener(
    "click",
    generatePassword
  );
}

// ======================================================
// COPY GENERATED PASSWORD
// ======================================================

if ($("copyGenerated")) {

  $("copyGenerated").addEventListener(
    "click",
    async () => {

      const value =
        $("generatedPassword")?.value;

      if (!value) return;

      try {

        await navigator.clipboard.writeText(
          value
        );

        $("copyGenerated").textContent =
          "Copied";

        setTimeout(
          () => {
            $("copyGenerated").textContent =
              "Copy";
          },
          1200
        );

      } catch (error) {

        $("copyGenerated").textContent =
          "Copy failed";

        setTimeout(
          () => {
            $("copyGenerated").textContent =
              "Copy";
          },
          1200
        );
      }
    }
  );
}

// ======================================================
// INITIAL PASSWORD STATE
// ======================================================

checkPassword();