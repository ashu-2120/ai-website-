const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const refreshBtn = document.getElementById("refreshBtn");
const refreshNotice = document.getElementById("refreshNotice");

// Typing indicator setup
let typingIndicator = document.createElement("div");
typingIndicator.classList.add("message", "ai");
typingIndicator.innerHTML = `<div class="bubble ai">...</div><div class="timestamp">typing...</div>`;

// Track last AI message time to detect new replies
let lastAiTimestamp = null;

// Smooth scroll
function scrollToBottomSmooth() {
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth",
  });
}

// Render message
function createMessage(text, sender, time) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender.trim());

  const timestamp = new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  msg.innerHTML = `
    <div class="bubble ${sender}">${text}</div>
    <div class="timestamp">${timestamp}</div>
  `;
  chatWindow.appendChild(msg);
  scrollToBottomSmooth();
}

// Full fetch and render
async function fetchMessages() {
  refreshNotice.style.display = "inline-block";
  chatWindow.classList.add("loading");

  try {
    const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
    const data = await res.json();

    if (data.messages) {
      chatWindow.innerHTML = "";
      data.messages.forEach((msg) => {
        createMessage(msg.message, msg.user_type, msg.datetime);
        if (msg.user_type === "ai") {
          lastAiTimestamp = msg.datetime; // update last AI reply seen
        }
      });
    }
  } catch (err) {
    console.error("Fetch failed", err);
  } finally {
    setTimeout(() => {
      refreshNotice.style.display = "none";
      chatWindow.classList.remove("loading");
    }, 1000);
  }
}

// Handle user submit
chatForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;
  chatInput.value = "";

  // Show user's message immediately
  createMessage(userMsg, "user", new Date());

  // Add typing indicator
  chatWindow.appendChild(typingIndicator);
  scrollToBottomSmooth();

  // Save current last AI reply timestamp
  const lastSeenAiTime = lastAiTimestamp;

  // Send message to backend
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg }),
  });

  // Wait for new AI reply
  let retries = 15;
  let aiReplied = false;

  while (retries-- > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      const newAiMsg = data.messages.find(
        (msg) => msg.user_type === "ai" && msg.datetime !== lastSeenAiTime
      );

      if (newAiMsg) {
        aiReplied = true;
        chatWindow.removeChild(typingIndicator);
        chatWindow.innerHTML = "";
        data.messages.forEach((msg) => createMessage(msg.message, msg.user_type, msg.datetime));
        lastAiTimestamp = newAiMsg.datetime;
        break;
      }
    } catch (err) {
      console.error("Polling for AI reply failed:", err);
    }
  }

  if (!aiReplied) {
    console.warn("AI reply not received in time");
    chatWindow.removeChild(typingIndicator);
  }
});

refreshBtn.addEventListener("click", fetchMessages);

// Load messages on page load
fetchMessages();
