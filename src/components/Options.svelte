<script lang="ts">
  import { onMount } from "svelte";
  import { promptTemplate, defaultMaxCharsToSplit } from "../lib/utils";

  let prompt = promptTemplate;
  let language = "english";
  let message: string | null = null;
  let maxCharsToSplit = defaultMaxCharsToSplit;

  onMount(() => {
    const languageName = new Intl.DisplayNames(["en"], { type: "language" }).of(
      chrome.i18n.getUILanguage(),
    );
    if (languageName) {
      language = languageName;
    }
    chrome.storage.sync.get(["lang", "prompt", "maxCharsToSplit"], (data) => {
      if (data && data.prompt) {
        prompt = data.prompt;
      }
      if (data && data.lang) {
        language = data.lang;
      }
      if (data && data.maxCharsToSplit) {
        maxCharsToSplit = data.maxCharsToSplit;
      }
    });
  });

  const handleSave = () => {
    chrome.storage.sync
      .set({
        prompt: prompt,
        lang: language,
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
  <h4 class="mb-5">Options Page1</h4>
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
    <label for="language" class="form-label">Language:</label>
    <input
      type="text"
      class="form-control language"
      id="language"
      bind:value={language}
    />
  </div>
  <div class="col-12">
    <label for="prompt" class="form-label">Prompt template:</label>
    <textarea
      class="form-control prompt"
      id="prompt"
      wrap="soft"
      bind:value={prompt}
    />
  </div>
  <div class="col-12">
    <label for="maxCharsToSplit" class="form-label"
      >Maximum number of characters to split a string into:</label
    >
    <input
      type="number"
      class="form-control maxCharsToSplit"
      id="maxCharsToSplit"
      bind:value={maxCharsToSplit}
    />
  </div>
  <button class="btn btn-primary" type="submit" on:click={handleSave}
    >Save</button
  >
</div>

<style>
  .prompt {
    height: 150px;
  }
</style>
