const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const refreshBtn = document.getElementById("refreshBtn");
const refreshNotice = document.getElementById("refreshNotice");

let lastMessageCount = 0;

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

  // ✅ Scroll only to new message smoothly
  msg.scrollIntoView({ behavior: "smooth", block: "end" });
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

// Typing dots
function showTypingIndicator() {
  removeTypingIndicator(); // remove any old ones

  const typing = document.createElement("div");
  typing.classList.add("message", "ai", "typing-indicator");
  typing.innerHTML = `
    <div class="bubble ai">...</div>
  `;
  chatWindow.appendChild(typing);
  typing.scrollIntoView({ behavior: "smooth", block: "end" });
}

function removeTypingIndicator() {
  const existing = document.querySelector(".typing-indicator");
  if (existing) existing.remove();
}

chatForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  chatInput.value = "";

  // Show user message immediately
  createMessage(userMsg, "user", new Date().toISOString());

  // Get current message count
  try {
    const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
    const data = await res.json();
    lastMessageCount = data.messages.length;
  } catch (err) {
    console.error("Error fetching message count:", err);
  }

  // Show typing dots
  showTypingIndicator();

  // Send user message
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg }),
  });

  // Wait for AI reply
  waitForNewAIMessage();
});

async function waitForNewAIMessage() {
  let retries = 15;

  while (retries-- > 0) {
    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > lastMessageCount) {
        removeTypingIndicator();

        // ✅ Refresh and show new AI message
        await fetchMessages();

        lastMessageCount = data.messages.length;
        return;
      }
    } catch (err) {
      console.error("Waiting for AI reply failed:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  removeTypingIndicator();
  console.warn("AI response not detected in time");
}

refreshBtn.addEventListener("click", fetchMessages);

// Initial fetch
fetchMessages();
