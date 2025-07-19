const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const refreshBtn = document.getElementById("refreshBtn");
const refreshNotice = document.getElementById("refreshNotice");

let lastMessageCount = 0;
let typingIndicator = null;

function createMessage(text, sender, time, scrollIntoView = false) {
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

  if (scrollIntoView) {
    msg.scrollIntoView({ behavior: "smooth", block: "start" });
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

      data.messages.forEach((msg, index) => {
        const scroll = index === data.messages.length - 1;
        createMessage(msg.message, msg.user_type, msg.datetime, scroll);
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

chatForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  chatInput.value = "";

  // Get current message count
  try {
    const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
    const data = await res.json();
    lastMessageCount = data.messages.length;
  } catch (err) {
    console.error("Error fetching message count:", err);
  }

  // Send user message
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg }),
  });

  // Show typing dots
  showTypingIndicator();

  // Wait for AI to reply
  waitForNewAIMessage();
});

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
  typingIndicator.scrollIntoView({ behavior: "smooth", block: "start" });
}

function removeTypingIndicator() {
  if (typingIndicator && typingIndicator.parentNode) {
    typingIndicator.parentNode.removeChild(typingIndicator);
    typingIndicator = null;
  }
}

async function waitForNewAIMessage() {
  let retries = 15;

  while (retries-- > 0) {
    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > lastMessageCount) {
        const newMessages = data.messages.slice(lastMessageCount);

        removeTypingIndicator();

        newMessages.forEach((msg, index) => {
          const scroll = index === newMessages.length - 1;
          createMessage(msg.message, msg.user_type, msg.datetime, scroll);
        });

        lastMessageCount = data.messages.length;
        return;
      }
    } catch (err) {
      console.error("Waiting for AI reply failed:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1s
  }

  removeTypingIndicator();
  console.warn("AI response not detected in time");
}

refreshBtn.addEventListener("click", fetchMessages);

// Initial load
fetchMessages();
