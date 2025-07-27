const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const refreshBtn = document.getElementById("refreshBtn");
const refreshNotice = document.getElementById("refreshNotice");

let lastMessageCount = 0;
let typingIndicator = null;

// Scroll to bottom
function scrollToBottomSmooth() {
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth",
  });
}

// Create and show a message
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

// Typing Indicator
function showTypingIndicator() {
  typingIndicator = document.createElement("div");
  typingIndicator.classList.add("message", "ai");
  typingIndicator.innerHTML = `
    <div class="bubble ai">...</div>
    <div class="timestamp">${new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}</div>
  `;
  chatWindow.appendChild(typingIndicator);
  scrollToBottomSmooth();
}

function removeTypingIndicator() {
  if (typingIndicator && typingIndicator.parentNode) {
    typingIndicator.remove();
    typingIndicator = null;
  }
}

// Fetch and display all messages
async function fetchMessages() {
  refreshNotice.style.display = "inline-block";
  chatWindow.classList.add("loading");

  try {
    const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
    const data = await res.json();

    if (data.messages) {
      chatWindow.innerHTML = "";
      data.messages.forEach((msg) =>
        createMessage(msg.message, msg.user_type, msg.datetime)
      );
      lastMessageCount = data.messages.length;
    }
  } catch (err) {
    console.error("Fetch failed", err);
  } finally {
    setTimeout(() => {
      refreshNotice.style.display = "none";
      chatWindow.classList.remove("loading");
    }, 500);
  }
}

// Send user message and wait for AI
chatForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;
  chatInput.value = "";

  const now = new Date();
  createMessage(userMsg, "user", now.toISOString());

  showTypingIndicator();

  // Send user message to backend
  try {
    await fetch("https://ai-website-1gto.onrender.com/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg }),
    });
  } catch (err) {
    console.error("Send error", err);
    removeTypingIndicator();
    return;
  }

  // Wait ~2.5 seconds to allow n8n + sheet to process
  await new Promise((r) => setTimeout(r, 2500));
  await waitForAIResponse();
});

async function waitForAIResponse() {
  let retries = 6;
  let aiReceived = false;

  while (retries-- > 0) {
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > lastMessageCount) {
        const newMessages = data.messages.slice(lastMessageCount);
        lastMessageCount = data.messages.length;

        removeTypingIndicator();

        newMessages.forEach((msg) =>
          createMessage(msg.message, msg.user_type, msg.datetime)
        );

        aiReceived = true;
        break;
      }
    } catch (err) {
      console.error("Error while polling AI reply:", err);
    }
  }

  if (!aiReceived) {
    console.warn("AI did not respond in time.");
    removeTypingIndicator();
  }
}

// Manual refresh
refreshBtn.addEventListener("click", fetchMessages);

// Auto load on page open
window.addEventListener("load", fetchMessages);
