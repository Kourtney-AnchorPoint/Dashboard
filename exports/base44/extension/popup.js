// Vega Popup Script

document.addEventListener("DOMContentLoaded", async () => {
  // Load saved API key
  const { vegaApiKey } = await chrome.storage.sync.get("vegaApiKey");
  if (vegaApiKey) {
    document.getElementById("api-key-input").value = vegaApiKey;
    document.getElementById("status").textContent = "✓ API key saved";
  }

  // Open sidebar button
  document.getElementById("open-sidebar").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, {
      type: "TOGGLE_SIDEBAR",
      action: "general",
      selectedText: ""
    });
    window.close();
  });

  // Save API key
  document.getElementById("save-key").addEventListener("click", async () => {
    const key = document.getElementById("api-key-input").value.trim();
    if (!key.startsWith("sk-ant-")) {
      document.getElementById("status").textContent = "⚠️ Key should start with sk-ant-";
      document.getElementById("status").style.color = "#ff6b6b";
      return;
    }
    await chrome.storage.sync.set({ vegaApiKey: key });
    document.getElementById("status").textContent = "✓ Saved!";
    document.getElementById("status").style.color = "#10D8F0";
    setTimeout(() => {
      document.getElementById("status").textContent = "";
    }, 2000);
  });
});
