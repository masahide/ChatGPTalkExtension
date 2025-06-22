// console.log("[GeminiInjector] script loaded");
import type { injectData } from "../lib/utils";
import { MessageTo, replaceTemplateVariables } from "../lib/utils";

let lang = document.documentElement.lang || navigator.language || "en";

// 文字列を修正する関数
function cleanUpText(text: string): string {
  // 行末のスペースを削除
  text = text.replace(/[ \t]+$/gm, "");
  // 連続する改行を1つの改行に置き換え
  text = text.replace(/\n+/g, "\n");
  return text;
}

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

const injectText = (text: string, autoSend: boolean) => {
  console.log("[chatgptInjector] injectText() start", { text, autoSend });
  const editor = document.getElementById("prompt-textarea") as HTMLElement;
  if (!editor) return console.warn("ChatGPT editor not found");
  editor.focus(); // フォーカスを合わせる

  const selection = window.getSelection();
  const range = document.createRange();
  if (selection) {
    // contentEditable内のカーソル位置を取得
    range.selectNodeContents(editor);
    range.collapse(false); // カーソルを末尾に移動
    // 新しいテキストノードを作成してカーソル位置に挿入
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    // カーソルを挿入したテキストの後に移動させる
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  setTimeout(() => {
    editor.scrollTop = editor.scrollHeight;
    //console.log("autoSend", autoSend);
    if (autoSend) {
      const sendButton = document.querySelector(
        'button[data-testid="send-button"]',
      ) as HTMLElement;
      if (sendButton) {
        // console.log("sendButton", sendButton);
        sendButton.click();
      }
    }
  }, 300);
};

const addMoreButton = (
  text: string,
  prompt: string,
  autoSend: boolean,
  maxCharsToSplit: number,
  title: string,
  url: string,
  no: number,
) => {
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

  button.onclick = () => {
    const [first, rest] = splitTextAtNearestNewline(text, maxCharsToSplit);
    const vars = { TITLE: title, CONTENT: first, URL: url, HTML: "" };
    injectText(replaceTemplateVariables(prompt, vars), autoSend);
    button.remove();
    if (rest.length)
      addMoreButton(
        rest.trim(),
        prompt,
        autoSend,
        maxCharsToSplit,
        title,
        url,
        no + 1,
      );
  };
};

// console.log("load chatgpt.ts");
if (window !== window.top) {
  //console.log("window !== window.top. window: ", window);
  window.addEventListener("message", (response) => {
    const data = response.data as injectData;
    if (!data || data.to !== MessageTo.ChatWindow) {
      // console.log("data.to !== ChatWindow. data: ", data);
      return;
    }
    if (!data?.source?.text) return;
    // console.log("Event data: ", data);
    const [firstPart, remainingPart] = splitTextAtNearestNewline(
      cleanUpText(data.source.text),
      data.maxCharsToSplit,
    );
    const variables = {
      TITLE: data.source.title,
      CONTENT: firstPart,
      URL: data.source.url,
      HTML: data.source.html,
      SELECTED_LANGUAGE: lang,
    };
    injectText(replaceTemplateVariables(data.prompt, variables), data.autoSend);
    if (remainingPart.length > 0) {
      addMoreButton(
        remainingPart.trim(),
        data.prompt,
        data.autoSend,
        data.maxCharsToSplit,
        data.source.title,
        data.source.url,
        1,
      );
    }
  });
}
