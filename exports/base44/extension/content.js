// Vega Content Script — injects sidebar into any webpage

let sidebarOpen = false;
let sidebar = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "OPEN_SIDEBAR") {
    openSidebar(message.action, message.selectedText);
  }
  if (message.type === "TOGGLE_SIDEBAR") {
    toggleSidebar();
  }
});

function toggleSidebar() {
  if (sidebarOpen) {
    closeSidebar();
  } else {
    openSidebar("general", "");
  }
}

function closeSidebar() {
  if (sidebar) {
    sidebar.style.transform = "translateX(100%)";
    setTimeout(() => {
      sidebar.remove();
      sidebar = null;
      sidebarOpen = false;
    }, 300);
  }
}

function getPageContext() {
  const url = window.location.href;
  const title = document.title;
  let context = `Page: ${title}\nURL: ${url}\n\n`;

  // LinkedIn specific
  if (url.includes("linkedin.com")) {
    const postText = document.querySelector(".feed-shared-update-v2__description")?.innerText || "";
    const profileName = document.querySelector(".text-heading-xlarge")?.innerText || "";
    if (postText) context += `LinkedIn Post Content:\n${postText}\n`;
    if (profileName) context += `Profile: ${profileName}\n`;
  }

  // Gmail specific
  if (url.includes("mail.google.com")) {
    const emailBody = document.querySelector(".a3s.aiL")?.innerText || "";
    const subject = document.querySelector(".hP")?.innerText || "";
    if (subject) context += `Email Subject: ${subject}\n`;
    if (emailBody) context += `Email Body:\n${emailBody.substring(0, 1500)}\n`;
  }

  // General page content (first 1000 chars)
  const bodyText = document.body?.innerText?.substring(0, 1000) || "";
  if (bodyText && !url.includes("linkedin.com") && !url.includes("mail.google.com")) {
    context += `Page Content (excerpt):\n${bodyText}\n`;
  }

  return context;
}

function buildPrompt(action, selectedText, userMessage) {
  const pageContext = getPageContext();
  let prompt = "";

  if (action === "draft-post") {
    prompt = `I'm on LinkedIn and want to write a post. Here's the page context:\n${pageContext}\n\nPlease draft a LinkedIn post in Kourtney's authentic founder voice for AnchorPoint/CensusGuard. Make it real, passionate, and compelling. No corporate fluff.`;
  } else if (action === "draft-reply") {
    prompt = `I want to reply to this content on ${window.location.hostname}:\n\nSelected text: "${selectedText}"\n\nPage context:\n${pageContext}\n\nDraft a reply in Kourtney's voice — authentic, smart, warm. Not salesy.`;
  } else if (action === "ask" && selectedText) {
    prompt = `The user selected this text on a webpage:\n"${selectedText}"\n\nPage: ${document.title}\nURL: ${window.location.href}\n\nThey want help with it. Assist them as Vega.`;
  } else {
    prompt = `${userMessage}\n\nCurrent page context:\n${pageContext}`;
  }

  return prompt;
}

function openSidebar(action, selectedText) {
  if (sidebar) sidebar.remove();

  sidebar = document.createElement("div");
  sidebar.id = "vega-sidebar";
  sidebar.innerHTML = `
    <div class="vega-header">
      <div class="vega-logo">✦ VEGA</div>
      <div class="vega-subtitle">AnchorPoint AI</div>
      <button class="vega-close" id="vega-close">✕</button>
    </div>
    <div class="vega-context-bar" id="vega-context-bar">
      ${getContextBadge()}
    </div>
    <div class="vega-quick-actions" id="vega-quick-actions">
      ${getQuickActions()}
    </div>
    <div class="vega-messages" id="vega-messages">
      <div class="vega-message vega-message-ai">
        <span>Hey Lyra 🖤 I'm reading the page. What do you need?</span>
      </div>
    </div>
    <div class="vega-input-area">
      <textarea id="vega-input" placeholder="Ask Vega anything..." rows="2"></textarea>
      <button id="vega-send">→</button>
    </div>
    <div class="vega-footer">Powered by AnchorPoint Health Systems</div>
  `;

  document.body.appendChild(sidebar);
  sidebarOpen = true;

  // Animate in
  setTimeout(() => {
    sidebar.style.transform = "translateX(0)";
  }, 10);

  // Event listeners
  document.getElementById("vega-close").addEventListener("click", closeSidebar);
  document.getElementById("vega-send").addEventListener("click", sendMessage);
  document.getElementById("vega-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Quick action buttons
  document.querySelectorAll(".vega-quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.action;
      handleQuickAction(act, selectedText);
    });
  });

  // Auto-trigger if opened via context menu
  if (action && action !== "general") {
    handleQuickAction(action, selectedText);
  }
}

