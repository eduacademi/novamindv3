// Shared helpers for the popup and the background worker.
const DEFAULT_APP_URL = "http://localhost:3000";

async function getAppUrl() {
  const { appUrl } = await chrome.storage.sync.get("appUrl");
  return (appUrl || DEFAULT_APP_URL).replace(/\/$/, "");
}

/** Opens NovaMind's share target; the web app shows the "add card" dialog prefilled. */
async function openInNovaMind({ url, title, note }) {
  const appUrl = await getAppUrl();
  const params = new URLSearchParams({ url });
  if (title) params.set("title", title);
  if (note) params.set("note", note);
  await chrome.tabs.create({ url: `${appUrl}/?${params.toString()}` });
}
