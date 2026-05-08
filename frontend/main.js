// --- Main Application Logic ---

const statusDiv = document.getElementById("status");
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const sessionEndSection = document.getElementById("session-end-section");
const restartBtn = document.getElementById("restartBtn");
const micBtn = document.getElementById("micBtn");
const locationBtn = document.getElementById("locationBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const connectBtn = document.getElementById("connectBtn");
const chatLog = document.getElementById("chat-log");

let currentGeminiMessageDiv = null;
let currentUserMessageDiv = null;
let isAiOverridden = false;

const mediaHandler = new MediaHandler();
const geminiClient = new GeminiClient({
  onOpen: () => {
    statusDiv.textContent = "Connected";
    statusDiv.className = "status connected";
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    // Send hidden instruction
    geminiClient.sendText(
      `System: Introduce yourself as Vachana AI.
       Suggest playing with features like the native audio for accents and multilingual support.
       Keep the intro concise and friendly.`
    );
  },
  onMessage: (event) => {
    if (typeof event.data === "string") {
      try {
        const msg = JSON.parse(event.data);
        handleJsonMessage(msg);
      } catch (e) {
        console.error("Parse error:", e);
      }
    } else {
      // Could be AI audio OR Admin audio
      mediaHandler.playAudio(event.data);
    }
  },
  onClose: (e) => {
    console.log("WS Closed:", e);
    statusDiv.textContent = "Disconnected";
    statusDiv.className = "status disconnected";
    showSessionEnd();
  },
  onError: (e) => {
    console.error("WS Error:", e);
    statusDiv.textContent = "Connection Error";
    statusDiv.className = "status error";
  },
});

function handleJsonMessage(msg) {
  if (msg.type === "interrupted") {
    mediaHandler.stopAudioPlayback();
    currentGeminiMessageDiv = null;
    currentUserMessageDiv = null;
    if (msg.source === "admin") {
      isAiOverridden = true;
      appendMessage("system", "OPERATOR HAS TAKEN CONTROL");
    }
  } else if (msg.type === "released") {
    isAiOverridden = false;
    appendMessage("system", "OPERATOR HAS RELEASED CONTROL TO AI");
  } else if (msg.type === "turn_complete") {
    currentGeminiMessageDiv = null;
    currentUserMessageDiv = null;
  } else if (msg.type === "user") {
    if (currentUserMessageDiv) {
      currentUserMessageDiv.textContent += msg.text;
      chatLog.scrollTop = chatLog.scrollHeight;
    } else {
      currentUserMessageDiv = appendMessage("user", msg.text);
    }
  } else if (msg.type === "gemini") {
    if (currentGeminiMessageDiv) {
      currentGeminiMessageDiv.textContent += msg.text;
      chatLog.scrollTop = chatLog.scrollHeight;
    } else {
      currentGeminiMessageDiv = appendMessage("vachana", msg.text);
    }
  }
}

function appendMessage(type, text) {
  const msgDiv = document.createElement("div");
  const label = type === "vachana" ? "Vachana" : type === "user" ? "You" : type;
  msgDiv.className = `message ${type}`;
  msgDiv.textContent = `${label}: ${text}`;
  chatLog.appendChild(msgDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
  return msgDiv;
}

// Connect Button Handler
connectBtn.onclick = async () => {
  statusDiv.textContent = "Connecting...";
  connectBtn.disabled = true;

  try {
    // Initialize audio context on user gesture
    await mediaHandler.initializeAudio();

    geminiClient.connect();
  } catch (error) {
    console.error("Connection error:", error);
    statusDiv.textContent = "Connection Failed: " + error.message;
    statusDiv.className = "status error";
    connectBtn.disabled = false;
  }
};

// UI Controls
disconnectBtn.onclick = () => {
  geminiClient.disconnect();
};

locationBtn.onclick = () => {
  if (navigator.geolocation) {
    locationBtn.textContent = "Locating...";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (geminiClient.isConnected()) {
          geminiClient.sendText(
            JSON.stringify({
              type: "location",
              lat: latitude,
              lon: longitude,
            })
          );
          appendMessage("system", "LOCATION SHARED: GPS Coordinates sent.");
          locationBtn.textContent = "Location Shared";
          locationBtn.disabled = true;
        }
      },
      (error) => {
        alert("Error getting location: " + error.message);
        locationBtn.textContent = "Share Location";
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};

micBtn.onclick = async () => {
  if (mediaHandler.isRecording) {
    mediaHandler.stopAudio();
    micBtn.textContent = "Start Mic";
  } else {
    try {
      await mediaHandler.startAudio((data) => {
        if (geminiClient.isConnected() && !isAiOverridden) {
          geminiClient.send(data);
        }
      });
      micBtn.textContent = "Stop Mic";
    } catch (e) {
      alert("Could not start audio capture");
    }
  }
};

function resetUI() {
  authSection.classList.remove("hidden");
  appSection.classList.add("hidden");
  sessionEndSection.classList.add("hidden");

  mediaHandler.stopAudio();

  micBtn.textContent = "Start Mic";
  locationBtn.textContent = "Share Location";
  locationBtn.disabled = false;
  chatLog.innerHTML = "";
  connectBtn.disabled = false;
}

function showSessionEnd() {
  appSection.classList.add("hidden");
  sessionEndSection.classList.remove("hidden");
  mediaHandler.stopAudio();
}

restartBtn.onclick = () => {
  resetUI();
};
