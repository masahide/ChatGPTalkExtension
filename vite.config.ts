import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  version: "1.0.7",
  version_name: "1.0.7",
  manifest_version: 3,
  name: "__MSG_namefull__",
  short_name: "__MSG_name__",
  description: "__MSG_description__",
  default_locale: "en",
  icons: {
    "16": "doc/icon16.png",
    "32": "doc/icon32.png",
    "48": "doc/icon48.png",
    "128": "doc/icon128.png",
  },
  action: {
    default_title: "__MSG_title__",
    default_icon: {
      "16": "doc/icon16.png",
      "32": "doc/icon32.png",
      "48": "doc/icon48.png",
      "128": "doc/icon128.png",
    },
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/contentscript/index.ts"],
      run_at: "document_start",
    },
    {
      matches: [
        "https://chatgpt.com/*",
        //"https://chatgpt.com/",
        //"https://chat.openai.com/*",
      ],
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
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
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
