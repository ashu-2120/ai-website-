const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const refreshBtn = document.getElementById("refreshBtn");
const refreshNotice = document.getElementById("refreshNotice");

let lastMessageCount = 0;

// Typing indicator element
let typingIndicator = document.createElement("div");
typingIndicator.classList.add("message", "ai");
typingIndicator.innerHTML = `<div class="bubble ai">...</div><div class="timestamp">typing...</div>`;

// Utility to scroll smoothly
function scrollToBottomSmooth() {
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth",
  });
}

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

chatForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;
  chatInput.value = "";

  // 1. Show user's message immediately
  createMessage(userMsg, "user", new Date());

  // 2. Add typing indicator
  chatWindow.appendChild(typingIndicator);
  scrollToBottomSmooth();

  // 3. Send user message
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg }),
  });

  // 4. Get current message count to detect AI response later
  let currentCount = 0;
  try {
    const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
    const data = await res.json();
    currentCount = data.messages.length;
  } catch (err) {
    console.error("Error counting messages:", err);
  }

  // 5. Poll until new message appears (AI reply)
  let retries = 12;
  let foundNew = false;

  while (retries-- > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Wait 1.5 sec
    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > currentCount) {
        foundNew = true;
        chatWindow.removeChild(typingIndicator);
        chatWindow.innerHTML = ""; // clear and reload all
        data.messages.forEach((msg) =>
          createMessage(msg.message, msg.user_type, msg.datetime)
        );
        break;
      }
    } catch (err) {
      console.error("Error polling for AI reply:", err);
    }
  }

  if (!foundNew) {
    console.warn("AI reply not received in time.");
    chatWindow.removeChild(typingIndicator);
  }
});

refreshBtn.addEventListener("click", fetchMessages);

// Initial load
fetchMessages();
