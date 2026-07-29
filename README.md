# 🎬 Doremon – AI-Powered Movie Tracking Assistant

An AI-powered movie companion that helps users track movies they've watched, remember their ratings and reviews, and receive personalized movie recommendations through natural conversations.

Built using **n8n workflow automation**, **OpenAI**, **Node.js**, and **Google Sheets**, the application delivers a seamless conversational experience with persistent memory.

---
## 📸 Product Screenshots
<img width="1914" height="934" alt="image" src="https://github.com/user-attachments/assets/df550492-c11b-4ca7-ab76-43bb2296c5a0" />
---
## 🚀 Features

- 🎥 Log watched movies through natural conversation
- ⭐ Store movie ratings (mandatory) and optional reviews
- 🧠 Personalized movie recommendations based on watch history
- 📚 Retrieve previously watched movies and ratings
- 💬 Real-time conversational AI interface
- ⌛ Typing indicator for better user experience
- 🔄 Automatic chat synchronization and refresh
- ☁️ Persistent storage using Google Sheets
- 🌐 Fully deployed and accessible online

---

## 🛠 Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)

### Backend
- Node.js
- Express.js

### AI & Automation
- OpenAI
- n8n Workflow Automation
- Prompt Engineering

### Database
- Google Sheets API

### Deployment
- GitHub Pages
- Render

### APIs & Integration
- REST APIs
- Webhooks
- Fetch API

---

## 🧠 How It Works

### Step 1
User sends a message through the chatbot.

↓

### Step 2
The message is sent to a Node.js backend hosted on Render.

↓

### Step 3
The backend triggers an n8n workflow.

↓

### Step 4
OpenAI processes the request.

↓

### Step 5
AI Agents:

- Extract movie name
- Validate rating
- Save watch history
- Generate recommendations
- Retrieve previous history

↓

### Step 6
Movie data is stored in Google Sheets.

↓

### Step 7
The frontend automatically refreshes and displays the AI response.

---

## 📸 Demo

> Add screenshots or a GIF here.

Example:

```
/images/homepage.png
/images/chat-demo.gif
```

---

## 📂 Project Structure

```
Movie-Tracking-Assistant/
│
├── index.html
├── style.css
├── script.js
├── server.js
├── package.json
├── README.md
└── assets/
```

---

## ✨ Key Functionalities

### Movie Tracking

Users can naturally say:

> "I watched Interstellar. 5/5"

The assistant extracts:

- Movie Name
- Rating
- Review (optional)

and saves it automatically.

---

### Smart Recommendations

Example:

> Recommend me something like Interstellar.

The assistant analyzes:

- Previous ratings
- Watch history
- User preferences

and suggests relevant movies.

---

### Watch History

Example:

> Did I like Oppenheimer?

The assistant retrieves the stored rating and review from Google Sheets.

---

## 🔑 Skills Demonstrated

- AI Workflow Automation
- Prompt Engineering
- Conversational AI
- LLM Integration
- REST API Development
- Full-Stack Web Development
- Asynchronous Programming
- Google Sheets API
- Webhooks
- UI/UX Optimization
- Cloud Deployment

---

## 📈 Future Improvements

- User Authentication
- PostgreSQL / Supabase Database
- Voice-based Interaction
- Multiple User Profiles
- Movie Posters Integration
- TMDB API Integration
- Streaming Platform Suggestions
- Semantic Search using Vector Database
- Recommendation Dashboard

---

## 👨‍💻 Author

**Ashutosh Kumar**

LinkedIn:
https://linkedin.com/in/YOUR-LINK

GitHub:
https://github.com/ashu-2120

---

⭐ If you found this project interesting, consider giving it a Star!
