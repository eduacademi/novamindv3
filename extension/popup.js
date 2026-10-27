document.addEventListener("DOMContentLoaded", async () => {
  const titleInput = document.getElementById("page-title");
  const noteInput = document.getElementById("page-note");
  const appUrlInput = document.getElementById("app-url");
  const saveBtn = document.getElementById("save-btn");

  appUrlInput.value = await getAppUrl();
  appUrlInput.addEventListener("change", () => {
    const value = appUrlInput.value.trim();
    chrome.storage.sync.set({ appUrl: /^https?:\/\//.test(value) ? value : "" });
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) titleInput.value = tab.title || "";

  saveBtn.addEventListener("click", async () => {
    if (!tab || !/^https?:\/\//.test(tab.url || "")) {
      saveBtn.innerText = "Bu sayfa kaydedilemez";
      return;
    }
    await openInNovaMind({ url: tab.url, title: titleInput.value.trim() || tab.title, note: noteInput.value.trim() });
    window.close();
  });
});
