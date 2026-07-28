chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-novamind",
    title: "NovaMind'a Kaydet",
    contexts: ["page", "link"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-novamind") {
    const url = info.linkUrl || info.pageUrl || tab.url;
    const title = tab.title || "Yeni Bağlantı";

    const payload = {
      url,
      title,
      description: "",
      note: "Sağ tık menüsü ile hızlı kaydedildi.",
      platform: "other"
    };

    try {
      await fetch("http://localhost:3000/api/extension/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      console.log("Directly saved via context menu");
    } catch (err) {
      console.error("Context menu save failed:", err);
    }
  }
});
