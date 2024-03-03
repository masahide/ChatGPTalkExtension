chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

/*
function setupContextMenu() {
  chrome.contextMenus.create({
    id: "summary-text",
    title: "Summary",
    contexts: ["selection"],
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});
*/

/*
chrome.contextMenus.onClicked.addListener((data) => {
  chrome.runtime.sendMessage({
    name: "summary-text",
    data: { value: data.selectionText },
  });
});
*/

/*
// https://stackoverflow.com/questions/10994324/chrome-extension-content-script-re-injection-after-upgrade-or-install
chrome.runtime.onInstalled.addListener(async () => {
  let manifest = chrome.runtime.getManifest();
  if (manifest && manifest.content_scripts) {
    for (const cs of manifest.content_scripts) {
      for (const tab of await chrome.tabs.query({ url: cs.matches })) {
        if (tab && cs.js && tab.id) {
          chrome.scripting.executeScript({
            files: cs.js,
            target: { tabId: tab.id, allFrames: cs.all_frames },
            injectImmediately: cs.run_at === "document_start",
            // world: cs.world, // uncomment if you use it in manifest.json in Chrome 111+
          });
        }
      }
    }
  }
});
*/
