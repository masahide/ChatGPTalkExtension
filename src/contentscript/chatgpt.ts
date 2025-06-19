import type { injectData } from "../lib/utils";
import { replaceTemplateVariables } from "../lib/utils";

let lang = document.documentElement.lang || navigator.language || "en";

function cleanUpText(text: string): string {
  text = text.replace(/[ \t]+$/gm, "");
  text = text.replace(/\n+/g, "\n");
  return text;
}

const splitTextAtNearestNewline = (text: string, maxChars: number): string[] => {
  if (text.length <= maxChars) {
    return [text, ""];
  }

  let splitIndex = text.substring(0, maxChars).lastIndexOf("\n");
  if (splitIndex === -1) {
    splitIndex = maxChars;
  }

  return [text.substring(0, splitIndex), text.substring(splitIndex)];
};

const injectText = (text: string, autoSend: boolean) => {
  const contentEditableElement = document.getElementById('prompt-textarea') as HTMLElement;
  if (contentEditableElement) {
    contentEditableElement.focus();

    const selection = window.getSelection();
    const range = document.createRange();
    if (selection) {
      range.selectNodeContents(contentEditableElement);
      range.collapse(false);
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  setTimeout(() => {
    contentEditableElement.scrollTop = contentEditableElement.scrollHeight;
    if (autoSend) {
      const sendButton = document.querySelector('button[data-testid="send-button"]') as HTMLElement;
      if (sendButton) {
        sendButton.click();
      }
    }
  }, 300);
};

const addButton = (text: string, prompt: string, autoSend: boolean, maxCharsToSplit: number, title: string, url: string, no: number) => {
  const button = document.createElement("button");
  button.textContent = `More.. part${no + 1}`;
  button.style.position = "fixed";
  button.style.right = "20px";
  button.style.bottom = "20px";
  button.style.backgroundColor = "#0d6efd";
  button.style.borderColor = "#0d6efd";
  button.style.color = "#fff;";
  button.style.borderRadius = "5px";
  button.style.padding = "0 5px";
  document.body.appendChild(button);

  button.addEventListener("click", () => {
    const [firstPart, remainingPart] = splitTextAtNearestNewline(text, maxCharsToSplit);
    const variables = {
      TITLE: title,
      CONTENT: firstPart,
      URL: url,
    };
    injectText(replaceTemplateVariables(prompt, variables), autoSend);
    button.remove();
    if (remainingPart.length > 0) {
      addButton(remainingPart.trim(), prompt, autoSend, maxCharsToSplit, title, url, no + 1);
    }
  });
};

if (window !== window.top) {
  window.addEventListener("message", (response) => {
    const data = response.data as injectData;
    if (data.source.title && data.source.text) {
      const [firstPart, remainingPart] = splitTextAtNearestNewline(cleanUpText(data.source.text), data.maxCharsToSplit);
      const variables = {
        TITLE: data.source.title,
        CONTENT: firstPart,
        URL: data.source.url,
        HTML: data.source.html,
        SELECTED_LANGUAGE: lang,
      };
      injectText(replaceTemplateVariables(data.prompt, variables), data.autoSend);
      if (remainingPart.length > 0) {
        addButton(remainingPart.trim(), data.prompt, data.autoSend, data.maxCharsToSplit, data.source.title, data.source.url, 1);
      }
    }
  });
}
