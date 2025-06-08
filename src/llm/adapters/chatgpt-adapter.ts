// src/llm/adapters/chatgpt-adapter.ts
import type { LLMAdapter } from '../llm-adapter';

export class ChatGPTAdapter implements LLMAdapter {
    getServiceName(): string {
        return "ChatGPT";
    }

    isServiceUrl(url: string): boolean {
        return url.includes("chat.openai.com");
    }

    getChatInputSelector(): string {
        // ChatGPTのチャット入力欄のセレクタ (例)
        return "#prompt-textarea";
    }

    async injectPrompt(promptTemplate: string, pageContent: string): Promise<void> {
        const fullPrompt = `${promptTemplate}\n\n以下は参考情報です:\n${pageContent}`;
        const textarea = document.querySelector(this.getChatInputSelector()) as HTMLTextAreaElement | null;
        if (textarea) {
            textarea.value = fullPrompt;
            textarea.dispatchEvent(new Event('input', { bubbles: true })); // 必要に応じて入力イベントを発火
            textarea.focus();
        } else {
            console.warn("ChatGPTの入力エリアが見つかりませんでした。");
        }
    }
}