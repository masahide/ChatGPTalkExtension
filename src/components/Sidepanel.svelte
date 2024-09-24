<script lang="ts">
  import type { ArticleSnapshot, OpenAIRequest } from "../lib/utils";
  import { getSelection, toSummarySource, TextType } from "../lib/utils";
  import { onMount } from "svelte";
  import { writable, get } from "svelte/store";

  const URL = "https://chatgpt.com/";
  let isIframeVisible = false;
  let isSettingsVisible = false;
  let messages: { [key: string]: string } = {
    sidepanel_setting: "",
    sidepanel_maxCharstoSplit: "",
    sidepanel_buttonLabel: "",
    sidepanel_promptTemplate: "",
    sidepanel_autoSend: "",
    sidepanel_delete: "",
    sidepanel_addButton: "",
    sidepanel_save: "",
    sidepanel_close: "",
    sidepanel_capture: "",
  };

  // デフォルトの設定値を定義
  const defaultSettings = [
    {
      key: chrome.i18n.getMessage("default_prompt1_titile"),
      value: chrome.i18n.getMessage("default_prompt1_value"),
      autoSend: true,
    },
    {
      key: chrome.i18n.getMessage("default_prompt2_titile"),
      value: chrome.i18n.getMessage("default_prompt2_value"),
      autoSend: true,
    },
  ];

  // settings ストアをデフォルト値で初期化
  let settings =
    writable<{ key: string; value: string; autoSend: boolean }[]>(
      defaultSettings,
    );
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
            {
              source: source,
              prompt: message.prompt,
              autoSend: message.autoSend,
            },
            URL,
          );
        }
      });
    }
  };

  const capture = (value: string, autoSend: boolean) => {
    getSelection(value, autoSend);
  };

  const toggleSettings = () => {
    isSettingsVisible = !isSettingsVisible;
  };

  const addSetting = () => {
    settings.update((current) => [
      ...current,
      { key: "", value: "", autoSend: false },
    ]);
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
    for (const key in messages) {
      messages[key] = chrome.i18n.getMessage(key);
    }
  });
</script>

<!-- チャットメッセージ表示エリア -->
<div class="panel">
  {#if isSettingsVisible}
    <div class="settings-overlay bg-body">
      <h2>{messages["sidepanel_setting"]}</h2>
      <div class="mb-3">
        <label for="maxCharsToSplit" class="form-label"
          >{messages["sidepanel_maxCharstoSplit"]}</label
        >
        <input
          type="number"
          class="form-control"
          id="maxCharsToSplit"
          placeholder="Label"
          bind:value={$maxCharsToSplit}
        />
      </div>
      {#each $settings as setting, index}
        <div class="setting-item border">
          <div class="mb-2">
            <label for="key{index}" class="form-label"
              >{messages["sidepanel_buttonLabel"]}</label
            >
            <input
              type="text"
              class="form-control"
              id="key{index}"
              placeholder="Label"
              bind:value={setting.key}
            />
          </div>
          <div class="mb-2">
            <label for="Textarea{index}" class="form-label"
              >{messages["sidepanel_promptTemplate"]}</label
            >
            <textarea
              class="form-control"
              id="Textarea{index}"
              rows="3"
              bind:value={setting.value}
            ></textarea>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              bind:checked={setting.autoSend}
              id="Checked_{index}"
            />
            <label class="form-check-label" for="Checked_{index}">
              {messages["sidepanel_autoSend"]}
            </label>
          </div>
          <button
            type="button"
            class="btn btn-secondary"
            on:click={() => removeSetting(index)}
            >{messages["sidepanel_delete"]}</button
          >
        </div>
      {/each}
      <button type="button" class="btn btn-secondary" on:click={addSetting}
        >{messages["sidepanel_addButton"]}</button
      >
      <button type="button" class="btn btn-primary" on:click={saveSettings}
        >{messages["sidepanel_save"]}</button
      >
      <button type="button" class="btn btn-secondary" on:click={toggleSettings}
        >{messages["sidepanel_close"]}</button
      >
    </div>
  {/if}
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
      <button
        type="button"
        class="btn btn-primary dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {messages["sidepanel_capture"]}
      </button>
      <ul class="dropdown-menu">
        {#each $settings as setting, index}
          <li>
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              class="dropdown-item"
              href="#"
              on:click={() => capture(setting.value, setting.autoSend)}
              >{setting.key}</a
            >
          </li>
        {/each}
        <li>
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a class="dropdown-item" href="#" on:click={toggleSettings}
            >⚙ Settings</a
          >
        </li>
      </ul>
    </div>
  </div>
</div>

<style>
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
    padding: 10px;
  }
  .form-check-input {
    width: 1em;
  }
  .setting-item,
  .setting-item textarea {
    width: 100%;
    gap: 10px;
  }
  .settings-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
  }
</style>