function getContextBadge() {
  const url = window.location.href;
  if (url.includes("linkedin.com")) return `<span class="vega-badge linkedin">LinkedIn</span>`;
  if (url.includes("mail.google.com")) return `<span class="vega-badge gmail">Gmail</span>`;
  if (url.includes("wix.com") || url.includes("anchorpointhealthsystems")) return `<span class="vega-badge wix">AnchorPoint Site</span>`;
  return `<span class="vega-badge web">Web</span>`;
}

function getQuickActions() {
  const url = window.location.href;
  if (url.includes("linkedin.com")) {
    return `
      <button class="vega-quick-btn" data-action="draft-post">✍️ Draft Post</button>
      <button class="vega-quick-btn" data-action="draft-reply">💬 Draft Reply</button>
      <button class="vega-quick-btn" data-action="analyze">🔍 Analyze</button>
    `;
  }
  if (url.includes("mail.google.com")) {
    return `
      <button class="vega-quick-btn" data-action="draft-reply">✍️ Draft Reply</button>
      <button class="vega-quick-btn" data-action="summarize">📋 Summarize</button>
    `;
  }
  return `
    <button class="vega-quick-btn" data-action="summarize">📋 Summarize Page</button>
    <button class="vega-quick-btn" data-action="analyze">🔍 Analyze</button>
  `;
}

function handleQuickAction(action, selectedText) {
  const prompts = {
    "draft-post": "Draft a LinkedIn post in Kourtney's authentic founder voice about AnchorPoint or CensusGuard. Keep it real, passionate, no corporate fluff.",
    "draft-reply": `Draft a reply to this selected content in Kourtney's voice:\n"${selectedText || 'the content on screen'}"`,
    "summarize": "Summarize the key points on this page for me in 3-5 bullets.",
    "analyze": "Analyze this page — what's the key message, who's the audience, and what opportunities do you see for AnchorPoint?"
  };

  const prompt = buildPrompt(action, selectedText, prompts[action] || "Help me with this page.");
  submitToVega(prompt);
}

async function sendMessage() {
  const input = document.getElementById("vega-input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = "";
  addMessage(userMessage, "user");

  const prompt = buildPrompt("general", "", userMessage);
  await submitToVega(prompt);
}

async function submitToVega(prompt) {
  addMessage("thinking...", "ai", "vega-thinking");

  const { vegaApiKey } = await chrome.storage.sync.get("vegaApiKey");
  if (!vegaApiKey) {
    removeThinking();
    addMessage("⚠️ No API key set. Click the Vega toolbar button and add your Anthropic API key in settings.", "ai");
    return;
  }

  chrome.runtime.sendMessage(
    { type: "CALL_VEGA", prompt, apiKey: vegaApiKey },
    (response) => {
      removeThinking();
      if (response.success) {
        addMessage(response.response, "ai");
      } else {
        addMessage(`⚠️ Error: ${response.error}`, "ai");
      }
    }
  );
}

function addMessage(text, role, className = "") {
  const messages = document.getElementById("vega-messages");
  const div = document.createElement("div");
  div.className = `vega-message vega-message-${role} ${className}`;
  div.innerHTML = `<span>${text.replace(/\n/g, "<br>")}</span>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeThinking() {
  const thinking = document.querySelector(".vega-thinking");
  if (thinking) thinking.remove();
}
