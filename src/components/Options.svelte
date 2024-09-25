<script lang="ts">
  import Options from "./Options.svelte";
  import { onMount } from "svelte";
  import { promptTemplate, defaultMaxCharsToSplit } from "../lib/utils";

  let prompt = promptTemplate;
  let language = "english";
  let message: string | null = null;
  let maxCharsToSplit = defaultMaxCharsToSplit;
  let optionsLanguage = "";
  let messages: { [key: string]: string } = {
    options_title: "",
    options_language: "",
    options_updated: "",
    options_prompt: "",
    options_maxCharsToSplit: "",
    options_save: "",
  };

  onMount(() => {
    const languageName = new Intl.DisplayNames(["en"], { type: "language" }).of(
      chrome.i18n.getUILanguage(),
    );
    if (languageName) {
      language = languageName;
    }
    chrome.storage.sync.get(["maxCharsToSplit"], (data) => {
      if (data && data.maxCharsToSplit) {
        maxCharsToSplit = data.maxCharsToSplit;
      }
    });
    for (const key in messages) {
      messages[key] = chrome.i18n.getMessage(key);
    }
  });

  const handleSave = () => {
    chrome.storage.sync
      .set({
        maxCharsToSplit: maxCharsToSplit,
      })
      .then(() => {
        message = "Updated!";

        setTimeout(() => {
          message = null;
        }, 2000);
      });
  };
</script>

<div class="col-md-5 col-lg-4 order-md-last">
  <h4 class="mb-5">{messages["options_title"]}</h4>
  {#if message}
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      {message}
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      ></button>
    </div>
  {/if}
  <div class="col-12">
    <label for="language" class="form-label"
      >{messages["options_language"]}:</label
    >
    <input
      type="text"
      class="form-control language"
      id="language"
      bind:value={language}
    />
  </div>
  <div class="col-12">
    <label for="prompt" class="form-label">{messages["options_prompt"]}:</label>
    <textarea
      class="form-control prompt"
      id="prompt"
      wrap="soft"
      bind:value={prompt}
    />
  </div>
  <div class="col-12">
    <label for="maxCharsToSplit" class="form-label"
      >{messages["options_maxCharsToSplit"]}</label
    >
    <input
      type="number"
      class="form-control maxCharsToSplit"
      id="maxCharsToSplit"
      bind:value={maxCharsToSplit}
    />
  </div>
  <button class="btn btn-primary" type="submit" on:click={handleSave}
    >{messages["options_save"]}</button
  >
</div>

<style>
  .prompt {
    height: 150px;
  }
</style>
