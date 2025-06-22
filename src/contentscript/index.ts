import { Readability } from "@mozilla/readability";
import type { ArticleSnapshot } from "../lib/utils";
import { MessageType, MessageTo, ArticleSnapshotType } from "../lib/utils";

type Article = {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  dir: string;
  siteName: string;
  lang: string;
  publishedTime: string;
};

// @mozilla/readability を使用して本文を抽出する関数
function extractContent(): ArticleSnapshot {
  let article: Article | null = null;
  try {
    const documentClone = document.cloneNode(true) as Document;
    article = new Readability(documentClone).parse();
  } catch (e) {
    console.log("readability error", e);
    const s =
      window.document.body.querySelector("main") || window.document.body;
    if (s) {
      article = {
        title: window.document.title,
        content: s.innerHTML,
        textContent: s.innerText,
        length: s.innerHTML.length,
        excerpt: "",
        byline: "",
        dir: "",
        siteName: "",
        lang: "",
        publishedTime: "",
      };
    }
  }
  if (article) {
    return {
      title: article.title,
      url: window.location.href,
      type: ArticleSnapshotType.FullText,
      content: article.content,
      textContent: article.textContent,
      id: "",
    };
  }
  return {
    title: window.document.title,
    url: window.location.href,
    type: ArticleSnapshotType.FullText,
    content: window.document.body.innerHTML,
    textContent: window.document.body.innerText,
    id: "",
  };
}

function getVideoID(e: string): string | null {
  let t =
      /^(https?:)?(\/\/)?((www\.|m\.)?youtube(-nocookie)?\.com\/(?:embed\/)?((watch)?\?(\w+=\w*&)*vi?=|embed\/|vi?\/|e\/)|youtu.be\/)([\w-]{10,20})/i,
    r = e.match(t);
  return r ? r[9] : null;
}
async function getSubtitles(e: string) {
  try {
    return await (await fetch(e)).text();
  } catch {
    return "";
  }
}
async function getTranscription() {
  var i;
  let videoID = getVideoID(window.location.href);
  if (!videoID) {
    console.warn("No video ID found in the URL.");
    return;
  }
  let youtubeRes = await fetch(`https://www.youtube.com/watch?v=${videoID}`, {
    credentials: "omit",
  }).then((res) => res.text());
  if (!youtubeRes) return;
  let jsonStrs = youtubeRes.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
  if (!jsonStrs) {
    console.warn("No ytInitialPlayerResponse found in the page source.");
    return;
  }
  let data = JSON.parse(jsonStrs[1]);
  if (!data) return;

  let button = document.querySelector(
    ".ytp-subtitles-button",
  ) as HTMLButtonElement | null;
  //console.log("ytp-subtitles-button", button);
  if (!button) return;
  let r = document.querySelector(".ytp-subtitles-button-icon");
  //console.log("ytp-subtitles-button-icon", r, r?.getAttribute("fill-opacity"));
  if (!(!r || r.getAttribute("fill-opacity") != "1")) {
    try {
      //console.log("try click button");
      const subtitles = await new Promise((resolve, reject) => {
        let subtitleMessageListener = async (o: any) => {
          if (o.type === MessageType.GetSubTitlesURL) {
            chrome.runtime.onMessage.removeListener(subtitleMessageListener);
            resolve(await getSubtitles(o.url));
          }
        };
        chrome.runtime.onMessage.addListener(subtitleMessageListener);
        //console.log("!click button");
        button.click();
        button.click();
        setTimeout(() => {
          chrome.runtime.onMessage.removeListener(subtitleMessageListener);
          console.log("Timed out waiting for subtitle URL");
          reject(new Error("Timed out waiting for subtitle URL"));
        }, 5000);
      });
      return {
        url: window.location.href,
        title: data.videoDetails.title,
        type: ArticleSnapshotType.Youtube,
        content: subtitles as string,
        textContent: "",
        id: videoID,
      };
    } catch (err) {
      console.log("catch err", err);
      try {
        let n =
          (i = data.captions.playerCaptionsTracklistRenderer.captionTracks) ==
          null
            ? void 0
            : i[0];
        //console.log("captionTracks", n);
        const context = await (await fetch(n.baseUrl)).text();
        const res: ArticleSnapshot = {
          url: window.location.href,
          title: data.videoDetails.title,
          type: ArticleSnapshotType.Youtube,
          content: context,
          textContent: "",
          id: videoID,
        };
        //console.log("final result:", res);
        return res;
      } catch (error) {
        //console.log("getTranscription error:", error);
      }
    }
  }
}

chrome.runtime.onMessage.addListener(async (request, options) => {
  if (request.to !== MessageTo.MainWindow) {
    return;
  }
  if (request.type === MessageType.GetSubTitlesURL) {
    return;
  }
  //console.log(`request.type:${request.type} prompt:${request.prompt}`);
  let url = new URL(window.location.href);
  if (request.type !== MessageType.SidebarCaption) {
    return;
  }
  let str = window.getSelection()?.toString();
  // selection text
  if (str && str.length > 0) {
    chrome.runtime.sendMessage({
      to: MessageTo.ChatWindow,
      type: MessageType.Selection,
      windowID: request.windowID,
      prompt: request.prompt,
      autoSend: request.autoSend,
      maxCharsToSplit: request.maxCharsToSplit,
      data: {
        url: window.location.href,
        title: window.document.title,
        type: ArticleSnapshotType.Selection,
        content: str,
        textContent: str,
        id: "",
      },
    });
    //console.log(
    //  `getselection sendmessage request.type:${request.type} prompt:${request.prompt}`,
    //);
    return;
  }
  if (getVideoID(window.location.href)) {
    // youtube
    let res = await getTranscription();
    chrome.runtime.sendMessage({
      to: MessageTo.ChatWindow,
      type: MessageType.Transcription,
      windowID: request.windowID,
      prompt: request.prompt,
      autoSend: request.autoSend,
      maxCharsToSplit: request.maxCharsToSplit,
      data: res,
    });
    //console.log("getTranscription ", res);
    return;
  }
  // full text
  //console.log(`get full text from document`);
  chrome.runtime.sendMessage({
    to: MessageTo.ChatWindow,
    type: MessageType.FullText,
    windowID: request.windowID,
    prompt: request.prompt,
    autoSend: request.autoSend,
    maxCharsToSplit: request.maxCharsToSplit,
    data: extractContent(),
  });
});
