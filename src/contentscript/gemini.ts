import { setupInjection } from "../lib/injector";

function getEditor(): HTMLElement | null {
  return document.querySelector(
    ".ql-editor.textarea.new-input-ui[contenteditable='true']",
  ) as HTMLElement | null;
}

function injectText(text: string, autoSend: boolean) {
  const editor = getEditor();
  if (!editor) return console.warn("Gemini editor not found");

  editor.focus();
  editor.textContent = text;
  editor.dispatchEvent(new InputEvent("input", { bubbles: true }));

  if (autoSend) {
    setTimeout(() => {
      const icon = document.querySelector(".send-button-icon");
      const btn = icon?.closest("button");
      btn?.click();
    }, 1000); // Wait for UI update and potential network requests
  }
}

setupInjection(injectText);
