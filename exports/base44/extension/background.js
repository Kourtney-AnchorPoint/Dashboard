// Vega Background Service Worker
// Handles context menus and messaging between popup/content scripts

chrome.runtime.onInstalled.addListener(() => {
  // Right-click context menu
  chrome.contextMenus.create({
    id: "ask-vega",
    title: "✨ Ask Vega",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "vega-draft-post",
    title: "✨ Draft a LinkedIn Post with Vega",
    contexts: ["page"],
    documentUrlPatterns: ["https://www.linkedin.com/*"]
  });

  chrome.contextMenus.create({
    id: "vega-draft-reply",
    title: "✨ Draft a Reply with Vega",
    contexts: ["selection"],
    documentUrlPatterns: ["https://www.linkedin.com/*", "https://mail.google.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  let action = "";
  let selectedText = info.selectionText || "";

  if (info.menuItemId === "ask-vega") {
    action = "ask";
  } else if (info.menuItemId === "vega-draft-post") {
    action = "draft-post";
  } else if (info.menuItemId === "vega-draft-reply") {
    action = "draft-reply";
  }

  // Send to content script to open sidebar with context
  chrome.tabs.sendMessage(tab.id, {
    type: "OPEN_SIDEBAR",
    action,
    selectedText
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CALL_VEGA") {
    callVegaAPI(message.prompt, message.apiKey)
      .then(response => sendResponse({ success: true, response }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }
});

async function callVegaAPI(prompt, apiKey) {
  const SYSTEM_PROMPT = `You are Vega — the AI marketing engine and operations partner for AnchorPoint Health Systems, founded by Kourtney Rhodes.

Kourtney is a single mom from Oklahoma who built an AI company because the healthcare system almost failed her during addiction recovery. AnchorPoint's product is CensusGuard™ — a real-time AI risk scoring platform for SUD and behavioral health treatment programs.

Your voice is: authentic, passionate, real, casual-but-smart, recovery-informed, disruptive. No corporate fluff. No buzzwords. Sound like a brilliant founder texting a peer.

Brand colors: Magenta #D4159A, Purple #8844E8, Cyan #10D8F0.
Key stats: 85.8% AUC-ROC accuracy, 952,358 federal patient episodes, HIPAA Compliant, real-time (NEVER batch).

When helping with LinkedIn: write in Kourtney's authentic founder voice.
When helping with Gmail: draft professional but warm responses.
When helping with any page: be concise, direct, and actionable.

Never mention competitors. Never promise clinical validation we don't have yet. Always say REAL-TIME.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "API error");
  }

  const data = await response.json();
  return data.content[0].text;
}
