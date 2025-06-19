import type { LLMAdapter } from '../llm-adapter';

export class GeminiAdapter implements LLMAdapter {
    getServiceName(): string {
        return "Gemini";
    }

    isServiceUrl(url: string): boolean {
        return url.includes("gemini.google.com");
    }

    getChatInputSelector(): string {
        return ".query-input textarea, .query-input";
    }

    getSubmitButtonSelector(): string {
        return 'button[aria-label="Send"]';
    }

    async injectPrompt(promptTemplate: string, pageContent: string): Promise<void> {
        const fullPrompt = `${promptTemplate}\n\nContext from page:\n${pageContent}`;
        const textarea = document.querySelector(this.getChatInputSelector()) as HTMLTextAreaElement | null;
        if (textarea) {
            textarea.value = fullPrompt;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
        }
    }
}
