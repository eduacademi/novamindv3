document.addEventListener("DOMContentLoaded", async () => {
  const titleInput = document.getElementById("page-title");
  const noteInput = document.getElementById("page-note");
  const saveBtn = document.getElementById("save-btn");
  const successDiv = document.getElementById("success");
  const loader = document.getElementById("loader");

  let currentTab = null;
  let scrapedMetadata = null;

  // 1. Get current active tab
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0]) {
      currentTab = tabs[0];
      titleInput.value = currentTab.title || "";
      
      // 2. Contact local server to scrape OpenGraph metadata
      loader.style.display = "block";
      const response = await fetch("http://localhost:3000/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentTab.url })
      });
      
      if (response.ok) {
        scrapedMetadata = await response.json();
        titleInput.value = scrapedMetadata.title || currentTab.title;
      }
    }
  } catch (err) {
    console.warn("Could not retrieve active tab or metadata:", err);
  } finally {
    loader.style.display = "none";
  }

  // 3. Save to NovaMind Queue
  saveBtn.addEventListener("click", async () => {
    if (!currentTab) return;

    saveBtn.disabled = true;
    saveBtn.innerText = "Kaydediliyor...";

    const payload = {
      url: currentTab.url,
      title: titleInput.value.trim() || currentTab.title,
      description: scrapedMetadata ? scrapedMetadata.description : "",
      thumbnail_url: scrapedMetadata ? scrapedMetadata.thumbnail_url : "",
      author: scrapedMetadata ? scrapedMetadata.author : "",
      platform: scrapedMetadata ? scrapedMetadata.platform : "other",
      note: noteInput.value.trim()
    };

    try {
      const saveRes = await fetch("http://localhost:3000/api/extension/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (saveRes.ok) {
        successDiv.style.display = "block";
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        alert("Kaydedilemedi. Sunucunun açık olduğundan emin olun.");
        saveBtn.disabled = false;
        saveBtn.innerText = "NovaMind'a Kaydet";
      }
    } catch (err) {
      alert("Bağlantı hatası. http://localhost:3000 açık mı?");
      saveBtn.disabled = false;
      saveBtn.innerText = "NovaMind'a Kaydet";
    }
  });
});
