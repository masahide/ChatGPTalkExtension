import { setupInjection } from "../lib/injector";

function getEditor(): HTMLElement | null {
  return document.getElementById("prompt-textarea") as HTMLElement | null;
}

function injectText(text: string, autoSend: boolean) {
  const editor = getEditor();
  if (!editor) return console.warn("ChatGPT editor not found");

  editor.focus();
  // This is a more robust way to set the value and trigger the UI update.
  // editor.value = text; -> This does not work anymore.
  document.execCommand("insertText", false, text);

  if (autoSend) {
    setTimeout(() => {
      const sendButton = document.querySelector(
        'button[data-testid="send-button"]',
      ) as HTMLElement | null;
      sendButton?.click();
    }, 300); // Wait for UI to update
  }
}

setupInjection(injectText);
