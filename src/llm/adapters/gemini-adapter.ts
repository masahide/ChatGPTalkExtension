// src/llm/adapters/gemini-adapter.ts
import type { LLMAdapter } from '../llm-adapter';

export class GeminiAdapter implements LLMAdapter {
    getServiceName(): string {
        return "Gemini";
    }

    isServiceUrl(url: string): boolean {
        // GeminiのURLパターン (例: gemini.google.com)
        return url.includes("gemini.google.com");
    }

    getChatInputSelector(): string {
        // 2025/06/08 現在の Gemini DOM
        return ".query-input textarea, .query-input";
    }

    getSubmitButtonSelector(): string {
        // “送信” アイコンボタン
        return 'button[aria-label="Send"]';
    }

    async injectPrompt(promptTemplate: string, pageContent: string): Promise<void> {
        const fullPrompt = `${promptTemplate}\n\nContext from page:\n${pageContent}`;
        const textarea = document.querySelector(this.getChatInputSelector()) as HTMLTextAreaElement | null;
        if (textarea) {
            // Geminiの入力欄の挙動に合わせて実装 (直接value代入か、より複雑なイベント操作か)
            textarea.value = fullPrompt; // または textarea.textContent など
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
        } else {
            console.warn("Geminiの入力エリアが見つかりませんでした。");
        }
    }
}