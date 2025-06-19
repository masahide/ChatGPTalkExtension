import type { injectData } from "../lib/utils";
import { replaceTemplateVariables } from "../lib/utils";

const cleanUpText = (t: string) => t.replace(/[ \t]+$/gm, "").replace(/\n+/g, "\n");

const splitTextAtNearestNewline = (text: string, maxChars: number): [string, string] => {
    if (text.length <= maxChars) return [text, ""];
    let idx = text.substring(0, maxChars).lastIndexOf("\n");
    if (idx === -1) idx = maxChars;
    return [text.substring(0, idx), text.substring(idx)];
};

function getEditor(): HTMLElement | null {
    const editor = document.querySelector(".ql-editor.textarea.new-input-ui[contenteditable='true']");
    return editor as HTMLElement | null;
}

function injectText(text: string, autoSend: boolean) {
    const editor = getEditor();
    if (!editor) return;

    editor.focus();
    editor.textContent = text;
    editor.dispatchEvent(new InputEvent("input", { bubbles: true }));

    if (autoSend) {
        const btn = document.querySelector('button[aria-label="プロンプトを送信"]') as HTMLElement | null;
        btn?.click();
    }
}

function addMoreButton(remaining: string, prompt: string, autoSend: boolean, max: number, title: string, url: string, partNo = 2) {
    const btn = document.createElement("button");
    btn.textContent = `More.. part${partNo}`;
    Object.assign(btn.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: "9999",
        background: "#0d6efd",
        color: "#fff",
        border: "none",
        padding: "5px",
    });
    document.body.appendChild(btn);

    btn.onclick = () => {
        const [first, rest] = splitTextAtNearestNewline(remaining, max);
        const vars = { TITLE: title, CONTENT: first, URL: url, HTML: "" };
        injectText(replaceTemplateVariables(prompt, vars), autoSend);
        btn.remove();
        if (rest.length) addMoreButton(rest.trim(), prompt, autoSend, max, title, url, partNo + 1);
    };
}

if (window !== window.top) {
    window.addEventListener("message", (e) => {
        const data = e.data as injectData;
        if (!data?.source?.text) return;

        const clean = cleanUpText(data.source.text);
        const [first, rest] = splitTextAtNearestNewline(clean, data.maxCharsToSplit);
        const vars = {
            TITLE: data.source.title,
            CONTENT: first,
            URL: data.source.url,
            HTML: data.source.html,
        };

        injectText(replaceTemplateVariables(data.prompt, vars), data.autoSend);

        if (rest.length) {
            addMoreButton(rest.trim(), data.prompt, data.autoSend, data.maxCharsToSplit, data.source.title, data.source.url);
        }
    });
}
