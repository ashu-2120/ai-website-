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
    }, 1000);
  }
}

chatForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  chatInput.value = "";

  // Display user message instantly
  createMessage(userMsg, "user", new Date().toISOString());

  // Send user's message
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg })
  });

  // Show typing dots
  const typingMsg = document.createElement("div");
  typingMsg.classList.add("message", "ai");
  typingMsg.innerHTML = `<div class="bubble ai">...</div>`;
  typingMsg.setAttribute("id", "typingIndicator");
  chatWindow.appendChild(typingMsg);
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });

  // Store current message count
  try {
    const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
    const data = await res.json();
    lastMessageCount = data.messages.length;
  } catch (err) {
    console.error("Error fetching message count:", err);
  }

  waitForNewMessages();
});

async function waitForNewMessages() {
  let retries = 10;

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
      console.error("Waiting for AI reply failed:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.warn("AI response not detected in time");
  document.getElementById("typingIndicator")?.remove();
}

refreshBtn.addEventListener("click", fetchMessages);

fetchMessages();
