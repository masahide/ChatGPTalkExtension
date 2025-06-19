export interface LLMAdapter {
    getServiceName(): string;
    isServiceUrl(url: string): boolean;
    getChatInputSelector(): string;
    injectPrompt(promptTemplate: string, pageContent: string): Promise<void>;
    getSubmitButtonSelector?(): string;
}
