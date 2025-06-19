import type { LLMAdapter } from './llm-adapter';
import { ChatGPTAdapter } from './adapters/chatgpt-adapter';
import { GeminiAdapter } from './adapters/gemini-adapter';

const availableAdapters: LLMAdapter[] = [new ChatGPTAdapter(), new GeminiAdapter()];

let activeAdapter: LLMAdapter | null = null;

export function setActiveLLMAdapter(url: string): LLMAdapter | null {
    activeAdapter = availableAdapters.find(adapter => adapter.isServiceUrl(url)) || null;
    return activeAdapter;
}

export function getActiveLLMAdapter(): LLMAdapter | null {
    return activeAdapter;
}

export async function sendPromptToActiveLLM(promptTemplate: string, pageContent: string): Promise<void> {
    const adapter = getActiveLLMAdapter();
    if (adapter) {
        await adapter.injectPrompt(promptTemplate, pageContent);
    }
}
