const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const refreshBtn = document.getElementById("refreshBtn");
const refreshNotice = document.getElementById("refreshNotice");

let lastMessageCount = 0;

// Scroll smoothly
function scrollToBottomSmooth() {
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth",
  });
}

// Create a message bubble
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
}

// Show typing indicator
function showTyping() {
  const typing = document.createElement("div");
  typing.classList.add("message", "ai", "typing-indicator");
  typing.innerHTML = `<div class="bubble ai">...</div><div class="timestamp">typing...</div>`;
  chatWindow.appendChild(typing);
  scrollToBottomSmooth();
}

// Remove typing indicator
function removeTyping() {
  const typing = document.querySelector(".typing-indicator");
  if (typing) typing.remove();
}

// Fetch all messages and update UI
async function fetchMessages(fullRefresh = true) {
  try {
    const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
    const data = await res.json();

    if (data.messages && Array.isArray(data.messages)) {
      if (fullRefresh) chatWindow.innerHTML = "";

      data.messages.forEach((msg) =>
        createMessage(msg.message, msg.user_type, msg.datetime)
      );

      scrollToBottomSmooth();
      lastMessageCount = data.messages.length;
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// Handle user message submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  const timestamp = new Date().toISOString();

  // 1. Show user message immediately
  createMessage(userMsg, "user", timestamp);
  scrollToBottomSmooth();

  // 2. Send to backend
  try {
    await fetch("https://ai-website-1gto.onrender.com/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg }),
    });
  } catch (err) {
    console.error("Error sending message:", err);
    return;
  }

  // 3. Show typing indicator
  showTyping();

  // 4. Wait ~2.5s to allow AI reply to generate and save to sheet
  await new Promise((res) => setTimeout(res, 7500));

  // 5. Poll for new AI reply
  let retries = 6;
  let foundNew = false;

  while (retries-- > 0) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > lastMessageCount) {
        removeTyping();
        await fetchMessages(); // Refresh whole chat after AI reply
        foundNew = true;
        break;
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }

  if (!foundNew) {
    console.warn("AI reply not found in time.");
    removeTyping();
  }
});

// Manual refresh
refreshBtn.addEventListener("click", fetchMessages);

// Initial load
window.addEventListener("load", fetchMessages);
