// ✅ Full updated script.js file with AI dot typing and immediate reply rendering

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
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator() {
  let existing = document.getElementById("typing");
  if (!existing) {
    const typing = document.createElement("div");
    typing.classList.add("message", "ai");
    typing.id = "typing";
    typing.innerHTML = `
      <div class="bubble ai">Typing<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>
    `;
    chatWindow.appendChild(typing);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

function removeTypingIndicator() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

async function fetchMessages() {
  refreshNotice.style.display = "inline-block";
  chatWindow.classList.add("loading");

  try {
    const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
    const data = await res.json();

    console.log("Fetched messages:", data.messages);

    if (data.messages) {
      chatWindow.innerHTML = "";
      data.messages.forEach((msg) => {
        createMessage(msg.message, msg.user_type, msg.datetime);
      });
      chatWindow.scrollTop = chatWindow.scrollHeight;
    } else {
      console.warn("No messages returned from backend");
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

  // Show user message instantly
  createMessage(userMsg, "user", new Date().toISOString());

  // Show typing indicator while waiting
  showTypingIndicator();

  // Send the user's message
  await fetch("https://ai-website-1gto.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg }),
  });

  // Wait until AI response is available
  waitForNewMessages();
});

async function waitForNewMessages() {
  let retries = 20;

  while (retries-- > 0) {
    try {
      const res = await fetch("https://ai-website-1gto.onrender.com/all-messages");
      const data = await res.json();

      if (data.messages.length > lastMessageCount) {
        removeTypingIndicator();

        // Wait for any backend delay before fetching
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await fetchMessages();
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return;
      }
    } catch (err) {
      console.error("Waiting for AI reply failed:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  console.warn("AI response not detected in time");
  removeTypingIndicator();
}

refreshBtn.addEventListener("click", fetchMessages);

// Initial fetch on load
fetchMessages();
