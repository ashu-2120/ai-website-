const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const refreshBtn = document.getElementById("refreshBtn");

let lastMessageCount = 0;
let typingIndicator = null;

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

function showTypingDots() {
  removeTypingDots(); // avoid duplicates
  typingIndicator = document.createElement("div");
  typingIndicator.classList.add("message", "ai");
  typingIndicator.innerHTML = `
    <div class="bubble ai">...</div>
    <div class="timestamp">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
  `;
  chatWindow.appendChild(typingIndicator);
  scrollToBottomSmooth();
}

function removeTypingDots() {
  if (typingIndicator) {
    typingIndicator.remove();
    typingIndicator = null;
  }
}

async function fetchMessages() {
  try {
    const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
    const data = await res.json();

    if (data.messages && Array.isArray(data.messages)) {
      chatWindow.innerHTML = "";
      data.messages.forEach((msg) =>
        createMessage(msg.message, msg.user_type, msg.datetime)
      );
      lastMessageCount = data.messages.length;
    }
  } catch (err) {
    console.error("Fetch failed", err);
  }
}

chatForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  chatInput.value = "";

  // Show user message instantly
  const timestamp = new Date().toISOString();
  createMessage(userMsg, "user", timestamp);

  // Send message to backend
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg }),
  });

  showTypingDots();

  // Begin polling for AI response
  await waitForAIResponse();
});

async function waitForAIResponse() {
  let retries = 20;

  while (retries-- > 0) {
    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > lastMessageCount) {
        const newMessages = data.messages.slice(lastMessageCount);

        newMessages.forEach((msg) => {
          if (msg.user_type === "ai") {
            removeTypingDots();
            createMessage(msg.message, msg.user_type, msg.datetime);
          }
        });

        lastMessageCount = data.messages.length;

        // After showing new message, refresh full chat to be safe
        setTimeout(fetchMessages, 1000);
        return;
      }
    } catch (err) {
      console.error("Error while waiting for AI:", err);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  console.warn("AI did not reply within expected time.");
  removeTypingDots();
  fetchMessages(); // force refresh to avoid message loss
}

function scrollToBottomSmooth() {
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth",
  });
}

refreshBtn.addEventListener("click", fetchMessages);
window.addEventListener("load", fetchMessages);
