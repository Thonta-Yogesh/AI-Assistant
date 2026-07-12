# 🤖 AI Assistant

A full-stack AI-powered voice assistant web application built with React, Node.js, and the Google Gemini API. Speak to your personalized assistant and get intelligent, real-time responses.

![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react) ![Node](https://img.shields.io/badge/Node.js-Express-green?logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb) ![Gemini](https://img.shields.io/badge/Gemini-API-orange?logo=google)

---

## ✨ Features

- 🎙️ **Voice Recognition** — Speak naturally; the assistant listens and responds
- 🤖 **AI-Powered Responses** — Powered by Google Gemini for smart, context-aware answers
- 👤 **Personalized Assistants** — Choose a name and avatar for your assistant
- 🔐 **Authentication** — Secure Sign Up / Sign In with JWT cookies
- 💬 **Live Conversation Panel** — Real-time chat transcript on screen as you talk
- 🔊 **Dynamic Voices** — Different TTS voices based on assistant persona (Jarvis = Male British, Sara = Female US)
- 🌐 **Smart Actions** — Opens Google, YouTube, Instagram, Calculator, and more via voice
- 🌑 **Premium Dark UI** — Glassmorphism, animated stars, neon accents, and smooth transitions

---

## 🗂️ Project Structure

```
AI-Assistant/
├── backend/             # Node.js + Express API
│   ├── Config/          # DB, token, Cloudinary config
│   ├── Controllers/     # Auth & User business logic
│   ├── Models/          # Mongoose schemas
│   ├── Routes/          # API route definitions
│   ├── middleware/       # JWT auth & file upload middleware
│   ├── gemini.js        # Google Gemini API integration
│   └── index.js         # Server entry point
│
└── frontend/            # React 19 SPA
    ├── public/
    └── src/
        ├── Components/  # Reusable UI components
        ├── Contexts/    # Global state (UserContext)
        ├── pages/       # SignIn, SignUp, Customize, Home
        └── assests/     # Images & GIFs
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the repository
```bash
git clone https://github.com/Thonta-Yogesh/AI-Assistant.git
cd AI-Assistant
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
MONGODB_URL=your_mongodb_connection_string
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=YOUR_API_KEY
JWT_SECRET=your_jwt_secret_key
PORT=5005
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend:
```bash
node index.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

| Layer     | Technology                   |
|-----------|------------------------------|
| Frontend  | React 19, TailwindCSS        |
| Backend   | Node.js, Express             |
| Database  | MongoDB Atlas (Mongoose)     |
| AI        | Google Gemini API            |
| Auth      | JWT, bcryptjs, cookie-parser |
| Media     | Cloudinary                   |
| Speech    | Web Speech API (browser)     |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Made with ❤️ by Yogesh Thonta
