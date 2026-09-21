# 🎬 Ashu Bot – AI Movie Copilot

**Live Demo:** [**https://ashu-2120.github.io/ai-website-/**](https://ashu-2120.github.io/ai-website-/)

An AI-powered conversational movie assistant that lets users **log movies, maintain watch history, retrieve past viewing information, and get personalized recommendations** through natural conversation.

Built with **n8n, OpenAI, Node.js, Express, and Google Sheets**.

---

## 🚀 What It Does

- 🎥 Log watched movies through natural conversation
- ⭐ Capture ratings and movie details
- 🧠 Remember and retrieve watch history
- 🎯 Generate recommendations based on previous watches
- 🔄 Automatically sync conversations with the frontend
- 🤖 Use AI agents for intent handling and structured watch-history processing

Example:

> **User:** I watched Interstellar yesterday on Netflix. I'd rate it 4.5/5.  
> **Ashu Bot:** Got it — Interstellar, sci-fi, rated 4.5/5 and watched on Netflix. I've added it to your history.

---

## 🏗️ Architecture

```text
GitHub Pages
     │
     ▼
Node.js + Express (Render)
     │
     ├──────── POST /send ────────► n8n POST Workflow
     │                                  │
     │                                  ▼
     │                             AI Agents + OpenAI
     │                                  │
     │                                  ▼
     │                            Google Sheets
     │
     └────── GET /all-messages ──► n8n GET Workflow
                                        │
                                        ▼
                                  Google Sheets
```

### Why the architecture?

The frontend handles the user experience, Render acts as the API layer, and **n8n handles the AI orchestration and automation**. This keeps the conversational logic independent from the frontend.

---

## 🤖 AI Workflow

The main n8n workflow uses two AI layers:

### AI Agent 1 — Conversation & Intent

Handles the user-facing conversation.

It:
- Identifies the user's intent
- Handles recommendations and watch-history logging
- Collects movie information naturally
- Uses conversation memory and existing watch history
- Responds in a friendly conversational style

### AI Agent 2 — Watch History

Acts as the structured data layer.

It:
- Detects new watch-history information
- Checks existing records
- Extracts structured movie details
- Appends a new record only when appropriate
- Avoids unnecessary duplicate entries
- Updates existing information when new details are provided

Minimum information for a new watch record:

```text
Name + Genre + Rating
```

Additional fields such as **Type, Platform, and Running Time** are optional.

---

## 🔗 n8n Integration

### Main AI Workflow

![Main n8n workflow](assets/n8n-main-workflow.png)

### GET /all-messages Workflow

![GET workflow](assets/n8n-get-workflow.png)

The GET workflow retrieves conversation records from Google Sheets and sends them back through Render to the frontend.

---

## 📊 Data Storage

Two Google Sheets are used:

### `user - ai conversation`

Stores the conversational history:

```text
user_id | message | user_type | datetime
```

### `watch history`

Stores structured movie information:

```text
user_id | id | datetime | name | type | genre | platform | rating | running_time
```

This separation allows the AI to maintain a full conversation log while keeping watch history structured and queryable.

---

## 🛠️ Tech Stack

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express.js
- Axios

**AI & Automation**
- OpenAI
- n8n
- AI Agents
- Prompt Engineering
- Webhooks

**Storage**
- Google Sheets API

**Deployment**
- GitHub Pages
- Render
- n8n Cloud

---

## 📂 Project Structure

```text
Movie-Copilot/
├── index.html
├── style.css
├── script.js
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── assets/
    ├── n8n-main-workflow.png
    └── n8n-get-workflow.png
```

---

## 💡 Key Engineering Highlights

- Designed an end-to-end **AI automation workflow**
- Integrated frontend, backend, webhooks, LLMs and Google Sheets
- Built multi-agent logic for conversational and structured-data tasks
- Implemented persistent conversation and watch-history storage
- Added asynchronous response polling between the frontend and backend
- Designed logic to reduce duplicate watch-history records

---

## 🔮 Future Improvements

- TMDB API integration
- User authentication and multiple profiles
- PostgreSQL / Supabase database
- Semantic search and vector-based recommendations
- Voice interaction
- Watch-history analytics dashboard

---

## 👨‍💻 Author

**Ashutosh Kumar**

[LinkedIn](https://www.linkedin.com/in/ashutoshkumar21/) · [GitHub](https://github.com/ashu-2120)

⭐ If you find the project interesting, consider giving it a Star.
