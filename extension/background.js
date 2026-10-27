importScripts("shared.js");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-novamind",
    title: "NovaMind'a Kaydet",
    contexts: ["page", "link"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "save-to-novamind") return;
  const url = info.linkUrl || info.pageUrl || tab?.url;
  if (!url || !/^https?:\/\//.test(url)) return;
  await openInNovaMind({ url, title: info.linkUrl ? "" : tab?.title || "" });
});
