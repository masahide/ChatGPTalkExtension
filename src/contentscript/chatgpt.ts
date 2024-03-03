import type { summarySourceText } from "../lib/utils";
let promptTemplate =
  "Condense the provided text into concise bulletpoints, selecting a fitting emoji for each, and respond in {{SELECTED_LANGUAGE}} using the content: {{CONTENT}}";
let lang = "";
let prompt = promptTemplate;
chrome.storage.sync.get(["prompt", "lang"], (data) => {
  if (data && data.prompt) {
    prompt = data.prompt;
  }
  if (data && data.lang) {
    lang = data.lang;
  }
  if (lang === "") {
    const languageName = new Intl.DisplayNames(["en"], { type: "language" }).of(
      chrome.i18n.getUILanguage(),
    );
    if (languageName) {
      lang = languageName;
    }
  }
});
function replaceTemplateVariables(
  template: string,
  variables: { [key: string]: string },
): string {
  return Object.keys(variables).reduce((currentTemplate, key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    return currentTemplate.replace(regex, variables[key]);
  }, template);
}

// 文字列を修正する関数
function cleanUpText(text: string): string {
  // 行末のスペースを削除
  text = text.replace(/[ \t]+$/gm, "");
  // 連続するスペースを1つに置き換え
  //text = text.replace(/[ ]+/g, " ");
  // 連続する改行を1つの改行に置き換え
  text = text.replace(/\n+/g, "\n");
  return text;
}
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    switch (key) {
      case "prompt":
        prompt = newValue as string;
        break;
      case "lang":
        let v = newValue as string;
        if (v !== "") {
          lang = v;
        }
        break;
    }
  }
});

if (window !== window.top) {
  window.addEventListener("message", (response) => {
    const data = response.data as summarySourceText;
    if (data.title && data.text) {
      const variables = {
        TITLE: data.title,
        CONTENT: cleanUpText(data.text),
        URL: data.url,
        SELECTED_LANGUAGE: lang,
      };
      const filledPrompt = replaceTemplateVariables(promptTemplate, variables);
      const textarea = document.getElementById(
        "prompt-textarea",
      ) as HTMLTextAreaElement;
      if (!textarea) {
        console.log("textarea not found");
        return;
      }
      textarea.value = filledPrompt;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
      const length = textarea.value.length;
      textarea.selectionStart = length;
      textarea.selectionEnd = length;
      textarea.dispatchEvent(
        new Event("input", {
          bubbles: true,
          cancelable: true,
        }),
      );
      setTimeout(() => {
        textarea.focus();
        textarea.scrollTop = textarea.scrollHeight;
      }, 1000);
    }
  });
}
