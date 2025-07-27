const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const refreshBtn = document.getElementById("refreshBtn");

let lastMessageCount = 0;
let typingIndicator;

function createMessage(text, sender, time) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender.trim());

  const timestamp = new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  msg.innerHTML = 
    <div class="bubble ${sender}">${text}</div>
    <div class="timestamp">${timestamp}</div>
  ;
  chatWindow.appendChild(msg);
  scrollToBottomSmooth();
}

function showTypingDots() {
  typingIndicator = document.createElement("div");
  typingIndicator.classList.add("message", "ai");
  typingIndicator.innerHTML = 
    <div class="bubble ai">...</div>
    <div class="timestamp">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
  ;
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

    if (data.messages) {
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

  // Send to backend
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg }),
  });

  showTypingDots();

  // Wait for AI reply
  waitForAIResponse();
});

async function waitForAIResponse() {
  let retries = 15;

  while (retries-- > 0) {
    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > lastMessageCount) {
        const newMessages = data.messages.slice(lastMessageCount);
        lastMessageCount = data.messages.length;

        removeTypingDots();

        // Show only new AI messages before full refresh
        newMessages.forEach((msg) => {
          if (msg.user_type === "ai") {
            createMessage(msg.message, msg.user_type, msg.datetime);
          }
        });

        // After short delay, refresh full chat
        setTimeout(fetchMessages, 1000);
        return;
      }
    } catch (err) {
      console.error("Waiting for AI reply failed:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.warn("AI reply not received in time");
  removeTypingDots();
}

function scrollToBottomSmooth() {
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth",
  });
}

refreshBtn.addEventListener("click", fetchMessages);

// Initial fetch
window.addEventListener("load", fetchMessages);