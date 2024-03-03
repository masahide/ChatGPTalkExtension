import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "ChatGPTalk Sideber",
  description:
    "Capture web text, summarize, paste with prompts. Simplifies YouTube transcriptions. THIS EXTENSION IS FOR BETA TESTING.",
  version: "1.0.0",
  version_name: "1.0.0 beta",
  action: {
    default_title: "Click to open panel",
  },
  options_ui: {
    page: "src/options/index.html",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/contentscript/index.ts"],
      run_at: "document_start",
    },
    {
      matches: ["https://chat.openai.com/*"],
      js: ["src/contentscript/chatgpt.ts"],
      all_frames: true,
      run_at: "document_idle",
    },
  ],
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  background: {
    service_worker: "src/background/index.ts",
  },
  offline_enabled: true,
  host_permissions: ["<all_urls>"],
  permissions: [
    "storage",
    "sidePanel",
    "tabs",
    "declarativeNetRequestWithHostAccess",
    //"scripting", // https://stackoverflow.com/questions/10994324/chrome-extension-content-script-re-injection-after-upgrade-or-install
    //"activeTab",
    //"contextMenus",
    //"unlimitedStorage",
    //"alarms",
  ],
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    /*
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
          dest: ".",
        },
        {
          src: "node_modules/bootstrap/dist/css/bootstrap.min.css",
          dest: ".",
        },
      ],
    }),
    */
    svelte(),
    crx({ manifest }),
  ],
});
