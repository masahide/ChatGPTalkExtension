// src/llm/llm-service.ts
import type { LLMAdapter } from './llm-adapter';
import { ChatGPTAdapter } from './adapters/chatgpt-adapter';
import { GeminiAdapter } from './adapters/gemini-adapter';
// 将来的に他のLLMアダプターもインポート

// 利用可能な全アダプターのリスト
const availableAdapters: LLMAdapter[] = [
    new ChatGPTAdapter(),
    new GeminiAdapter(),
    // 新しいLLMアダプターをここに追加
];

let activeAdapter: LLMAdapter | null = null;

/**
 * 現在のURLに基づいてアクティブなLLMアダプターを決定します。
 * @param url 現在のページのURL
 * @returns アクティブなLLMアダプター、見つからなければnull
 */
export function setActiveLLMAdapter(url: string): LLMAdapter | null {
    activeAdapter = availableAdapters.find(adapter => adapter.isServiceUrl(url)) || null;
    if (activeAdapter) {
        console.log(`Active LLM Service: ${activeAdapter.getServiceName()}`);
    } else {
        console.log("No LLM service detected for this page.");
    }
    return activeAdapter;
}

/**
 * 現在アクティブなLLMアダプターを取得します。
 * @returns アクティブなLLMアダプター、またはnull
 */
export function getActiveLLMAdapter(): LLMAdapter | null {
    return activeAdapter;
}

/**
 * 現在アクティブなLLMにプロンプトを送信（挿入）します。
 * @param promptTemplate プロンプトテンプレート
 * @param pageContent ページコンテキスト
 */
export async function sendPromptToActiveLLM(promptTemplate: string, pageContent: string): Promise<void> {
    const adapter = getActiveLLMAdapter();
    if (adapter) {
        try {
            await adapter.injectPrompt(promptTemplate, pageContent);
        } catch (error) {
            console.error(`Error injecting prompt to ${adapter.getServiceName()}:`, error);
            // TODO: ユーザーへのエラー通知
        }
    } else {
        console.warn("No active LLM adapter to send prompt to.");
        // TODO: ユーザーへの通知（例：対応LLMのページを開いてください）
    }
}