// --- Admin Command Center Logic ---

const chatLog = document.getElementById("chat-log");
const statusDiv = document.getElementById("status");
const takeControlBtn = document.getElementById("takeControlBtn");
const speakBtn = document.getElementById("speakBtn");
const alertsList = document.getElementById("alerts-list");
const dispatchBtns = document.querySelectorAll(".dispatch-btn");

let websocket = null;
let isControlling = false;
let isSpeaking = false;
const mediaHandler = new MediaHandler();

// Map Initialization
let map = L.map("map").setView([20.5937, 78.9629], 5); // Center of India by default
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);
let citizenMarker = null;

function connect() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/admin/ws`;

  websocket = new WebSocket(wsUrl);

  websocket.onopen = () => {
    statusDiv.textContent = "Live Monitoring: Active";
    statusDiv.className = "status connected";
    addAlert("System connected. Monitoring live sessions.", "info");
  };

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleAdminEvent(data);
  };

  websocket.onclose = () => {
    statusDiv.textContent = "Live Monitoring: Offline";
    statusDiv.className = "status disconnected";
    addAlert("Connection lost. Retrying in 5s...", "warning");
    setTimeout(connect, 5000);
  };
}

function handleAdminEvent(data) {
  // Remove placeholder on first message
  const placeholder = chatLog.querySelector(".placeholder-text");
  if (placeholder) placeholder.remove();

  if (data.type === "user") {
    appendMessage("user", data.text);
  } else if (data.type === "gemini") {
    appendMessage("vachana", data.text);
  } else if (data.type === "user_input") {
    // This is raw text input from citizen (if they type)
    appendMessage("user", data.text);
  } else if (data.type === "interrupted") {
    appendMessage("system", "AI INTERRUPTED BY OPERATOR");
  } else if (data.type === "dispatch") {
    appendMessage("system", `DISPATCH INITIATED: ${data.unit}`);
    addAlert(`DISPATCHED: ${data.unit}`, "danger");
  } else if (data.type === "location") {
    handleLocationUpdate(data.lat, data.lon);
  }
}

function handleLocationUpdate(lat, lon) {
  const pos = [lat, lon];
  if (!citizenMarker) {
    citizenMarker = L.marker(pos).addTo(map);
    addAlert("CITIZEN LOCATION ACQUIRED", "success");
  } else {
    citizenMarker.setLatLng(pos);
    addAlert("CITIZEN LOCATION UPDATED", "info");
  }
  map.setView(pos, 15);
  citizenMarker.bindPopup(`<b>Citizen Location</b><br>Lat: ${lat}<br>Lon: ${lon}`).openPopup();
  appendMessage("system", `LOCATION RECEIVED: [${lat}, ${lon}]`);
}

function appendMessage(type, text) {
  const msgDiv = document.createElement("div");
  const label = type === "vachana" ? "Vachana" : type === "user" ? "Citizen" : "System";
  msgDiv.className = `message ${type}`;
  msgDiv.textContent = `${label}: ${text}`;
  chatLog.appendChild(msgDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function addAlert(text, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert-item ${type}`;
  alert.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  alertsList.prepend(alert);
}

// Control Logic
takeControlBtn.onclick = () => {
  isControlling = !isControlling;
  if (isControlling) {
    takeControlBtn.textContent = "RELEASE CONTROL";
    takeControlBtn.classList.add("active");
    addAlert("OPERATOR OVERRIDE ACTIVE", "warning");
    
    // Signal backend to interrupt Gemini
    websocket.send(JSON.stringify({ type: "interrupted", source: "admin" }));
  } else {
    takeControlBtn.textContent = "TAKE CONTROL";
    takeControlBtn.classList.remove("active");
    addAlert("OPERATOR OVERRIDE RELEASED", "info");
    websocket.send(JSON.stringify({ type: "released", source: "admin" }));
  }
};

speakBtn.onclick = async () => {
  if (isSpeaking) {
    mediaHandler.stopAudio();
    isSpeaking = false;
    speakBtn.textContent = "SPEAK TO CITIZEN";
    speakBtn.classList.remove("active");
    addAlert("Voice broadcast stopped", "info");
  } else {
    try {
      await mediaHandler.startAudio((pcmData) => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          websocket.send(pcmData);
        }
      });
      isSpeaking = true;
      speakBtn.textContent = "STOP SPEAKING";
      speakBtn.classList.add("active");
      addAlert("VOICE BROADCAST ACTIVE", "warning");

      // Automatically take control if not already
      if (!isControlling) takeControlBtn.click();
    } catch (e) {
      alert("Could not access microphone: " + e.message);
    }
  }
};

// Dispatch Logic
dispatchBtns.forEach(btn => {
  btn.onclick = () => {
    const unit = btn.getAttribute("data-type");
    websocket.send(JSON.stringify({ type: "dispatch", unit: unit }));
  };
});

// Start connection
connect();
