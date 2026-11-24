const widget = document.createElement("div");
widget.className = "ai-widget";
widget.innerHTML = `
  <section class="ai-panel" id="ai-panel" aria-label="Website chat" hidden>
    <div class="ai-header">
      <div>
        <strong>Website helper</strong>
        <small>Free automated answers</small>
      </div>
      <button class="ai-close" type="button" aria-label="Close chat">×</button>
    </div>
    <div class="ai-messages" id="ai-messages" aria-live="polite">
      <p class="ai-bubble ai-bot">Hi! I’m a free, automated FAQ helper—no AI service or API is used. Ask me about services, pricing, or getting in touch.</p>
    </div>
    <form class="ai-form" id="ai-form">
      <label class="sr-only" for="ai-input">Your question</label>
      <input id="ai-input" placeholder="Type your question…" required maxlength="1000">
      <button type="submit" aria-label="Send message">➤</button>
    </form>
  </section>
  <button class="ai-launcher" type="button" aria-expanded="false" aria-controls="ai-panel">
    <span aria-hidden="true">✦</span> Ask AI
  </button>
`;
document.body.appendChild(widget);

const aiPanel = widget.querySelector("#ai-panel");
const aiLauncher = widget.querySelector(".ai-launcher");
const aiClose = widget.querySelector(".ai-close");
const aiForm = widget.querySelector("#ai-form");
const aiInput = widget.querySelector("#ai-input");
const aiMessages = widget.querySelector("#ai-messages");

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

function getReply(question) {
  const text = question
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/(\d),(?=\d)/g, "$1")
    .replace(/[^\w\s€+@.-]/g, " ");
  const packageAmounts = text.match(/\b(500|1000|2000)\b/g) || [];

  if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(text)) {
    return "Hello! I can help with common questions about our website services, pricing, and process. What would you like to know?";
  }

  if (packageAmounts.length === 1 && packageAmounts[0] === "500") {
    return "The fixed €500 Starter package includes a responsive website of up to 5 pages, contact links, and basic SEO. It does not include user accounts, login, or online payments/Stripe.";
  }

  if (packageAmounts.length === 1 && packageAmounts[0] === "1000") {
    return "The fixed €1,000 Business package includes everything in Starter, including a website of up to 5 pages, plus customer accounts and login, appointment booking, and Stripe checkout. Stripe transaction fees, hosting, and domain costs are separate.";
  }

  if (packageAmounts.length === 1 && packageAmounts[0] === "2000") {
    return "The fixed €2,000 Growth package includes everything in Business, plus a custom multi-page site, an online shop, advanced SEO, marketing and analytics integrations, and launch support. Hosting, domain costs, and Stripe transaction fees are separate.";
  }

  if (text.includes("€") || /\b(price|prices|pricing|cost|costs|how much|budget|euro|euros|package|packages)\b/.test(text)) {
    return "There are three fixed packages: €500 for up to 5 pages without accounts or online payments; €1,000 for up to 5 pages with accounts, appointment booking, and Stripe checkout; or €2,000 for the complete package, including e-commerce, advanced SEO, integrations, and launch support. Stripe transaction fees, hosting, and domain costs are separate. See the Pricing page for details.";
  }

  if (/\b(hosting|domain|domains|hosting cost)\b/.test(text)) {
    return "Domain registration, hosting, and paid third-party services are generally billed separately by their providers. See the Pricing page for details.";
  }

  if (/\b(content|copywriting|text|images|photos)\b/.test(text)) {
    return "You can provide your own text and images. Content writing or sourcing can be discussed and quoted separately.";
  }

  if (/\b(timeline|how long|when|delivery|start|process|steps)\b/.test(text)) {
    return "First, we learn about your goals and recommend a scope. You’ll receive a plan, estimated timeline, and price before work begins. The timeline depends on the agreed project.";
  }

  if (/\b(portfolio|projects|examples|work samples|client work)\b/.test(text)) {
    return "The Portfolio page shows illustrative design concepts, not completed client projects. They’re examples of creative direction.";
  }

  if (/\b(seo|search engine|google ranking|marketing|analytics|e-commerce|ecommerce|online shop|maintenance|website care|support)\b/.test(text)) {
    return "We offer SEO foundations, digital marketing setup, e-commerce websites, and ongoing website care, as well as website design and development. Hosting and third-party subscriptions are quoted separately. See the Services page for details.";
  }

  if (/\b(service|services|website|web design|web development|what do you do|what do you offer)\b/.test(text)) {
    return "We design and build responsive websites, and can help with SEO foundations, digital marketing setup, e-commerce, and website care. See the Services page for details.";
  }

  if (/\b(contact|email|phone|call|talk|speak|reach|get in touch|quote|proposal)\b/.test(text)) {
    return "Email cleanwebsiteweb@gmail.com or call +31643190569. You can also use the Contact page to tell us about your project.";
  }

  if (/\b(where|location|based|country|ireland|netherlands)\b/.test(text)) {
    return "The website describes the studio as independent, working in Ireland and beyond. For questions about your project, email cleanwebsiteweb@gmail.com.";
  }

  if (/\b(thank|thanks|bye|goodbye)\b/.test(text)) {
    return "You’re welcome! If you have another question, I’m here to help.";
  }

  return "I can answer common questions about services, starting prices, project steps, hosting, and contact details. For anything else, email cleanwebsiteweb@gmail.com or visit the Contact page.";
}

aiLauncher.addEventListener("click", () => setChatOpen(aiPanel.hidden));

aiClose.addEventListener("click", () => {
  setChatOpen(false);
  aiLauncher.focus();
});

aiForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const question = aiInput.value.trim();
  if (!question) return;

  addMessage(question, "ai-user");
  addMessage(getReply(question), "ai-bot");
  aiInput.value = "";
  aiInput.focus();
});
