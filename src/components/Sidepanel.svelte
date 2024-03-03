<script lang="ts">
  import type { ArticleSnapshot, OpenAIRequest } from "../lib/utils";
  import { getSelection, toSummarySource, TextType } from "../lib/utils";
  import { onMount } from "svelte";

  const URL = "https://chat.openai.com/";
  let isIframeVisible = false;

  chrome.runtime.onMessage.addListener(async function (message, sender) {
    const snapshot = message.data as ArticleSnapshot;
    const source = toSummarySource(snapshot);
    const iframe = document.getElementById("preview") as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(source, URL);
    }
  });

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
              }, //"remove
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
    }
    if (iframe) {
      isIframeVisible = true;
    }
  };
  onMount(() => {
    open(URL);
  });
</script>

<!-- チャットメッセージ表示エリア -->
<div class="panel">
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
    <button type="button" class="btn btn-primary" on:click={getSelection}
      >Capture</button
    >
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
</style>
