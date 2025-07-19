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
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });
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
    }, 500);
  }
}

chatForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  // Show user message immediately
  createMessage(userMsg, "user", new Date().toISOString());
  chatInput.value = "";

  // Send user message
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg }),
  });

  // Get current message count
  const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
  const data = await res.json();
  lastMessageCount = data.messages.length;

  // Show typing indicator
  const typing = document.createElement("div");
  typing.classList.add("message", "ai");
  typing.setAttribute("id", "typingIndicator");
  typing.innerHTML = `<div class="bubble ai">...</div>`;
  chatWindow.appendChild(typing);
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });

  // Wait for AI response
  await waitForNewMessages();
});

async function waitForNewMessages() {
  let retries = 15;

  while (retries-- > 0) {
    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > lastMessageCount) {
        document.getElementById("typingIndicator")?.remove();
        fetchMessages();
        return;
      }
    } catch (err) {
      console.error("Polling failed:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.warn("AI response timeout");
  document.getElementById("typingIndicator")?.remove();
}

refreshBtn.addEventListener("click", fetchMessages);

// Initial fetch on load
fetchMessages();
