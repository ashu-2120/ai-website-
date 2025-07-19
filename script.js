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
  msg.scrollIntoView({ behavior: "smooth" });
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
      lastMessageCount = data.messages.length;
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

  // Show user message immediately
  const now = new Date().toISOString();
  createMessage(userMsg, "user", now);

  // Send user's message to backend
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg }),
  });

  // Show typing dots
  const typingMsg = document.createElement("div");
  typingMsg.classList.add("message", "bot");
  typingMsg.innerHTML = `<div class="bubble bot">...</div>`;
  chatWindow.appendChild(typingMsg);
  typingMsg.scrollIntoView({ behavior: "smooth" });

  // Wait for new AI message to arrive
  await waitForNewMessages(typingMsg);
});

async function waitForNewMessages(typingElement) {
  let retries = 20;
  let previousCount = lastMessageCount;

  while (retries-- > 0) {
    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > previousCount) {
        const newMessages = data.messages.slice(previousCount);
        const aiMessages = newMessages.filter((msg) => msg.user_type === "bot");

        // Remove typing dot
        typingElement.remove();

        aiMessages.forEach((msg) =>
          createMessage(msg.message, msg.user_type, msg.datetime)
        );

        lastMessageCount = data.messages.length;
        return;
      }
    } catch (err) {
      console.error("Waiting for AI reply failed:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.warn("AI response not detected in time");
  typingElement.remove();
}

refreshBtn.addEventListener("click", fetchMessages);

// Initial load
fetchMessages();
