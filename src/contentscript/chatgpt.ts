import type { injectData } from "../lib/utils";
import {
  promptTemplate,
  defaultMaxCharsToSplit,
  replaceTemplateVariables,
} from "../lib/utils";
let lang = "";
let maxCharsToSplit = defaultMaxCharsToSplit;
//let prompt = promptTemplate;
let button: HTMLButtonElement | null = null;
chrome.storage.sync.get(["lang", "prompt", "maxCharsToSplit"], (data) => {
  /*if (data && data.prompt) {
    prompt = data.prompt;
  }*/
  if (data && data.lang) {
    lang = data.lang;
  }
  if (data && data.maxCharsToSplit) {
    maxCharsToSplit = data.maxCharsToSplit;
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
      /*case "prompt":
        prompt = newValue as string;
        break;
      */
      case "lang":
        let v = newValue as string;
        if (v !== "") {
          lang = v;
        }
        break;
      case "maxCharsToSplit":
        maxCharsToSplit = newValue as number;
        break;
    }
  }
});

const splitTextAtNearestNewline = (
  text: string,
  maxChars: number,
): string[] => {
  if (text.length <= maxChars) {
    return [text, ""];
  }

  let splitIndex = text.substring(0, maxChars).lastIndexOf("\n");
  if (splitIndex === -1) {
    // 改行コードが見つからない場合は、maxCharsで分割
    splitIndex = maxChars;
  }

  return [text.substring(0, splitIndex), text.substring(splitIndex)];
};

const injectText = (text: string) => {
  const textarea = document.getElementById(
    "prompt-textarea",
  ) as HTMLTextAreaElement;
  if (!textarea) {
    console.log("textarea not found");
    return;
  }
  textarea.value = text;
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
  console.log(`injectText text: ${text} textarea:${textarea}`);
  setTimeout(() => {
    textarea.focus();
    textarea.scrollTop = textarea.scrollHeight;
  }, 1000);
};

const addButton = (
  text: string,
  prompt: string,
  title: string,
  url: string,
  no: number,
) => {
  button = document.createElement("button");
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
    const [firstPart, remainingPart] = splitTextAtNearestNewline(
      text,
      maxCharsToSplit,
    );
    const variables = {
      TITLE: title,
      CONTENT: firstPart,
      URL: url,
      SELECTED_LANGUAGE: lang,
    };
    injectText(replaceTemplateVariables(prompt, variables));
    if (button) {
      button.remove();
    }
    if (remainingPart.length > 0) {
      addButton(remainingPart.trim(), prompt, title, url, no + 1);
    }
  });
};

//console.log("load chatgpt.ts");
if (window !== window.top) {
  //console.log("window !== window.top. window: ", window);
  window.addEventListener("message", (response) => {
    const data = response.data as injectData;
    //console.log("Event data: ", data);
    if (data.source.title && data.source.text) {
      if (button) {
        button.remove();
      }
      const [firstPart, remainingPart] = splitTextAtNearestNewline(
        cleanUpText(data.source.text),
        maxCharsToSplit,
      );
      const variables = {
        TITLE: data.source.title,
        CONTENT: firstPart,
        URL: data.source.url,
        SELECTED_LANGUAGE: lang,
      };
      injectText(replaceTemplateVariables(data.prompt, variables));
      if (remainingPart.length > 0) {
        addButton(
          remainingPart.trim(),
          data.prompt,
          data.source.title,
          data.source.url,
          1,
        );
      }
    }
  });
}
