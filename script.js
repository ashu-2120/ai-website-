const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const refreshBtn = document.getElementById("refreshBtn");
const refreshNotice = document.getElementById("refreshNotice");

let lastMessageCount = 0;
let typingElement = null;

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
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ✅ New: Show "typing..." bubble from AI
function showTypingMessage() {
  typingElement = document.createElement("div");
  typingElement.classList.add("message", "ai");
  typingElement.innerHTML = `
    <div class="bubble ai">Typing<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>
  `;
  chatWindow.appendChild(typingElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ✅ New: Remove "typing..." bubble
function removeTypingMessage() {
  if (typingElement) {
    chatWindow.removeChild(typingElement);
    typingElement = null;
  }
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
      chatWindow.scrollTop = chatWindow.scrollHeight;
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

  // Get current number of messages before sending
  try {
    const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
    const data = await res.json();
    lastMessageCount = data.messages.length;
  } catch (err) {
    console.error("Error fetching message count:", err);
  }

  // Add user's message immediately
  createMessage(userMsg, "user", new Date());

  // Show typing indicator
  showTypingMessage();

  // Send the user's message
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg }),
  });

  // Wait for AI to respond
  waitForNewMessages();
});

async function waitForNewMessages() {
  let retries = 10;

  while (retries-- > 0) {
    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > lastMessageCount) {
        removeTypingMessage(); // Remove "typing..." once reply is ready
        fetchMessages(); // Load full conversation
        return;
      }
    } catch (err) {
      console.error("Waiting for AI reply failed:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1s
  }

  console.warn("AI response not detected in time");
  removeTypingMessage(); // Hide typing after timeout
}

refreshBtn.addEventListener("click", fetchMessages);

// Load messages on page open
fetchMessages();
