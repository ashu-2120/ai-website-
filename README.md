# 🎬 Ashu Bot -- AI-Powered Movie Copilot

An AI-powered conversational movie assistant that helps users **log
movies they have watched, maintain watch history, retrieve past viewing
information, and receive personalized recommendations** through natural
conversation.

The project combines a web-based chat interface with a Node.js/Express
backend, n8n workflow automation, OpenAI-powered AI agents, and Google
Sheets as a lightweight persistent data store.

> **Project status:** Fully deployed architecture with separate
> conversational and data-retrieval workflows.

------------------------------------------------------------------------

## 🌐 Live Demo

**Live Demo:** [**https://ashu-2120.github.io/ai-website-/**](https://ashu-2120.github.io/ai-website-/)

## 📸 Product

The user interacts with the assistant through a simple conversational
interface.

The assistant can understand natural messages such as:

> "I watched Interstellar yesterday. I watched it on Netflix and I'd
> rate it 4.5 out of 5."

It can then extract the relevant watch details, save them to the
watch-history sheet, and continue the conversation naturally.

------------------------------------------------------------------------

## 🧩 Core Features

-   🎥 **Natural-language movie logging**
-   ⭐ **Movie rating capture**
-   📝 Optional movie details such as platform, type, genre and running
    time
-   🧠 **Conversational context** through AI memory
-   📚 **Persistent watch history** using Google Sheets
-   🔎 Retrieval of previous conversations and watch history
-   🎯 Personalized movie recommendations based on stored history
-   🤖 Separate AI agents for conversation/intent handling and
    watch-history processing
-   🔄 Automatic frontend synchronization after an AI response
-   ⌛ Typing indicator while waiting for the AI response
-   🌐 Frontend deployed through GitHub Pages
-   ☁️ Backend deployed through Render
-   🔗 n8n webhooks used to connect the frontend/backend with the AI
    workflow

------------------------------------------------------------------------

# 🏗️ System Architecture

``` text
                         ┌──────────────────────┐
                         │      GitHub Pages    │
                         │   HTML / CSS / JS    │
                         └──────────┬───────────┘
                                    │
                         HTTP REST requests
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
                  ▼                                   ▼
        POST /send                           GET /all-messages
                  │                                   │
                  └──────────────┬────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │ Render Server  │
                         │ Node + Express │
                         └───────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
              n8n POST Webhook          n8n GET Webhook
                    │                         │
                    ▼                         ▼
             AI / Automation Flow       Google Sheets
                    │                         │
          ┌─────────┴──────────┐              │
          │                    │              │
          ▼                    ▼              │
     AI Agent 1            AI Agent 2         │
     Conversation &        Watch-history      │
     Intent handling       processing         │
          │                    │              │
          │                    ├──────► Watch History
          │                    │        Google Sheet
          │                    │
          └────────────┬───────┘
                       │
                       ▼
                User-AI Conversation
                 Google Sheet
```

------------------------------------------------------------------------

# 🔄 Two n8n Workflows

The project uses two related n8n workflows.

## 1. Main POST / Conversation Workflow

This workflow handles the actual conversation.

``` text
Frontend
   │
   ▼
Render /send
   │
   ▼
n8n POST Webhook
   │
   ▼
Wait
   │
   ▼
Conversation Log
   │
   ▼
AI Agent
   │
   ├── OpenAI Chat Model
   ├── Conversation Memory
   └── Google Sheets history retrieval
   │
   ├──────────────► AI Agent 1
   │                    │
   │                    └── Watch-history extraction/processing
   │
   ▼
Google Sheets
```

### Main AI Agent

The main AI agent is responsible for the conversational layer.

It:

-   Understands the user's intent
-   Maintains conversational context
-   Handles recommendation requests
-   Handles watch-history logging conversations
-   Retrieves existing watch-history information when required
-   Communicates naturally with the user
-   Provides the response that is ultimately displayed in the frontend

### AI Agent 1

AI Agent 1 acts as the watch-history processing layer.

Its responsibility is to analyze the main agent's output and determine
whether a complete new watch experience or an update to an existing
watch record has been identified.

For a new watch, the important fields are:

  Field          Requirement
  -------------- -------------
  Name           Required
  Genre          Required
  Rating         Required
  Type           Optional
  Platform       Optional
  Running time   Optional

The agent should **never invent missing information**.

------------------------------------------------------------------------

# 📊 Google Sheets Data Model

The project currently uses two Google Sheets within the same spreadsheet
document.

## Sheet 1 --- `user - ai conversation`

This sheet acts as the conversation log.

It stores messages exchanged between the user and the AI.

Typical information includes:

``` text
user_id
message
user_type
datetime
```

Example:

``` text
1 | I watched Interstellar yesterday... | user | 2026-09-21...
1 | Got it — Interstellar...            | ai   | 2026-09-21...
```

This provides a persistent record of the chatbot conversation.

------------------------------------------------------------------------

## Sheet 2 --- `watch history`

This sheet stores structured movie information.

Current structure:

  --------------------------------------------------------------------------------
  user id id      Datetime   name    type    Genre   Platform   rating   Running
                                                                         time
  ------- ------- ---------- ------- ------- ------- ---------- -------- ---------

  --------------------------------------------------------------------------------

Example:

  ------------------------------------------------------------------------------------------
  user id id      Datetime     name           type    Genre    Platform   rating   Running
                                                                                   time
  ------- ------- ------------ -------------- ------- -------- ---------- -------- ---------
  1       W-001   2026-09-21   Interstellar   NA      sci-fi   Netflix    4.5/5    NA

  ------------------------------------------------------------------------------------------

The structured history can then be used by the AI for future
recommendations and questions about previously watched movies.

------------------------------------------------------------------------

# 🔍 Watch-History Logic

The intended data flow is:

``` text
User says something about a movie
              │
              ▼
        AI Agent 1
              │
              ▼
       Identify intent
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
 Recommendation   Watch History
       │             │
       │             ▼
       │       Collect details
       │             │
       │             ▼
       │      Check existing history
       │             │
       │      ┌──────┴──────┐
       │      │             │
       │      ▼             ▼
       │     New         Existing
       │      │             │
       │      ▼             ▼
       │   Append          Update
       │
       ▼
  Recommendation
```

### New watch

If the movie does not already exist for the user and the required
information is available:

``` text
Name + Genre + Rating
```

the watch record is appended to the watch-history sheet.

### Existing watch

If the movie already exists, additional information can update the
existing record instead of creating another duplicate watch-history row.

For example:

``` text
Existing:
Zindagi | romantic | NA | 4/5

User:
"I watched Zindagi on Prime Video."

Result:
Zindagi | romantic | Prime Video | 4/5
```

This prevents unnecessary duplicate records.

------------------------------------------------------------------------

# 📡 GET /all-messages Workflow

The second n8n workflow is intentionally simpler.

``` text
Frontend
    │
    ▼
Render GET /all-messages
    │
    ▼
n8n Webhook1
    │
    ▼
Google Sheets
Get Row(s)
    │
    ▼
Conversation records
    │
    ▼
Render
    │
    ▼
Frontend chat window
```

### n8n GET Workflow

![n8n GET workflow](assets/n8n-get-workflow.png)

The `Webhook1` node receives a GET request and the Google Sheets node
retrieves the conversation records from:

``` text
user - ai conversation
```

The Render backend then returns the data to the frontend.

------------------------------------------------------------------------

# 🤖 n8n Integration

The main automation workflow is built visually in n8n.

![Main n8n workflow](assets/n8n-main-workflow.png)

The workflow contains components for:

-   Webhook-based API entry
-   Execution delay/wait handling
-   Conversation logging
-   OpenAI model integration
-   AI agent orchestration
-   Conversation memory
-   Google Sheets tools
-   Watch-history retrieval
-   Watch-history processing

This makes the application modular: the frontend and backend handle
communication while n8n handles the AI orchestration and automation
logic.

------------------------------------------------------------------------

# 🧠 AI Agent Responsibilities

## AI Agent 1 --- Conversation & Intent Layer

The conversational agent should:

1.  Identify the user's intent.
2.  Decide whether the user wants:
    -   Movie recommendations
    -   Watch-history logging
    -   Watch-history retrieval
    -   General conversation
3.  Maintain a warm, polite and natural conversational tone.
4.  For watch-history logging, collect available movie information.
5.  Treat:
    -   **Name**
    -   **Genre**
    -   **Rating**

    as the minimum information required to create a watch-history
    record.
6.  Treat the following as optional:
    -   Type
    -   Platform
    -   Running time
7.  Never force the user to provide every optional field.
8.  Never invent missing information.
9.  Once sufficient information is available, summarize the watch entry
    naturally.

------------------------------------------------------------------------

## AI Agent 2 --- Watch-History Data Agent

The second agent focuses on data integrity.

Its responsibilities are:

### 1. Analyze Agent 1 output

Determine whether the conversation contains:

-   A new watched movie/series
-   Additional information about an existing movie
-   No watch-history information

### 2. Check existing watch history

Before creating a new record, compare the movie against the user's
existing watch history.

### 3. New movie

If it is genuinely new and the required fields are available:

``` text
name
genre
rating
```

extract the available information and append **one** row.

### 4. Existing movie

If the movie already exists and the user provides new information:

-   Update the existing record.
-   Do not append a duplicate record.

### 5. No new information

If the user provides no new watch-history information:

-   Do not call Google Sheets.
-   Do not append a row.
-   Do not create unnecessary updates.

### Data integrity rules

-   Never guess movie information.
-   Never invent a rating.
-   Never convert recommendations into watch-history records.
-   Never treat old watch-history information as a new watch.
-   Avoid duplicate records.
-   Only write to Google Sheets when a meaningful data change has been
    identified.

------------------------------------------------------------------------

# 💬 Example Conversation

### Logging a movie

**User**

> I watched Interstellar yesterday. It was sci-fi and I watched it on
> Netflix. I'd give it 4.5 out of 5.

**Assistant**

> Got it --- Interstellar, sci-fi, rated 4.5/5 and watched on Netflix.
> I've added it to your watch history.

The structured record becomes:

``` text
Interstellar
Genre: sci-fi
Platform: Netflix
Rating: 4.5/5
```

------------------------------------------------------------------------

### Recommendation

**User**

> Recommend me something like Interstellar.

The assistant can use the stored watch history to understand the user's
preferences and provide recommendations.

No watch-history row should be created because the user did not say they
watched a new movie.

------------------------------------------------------------------------

### Updating an existing movie

**User**

> I actually watched Interstellar on Prime Video.

The system should identify Interstellar as an existing record and update
the platform rather than creating another record.

------------------------------------------------------------------------

# 🖥️ Frontend

The frontend is a lightweight conversational UI built using:

-   HTML5
-   CSS3
-   JavaScript ES6

The JavaScript client:

-   Sends messages to `/send`
-   Retrieves messages from `/all-messages`
-   Displays user and AI message bubbles
-   Shows timestamps
-   Displays a typing indicator
-   Polls for the AI response
-   Refreshes the conversation automatically
-   Supports manual refresh

------------------------------------------------------------------------

# ⚙️ Backend --- Render

The Node.js/Express server acts as a secure middleware/proxy layer
between GitHub Pages and n8n.

### POST endpoint

``` text
POST /send
```

Flow:

``` text
Frontend
   ↓
Render /send
   ↓
n8n POST Webhook
```

### GET endpoint

``` text
GET /all-messages
```

Flow:

``` text
Frontend
   ↓
Render /all-messages
   ↓
n8n GET Webhook
   ↓
Google Sheets
```

Render is used because GitHub Pages can host the frontend but cannot run
the Node.js/Express server.

------------------------------------------------------------------------

# 🛠️ Tech Stack

### Frontend

-   HTML5
-   CSS3
-   JavaScript ES6
-   Fetch API

### Backend

-   Node.js
-   Express.js
-   Axios
-   CORS
-   Body Parser

### AI & Automation

-   OpenAI
-   n8n
-   AI Agents
-   Prompt Engineering
-   Webhooks
-   Workflow orchestration

### Data

-   Google Sheets
-   Google Sheets API

### Deployment

-   GitHub Pages
-   Render
-   n8n Cloud

------------------------------------------------------------------------

# 📂 Project Structure

``` text
Movie-Copilot/
│
├── index.html
├── style.css
├── script.js
├── server.js
├── package.json
├── package-lock.json
├── README.md
│
└── assets/
    ├── n8n-main-workflow.png
    └── n8n-get-workflow.png
```

------------------------------------------------------------------------

# 🔌 API Flow

## Send a message

``` http
POST /send
Content-Type: application/json
```

Request:

``` json
{
  "message": "I watched Interstellar and rated it 4.5/5"
}
```

The Render server forwards the request to the n8n POST webhook.

------------------------------------------------------------------------

## Retrieve conversation

``` http
GET /all-messages
```

Response:

``` json
{
  "messages": [
    {
      "user_id": "1",
      "message": "Hi — I'm Doremon...",
      "user_type": "ai"
    }
  ]
}
```

The frontend uses this response to rebuild the chat interface.

------------------------------------------------------------------------

# 🚀 Deployment

### Frontend

Hosted using:

``` text
GitHub Pages
```

### Backend

Hosted using:

``` text
Render
```

### Automation

Hosted using:

``` text
n8n Cloud
```

### Data

Stored using:

``` text
Google Sheets
```

------------------------------------------------------------------------

# 🔐 Important Configuration

The following values are environment/application configuration and
should not be hardcoded into a public repository when possible:

-   n8n webhook URLs
-   API keys
-   OpenAI credentials
-   Google credentials
-   Other authentication tokens

For a production implementation, sensitive configuration should be
stored using environment variables or the credential-management system
of the relevant platform.

------------------------------------------------------------------------

# 📈 Future Improvements

-   🔐 User authentication
-   👥 Multiple user profiles
-   🗄️ PostgreSQL / Supabase database
-   🎬 TMDB API integration
-   🖼️ Movie posters
-   🎙️ Voice-based interaction
-   🔎 Semantic search
-   🧠 Vector database for personalized recommendations
-   📊 Watch-history analytics dashboard
-   📱 Mobile application
-   🎯 More advanced recommendation ranking
-   🧾 Structured review and genre extraction
-   🔄 More robust duplicate/update handling

------------------------------------------------------------------------

# 🎯 Skills Demonstrated

-   AI Workflow Automation
-   Conversational AI
-   LLM Integration
-   AI Agent Orchestration
-   Prompt Engineering
-   n8n Workflow Design
-   REST API Development
-   Webhook Integration
-   Node.js / Express
-   JavaScript
-   Asynchronous Programming
-   Google Sheets API
-   Data Structuring
-   Persistent Conversation Storage
-   Frontend Development
-   Cloud Deployment
-   Debugging distributed workflows

------------------------------------------------------------------------

# 👨‍💻 Author

**Ashutosh Kumar**

🎓 B.Tech --- Chemical Engineering, IIT Guwahati

LinkedIn:\
https://www.linkedin.com/in/ashutoshkumar21/

GitHub:\
https://github.com/ashu-2120

------------------------------------------------------------------------

⭐ If you found this project interesting, consider giving it a Star!
