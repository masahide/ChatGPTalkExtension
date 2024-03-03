<script lang="ts">
  import { onMount } from "svelte";

  const promptTemplate =
    "Condense the provided text into concise bulletpoints, selecting a fitting emoji for each, and respond in {{SELECTED_LANGUAGE}} using the content: {{CONTENT}}";
  let prompt = promptTemplate;
  let language = "english";
  let message: string | null = null;

  onMount(() => {
    const languageName = new Intl.DisplayNames(["en"], { type: "language" }).of(
      chrome.i18n.getUILanguage(),
    );
    if (languageName) {
      language = languageName;
    }
    chrome.storage.sync.get(["prompt", "lang"], (data) => {
      if (data && data.prompt) {
        prompt = data.prompt;
      }
      if (data && data.lang) {
        language = data.lang;
      }
    });
  });

  const handleSave = () => {
    chrome.storage.sync
      .set({
        prompt: prompt,
        lang: language,
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
  <button class="btn btn-primary" type="submit" on:click={handleSave}
    >Save</button
  >
</div>

<style>
  .prompt {
    height: 150px;
  }
</style>
