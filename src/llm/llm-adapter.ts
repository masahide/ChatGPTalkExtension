// src/llm/llm-adapter.ts
export interface LLMAdapter {
    /**
     * LLMサービスの名前 (例: "ChatGPT", "Gemini")
     */
    getServiceName(): string;

    /**
     * 現在のページがこのLLMのサービスページと一致するかどうかを判定します。
     * @param url 現在のページのURL
     */
    isServiceUrl(url: string): boolean;

    /**
     * チャット入力欄のDOM要素セレクタを取得します。
     */
    getChatInputSelector(): string;

    /**
     * 指定されたプロンプトとコンテキストをチャット入力欄に挿入します。
     * @param promptTemplate ユーザーが選択したプロンプトテンプレート
     * @param pageContent メインウィンドウから抽出したコンテキスト情報
     */
    injectPrompt(promptTemplate: string, pageContent: string): Promise<void>;

    /**
     * (オプション) メッセージ送信ボタンのセレクタを取得します。
     * 自動送信機能などを実装する場合に利用できます。
     */
    getSubmitButtonSelector?(): string;

    // 他にも必要な共通操作があれば追加（例：応答の取得、UI要素の監視など）
}