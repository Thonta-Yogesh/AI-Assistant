# 🤖 AI Virtual Assistant

A full-stack, voice-enabled AI assistant web app where you pick a cute avatar, name your assistant, and have real-time conversations — by voice or text — powered by Google Gemini.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com/atlas)
[![Gemini](https://img.shields.io/badge/Google-Gemini_API-4285F4?logo=google&logoColor=white)](https://aistudio.google.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎙️ **Voice Recognition** | Continuous mic listening — speak naturally and get instant responses |
| 🤖 **Gemini AI Brain** | Google Gemini powers smart, context-aware, multi-turn conversations |
| 👤 **Personalized Avatar** | Pick a cute avatar and name your assistant anything you want |
| 🗣️ **Multi-Language** | Supports English, Hindi (हिंदी), and Telugu (తెలుగు) speech & responses |
| 🔊 **Smart TTS Voices** | Browser voice chosen automatically based on your assistant's name & language |
| 🌐 **Voice Actions** | Open Google, YouTube, Instagram, Facebook, Calculator, Weather — by voice |
| 💬 **Live Chat Panel** | Real-time conversation transcript with link previews for opened actions |
| 🔐 **JWT Auth** | Secure sign-up / sign-in with HTTP-only cookies + Authorization header fallback |
| ☁️ **Cloudinary Uploads** | Upload your own custom assistant avatar image |
| 🌑 **Premium Dark UI** | Animated stars, glassmorphism, neon glow, Orbitron font, smooth transitions |

---

## 🖥️ Screenshots

> **Sign Up → Choose Avatar → Name Your Assistant → Start Talking**

| Page | Description |
|---|---|
| `/signup` `/signin` | Auth pages with glassmorphism card design |
| `/customize` | Choose from 7 cute AI friend avatars or upload your own |
| `/customize2` | Name your assistant — this becomes the voice wake word |
| `/` (Home) | Left panel = avatar + voice controls · Right panel = chat history |

---

## 🗂️ Project Structure

```
Virtual_Assistant_Major_project/
│
├── backend/                    # Node.js + Express REST API
│   ├── Config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── token.js            # JWT generation
│   │   └── cloudinary.js       # Cloudinary image upload
│   ├── Controllers/
│   │   ├── AuthController.js   # Sign up, Login, Logout
│   │   └── UserController.js   # Get user, update assistant, Gemini chat
│   ├── Models/
│   │   └── UserModel.js        # Mongoose user schema
│   ├── Routes/
│   │   ├── AuthRoutes.js       # /api/auth/*
│   │   └── UserRoutes.js       # /api/user/*  (protected)
│   ├── middleware/
│   │   ├── isAuth.js           # JWT authentication middleware
│   │   └── multer.js           # File upload middleware
│   ├── gemini.js               # Gemini API prompt builder & caller
│   └── index.js                # Express server entry point
│
└── frontend/                   # React 19 Single Page App
    ├── public/
    │   ├── index.html
    │   ├── favicon.ico
    │   └── manifest.json
    └── src/
        ├── assets/             # 7 cute AI avatars + speaking GIF
        ├── Components/
        │   └── Card.js         # Selectable avatar card component
        ├── Contexts/
        │   └── UserContext.js  # Global auth, Gemini, backend state
        ├── pages/
        │   ├── SignUp.js
        │   ├── SignIn.js
        │   ├── Customize.js    # Step 1: choose avatar
        │   ├── Customize2.js   # Step 2: name the assistant
        │   └── Home.js         # Main voice + chat interface
        ├── App.js              # Route definitions + auth guards
        ├── index.js            # React root render
        └── index.css           # Global styles + keyframe animations
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB Atlas** account (free tier works)
- **Google Gemini API key** — [Get one here](https://aistudio.google.com/app/apikey)
- *(Optional)* **Cloudinary** account for custom avatar uploads

---

### 1. Clone the repository

```bash
git clone https://github.com/Thonta-Yogesh/AI-Assistant.git
cd AI-Assistant
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
# Database
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/VirtualAssistant

# Google Gemini (replace YOUR_KEY with your actual API key)
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=YOUR_KEY

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=5005

# Cloudinary (optional — for custom avatar uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5005`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The frontend auto-detects `NODE_ENV=development` and points to `http://localhost:5005`. In production, set `REACT_APP_BACKEND_URL` to your deployed backend URL.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, TailwindCSS 3, Axios |
| **Backend** | Node.js, Express 5, Mongoose |
| **Database** | MongoDB Atlas |
| **AI** | Google Gemini API (`gemini-2.0-flash-lite`) |
| **Authentication** | JWT, bcryptjs, cookie-parser |
| **Speech** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Media** | Cloudinary (optional custom avatar upload), Multer |
| **Fonts** | Orbitron, Inter (Google Fonts) |

---

## 🌐 API Endpoints

### Auth (`/api/auth`)
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/signup` | Register new user | ❌ |
| POST | `/signin` | Login and receive JWT cookie | ❌ |
| GET | `/logout` | Clear auth cookie | ❌ |

### User (`/api/user`)
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/current` | Get logged-in user data | ✅ |
| POST | `/update` | Update assistant name & avatar image | ✅ |
| POST | `/asktoassistant` | Send command → Gemini → get structured response | ✅ |

---

## 🗣️ Supported Voice Commands

| What you say | Action |
|---|---|
| *"Search for [topic] on Google"* | Opens Google search |
| *"Play [song] on YouTube"* | Opens YouTube results |
| *"Open Instagram / Facebook"* | Opens social media |
| *"Open calculator"* | Opens Google calculator |
| *"What's the weather in [city]"* | Opens weather search |
| *"What time is it?"* | Tells current time |
| *"What's today's date?"* | Tells current date |
| *Anything else* | General AI conversation |

---

## 🌍 Language Support

| Language | Speech Recognition | AI Response | TTS Voice |
|---|---|---|---|
| 🇬🇧 English | ✅ `en-IN` | English text | Auto-selected English voice |
| 🇮🇳 Hindi | ✅ `hi-IN` | हिंदी Devanagari | Lekha / Hindi voice (Romanized fallback) |
| 🇮🇳 Telugu | ✅ `te-IN` | తెలుగు script | Geetha / Telugu voice (Romanized fallback) |

---

## 🔧 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URL` | ✅ | MongoDB Atlas connection string |
| `GEMINI_API_URL` | ✅ | Full Gemini API URL with key |
| `JWT_SECRET` | ✅ | Secret string for signing JWTs |
| `PORT` | ❌ | Server port (default: 5005) |
| `CLOUDINARY_CLOUD_NAME` | ❌ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ❌ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ❌ | Cloudinary API secret |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Made with ❤️ by **Yogesh Thonta**
