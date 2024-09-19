<script lang="ts">
  import type { ArticleSnapshot, OpenAIRequest } from "../lib/utils";
  import { getSelection, toSummarySource, TextType } from "../lib/utils";
  import { onMount } from "svelte";
  import { writable, get } from "svelte/store";

  const URL = "https://chatgpt.com/";
  let isIframeVisible = false;
  let isSettingsVisible = false;

  // デフォルトの設定値を定義
  const defaultSettings = [
    { key: "要約", value: "選択したテキストを要約してください。" },
    { key: "翻訳", value: "選択したテキストを日本語に翻訳してください。" },
    // 必要に応じて他のデフォルト設定を追加
  ];

  // settings ストアをデフォルト値で初期化
  let settings = writable<{ key: string; value: string }[]>(defaultSettings);
  let maxCharsToSplit = writable<number>(1000);
  let lang = writable<string>("en");

  const open = async (currenturl: string) => {
    const iframe = document.getElementById("preview") as HTMLIFrameElement;
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [1],
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            responseHeaders: [
              {
                header: "x-frame-options",
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              },
              {
                header: "content-security-policy",
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              },
            ],
          },
          condition: {
            urlFilter: "*",
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
              chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
              chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
              chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
            ],
          },
        },
      ],
    });
    if (iframe) {
      iframe.src = currenturl;
      isIframeVisible = true;
      chrome.runtime.onMessage.addListener(async function (message, sender) {
        const snapshot = message.data as ArticleSnapshot;
        const source = toSummarySource(snapshot);
        const iframe = document.getElementById("preview") as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            { source: source, prompt: message.prompt },
            URL,
          );
        }
      });
    }
  };

  const capture = (value: string) => {
    getSelection(value);
  };

  const toggleSettings = () => {
    isSettingsVisible = !isSettingsVisible;
  };

  const addSetting = () => {
    settings.update((current) => [...current, { key: "", value: "" }]);
  };

  const removeSetting = (index: number) => {
    settings.update((current) => current.filter((_, i) => i !== index));
  };

  const saveSettings = async () => {
    const currentSettings = get(settings);
    const currentMaxCharsToSplit = get(maxCharsToSplit);
    const currentLang = get(lang);
    await chrome.storage.sync.set({
      userSettings: currentSettings,
      maxCharsToSplit: currentMaxCharsToSplit,
      lang: currentLang,
    });
    toggleSettings();
  };

  const loadSettings = async () => {
    const result = await chrome.storage.sync.get([
      "userSettings",
      "maxCharsToSplit",
      "lang",
    ]);
    if (result.userSettings) {
      settings.set(result.userSettings);
    }
    if (result.maxCharsToSplit) {
      maxCharsToSplit.set(result.maxCharsToSplit);
    }
    if (result.lang) {
      lang.set(result.lang);
    }
  };

  onMount(() => {
    open(URL);
    loadSettings();
  });
</script>

<!-- チャットメッセージ表示エリア -->
<div class="panel">
  {#if isSettingsVisible}
    <div class="options">
      <h2>設定</h2>
      <div class="setting-item">
        <label for="maxCharsToSplit">Max Chars to Split:</label>
        <input
          type="number"
          id="maxCharsToSplit"
          bind:value={$maxCharsToSplit}
        />
      </div>
      <div class="setting-item">
        <label for="lang">Language:</label>
        <input type="text" id="lang" bind:value={$lang} />
      </div>
      {#each $settings as setting, index}
        <div class="setting-item">
          <input type="text" placeholder="Key" bind:value={setting.key} />
          <textarea placeholder="Value" bind:value={setting.value}></textarea>
          <button
            type="button"
            class="btn btn-secondary"
            on:click={() => removeSetting(index)}>削除</button
          >
        </div>
      {/each}
      <button type="button" class="btn btn-secondary" on:click={addSetting}
        >設定項目を追加</button
      >
      <button type="button" class="btn btn-secondary" on:click={saveSettings}
        >保存</button
      >
      <button type="button" class="btn btn-secondary" on:click={toggleSettings}
        >閉じる</button
      >
    </div>
  {:else}
    <div class="mainContent">
      <!-- svelte-ignore a11y-missing-attribute -->
      <iframe
        id="preview"
        class="preview"
        style:display={isIframeVisible ? "block" : "none"}
        allow="camera; clipboard-write; fullscreen; microphone; geolocation"
      ></iframe>
    </div>
    <div class="footer">
      <!-- チャットメッセージの例 -->
      <div class="chat-message bot-message bg-secondary-subtle"></div>
      <div class="button-group">
        {#each $settings as setting, index}
          <button
            type="button"
            class="btn btn-primary"
            on:click={() => capture(setting.value)}
          >
            {setting.key}
          </button>
        {/each}
      </div>
      <button type="button" class="btn btn-secondary" on:click={toggleSettings}
        >⚙</button
      >
    </div>
  {/if}
</div>

<style>
  .options {
    padding: 10px;
    margin: 10px;
  }
  .panel {
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin: 0;
  }
  .mainContent {
    flex: 1 1 auto; /*残りの領域全体を占有する*/
    /*padding: 20px;*/
    position: relative;
  }
  iframe {
    border: none;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    margin: 0px;
  }
  .preview {
    border: 0;
  }
  .footer {
    flex: 0 0 auto; /*固定の高さにする*/
    padding: 10px;
    text-align: center;
  }
  .setting-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
  }
  .setting-item input,
  .setting-item textarea {
    width: 100%;
  }
  .button-group {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 10px;
  }
</style>
