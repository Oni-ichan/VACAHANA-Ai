# Vachana AI: Zero-Minute Emergency Responder 🚑🚓🚒

**Vachana AI** is a state-of-the-art emergency triage system powered by the Gemini 2.0 Live API. It provides an instantaneous, voice-first interface for citizens in distress while giving emergency dispatchers a powerful "Command Center" for live monitoring and tactical intervention.

![Vachana AI Banner](https://img.shields.io/badge/Vachana-AI-blueviolet?style=for-the-badge&logo=google-gemini)

## 🌟 Key Features

### 🎙️ Voice-First Triage
- **Ultra-Low Latency**: Real-time voice interaction using Gemini Live API.
- **Multilingual Support**: Automatically detects and responds in multiple languages to assist a diverse population.
- **Pure Voice Interface**: A clean, distraction-free UI designed for high-stress situations.

### 🎮 Admin Command Center (`/admin`)
- **Live Scripting**: Real-time transcript of the citizen's conversation with the AI.
- **Tactical GPS Map**: Visual plotting of the citizen's location as soon as they share it.
- **Take Control (Override)**: Allows a human operator to instantly silence the AI and take over the voice channel.
- **Direct Speak**: Operators can speak directly to the citizen through their own microphone.
- **Mock Dispatch**: One-click buttons to dispatch Ambulance, Police, or Fire units.

### 💎 Premium Aesthetic
- **Glassmorphism Design**: Modern, high-contrast dark mode dashboard.
- **Interactive Visuals**: Live status indicators and smooth CSS animations.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- [Google AI Studio API Key](https://aistudio.google.com/app/apikey)

### Local Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Oni-ichan/VACAHANA-Ai.git
   cd VACAHANA-Ai/Vachanagent
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**:
   Create a `.env` file in the `Vachanagent` folder:
   ```env
   GEMINI_API_KEY=your_api_key_here
   MODEL=gemini-2.0-flash-exp
   ```

4. **Run the application**:
   ```bash
   python main.py
   ```

5. **Access the Dashboards**:
   - **Citizen**: `http://localhost:8000`
   - **Admin**: `http://localhost:8000/admin`

---

## ☁️ Deployment (Render)

This project is optimized for deployment on **Render** using the provided `render.yaml` and `Dockerfile`.

1. Connect your GitHub repository to Render.
2. Create a **New Web Service**.
3. Set your `GEMINI_API_KEY` in the environment variables.
4. Render will automatically build the container and deploy.

---

## 🛠️ Tech Stack
- **Backend**: FastAPI (Python)
- **Real-time**: WebSockets & Gemini Live API
- **Frontend**: Vanilla JS, CSS3 (Glassmorphism), Leaflet.js (Maps)
- **Deployment**: Docker

## 📜 License
Apache-2.0 License

---
*Built with ❤️ for the Zero-Minute Responder Hackathon.*
