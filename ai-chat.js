const widget = document.createElement("div");
widget.className = "ai-widget";
widget.innerHTML = `
  <section class="ai-panel" id="ai-panel" aria-label="AI chat" hidden>
    <div class="ai-header">
      <div>
        <strong>Ask cleanwebsite.nl</strong>
        <small>Questions about this website</small>
      </div>
      <button class="ai-close" type="button" aria-label="Close chat">×</button>
    </div>
    <div class="ai-messages" id="ai-messages" aria-live="polite">
      <p class="ai-bubble ai-bot">Hi! Ask me anything, or ask about cleanwebsite.nl.</p>
    </div>
    <form class="ai-form" id="ai-form">
      <label class="sr-only" for="ai-input">Your question</label>
      <input id="ai-input" placeholder="Type your question…" required maxlength="1000">
      <button type="submit" aria-label="Send message">➤</button>
    </form>
  </section>
  <button class="ai-launcher" type="button" aria-expanded="false" aria-controls="ai-panel">
    <span aria-hidden="true">✦</span> Ask about this website
  </button>
`;
document.body.appendChild(widget);

const aiPanel = widget.querySelector("#ai-panel");
const aiLauncher = widget.querySelector(".ai-launcher");
const aiClose = widget.querySelector(".ai-close");
const aiForm = widget.querySelector("#ai-form");
const aiInput = widget.querySelector("#ai-input");
const aiMessages = widget.querySelector("#ai-messages");
const aiSendButton = aiForm.querySelector("button");
const conversation = [];

function setChatOpen(open) {
  aiPanel.hidden = !open;
  aiLauncher.setAttribute("aria-expanded", String(open));
  if (open) aiInput.focus();
}

function addMessage(text, className) {
  const message = document.createElement("p");
  message.className = `ai-bubble ${className}`;
  message.textContent = text;
  aiMessages.appendChild(message);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return message;
}

aiLauncher.addEventListener("click", () => setChatOpen(aiPanel.hidden));

aiClose.addEventListener("click", () => {
  setChatOpen(false);
  aiLauncher.focus();
});

aiForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = aiInput.value.trim();
  if (!question) return;

  addMessage(question, "ai-user");
  aiInput.value = "";
  aiInput.disabled = true;
  aiSendButton.disabled = true;
  const waitingMessage = addMessage("Thinking…", "ai-bot");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        history: conversation.slice(-10).map(({ role, content }) => ({
          role,
          content: content.slice(0, 1000)
        }))
      })
    });

    if (!response.headers.get("content-type")?.includes("application/json")) {
      throw new Error("The chat server isn't running here. Run `npm start`, then open http://localhost:3000.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "The chat service is temporarily unavailable.");
    }

    waitingMessage.textContent = data.reply;
    conversation.push(
      { role: "user", content: question },
      { role: "assistant", content: data.reply }
    );
  } catch (error) {
    waitingMessage.textContent = error instanceof TypeError
      ? "Can't reach the chat server. Run `npm start`, then open http://localhost:3000."
      : error instanceof Error
        ? error.message
        : "Could not reach the chat service. Please try again.";
    console.error("AI chat error:", error);
  } finally {
    aiInput.disabled = false;
    aiSendButton.disabled = false;
    aiInput.focus();
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }
});
