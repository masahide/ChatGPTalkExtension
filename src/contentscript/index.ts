import { Readability } from "@mozilla/readability";
import type { ArticleSnapshot } from "../lib/utils";
import { TextType, ArticleSnapshotType } from "../lib/utils";

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

function getVideoID(url: string) {
  let t =
      /^(https?:)?(\/\/)?((www\.|m\.)?youtube(-nocookie)?\.com\/((watch)?\?(feature=\w*&)?vi?=|embed\/|vi?\/|e\/)|youtu.be\/)([\w-]{10,20})/i,
    r = url.match(t);
  return r ? r[9] : null;
}
async function getTranscription() {
  var i;
  let videoID = getVideoID(window.location.href);
  if (!videoID) return;
  let youtubeRes = await fetch(
    `https://www.youtube.com/watch?v=${videoID}`,
  ).then((res) => res.text());
  if (!youtubeRes) return;
  let jsonStrs = youtubeRes.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
  if (jsonStrs)
    try {
      let data = JSON.parse(jsonStrs[1]);
      if (!data) return;
      let n =
        (i = data.captions.playerCaptionsTracklistRenderer.captionTracks) ==
        null
          ? void 0
          : i[0];
      const res: ArticleSnapshot = {
        url: window.location.href,
        title: data.videoDetails.title,
        type: ArticleSnapshotType.Youtube,
        content: await (await fetch(n.baseUrl)).text(),
        textContent: "",
        id: videoID,
      };
      return res;
    } catch (error) {
      console.log("getTranscription error:", error);
    }
}

chrome.runtime.onMessage.addListener(async (request, options) => {
  //console.log("request.name:", request.name);
  let url = new URL(window.location.href);
  if (request.name == TextType.Selection) {
    let str = window.getSelection()?.toString();
    // selection text
    if (str && str.length > 0) {
      chrome.runtime.sendMessage({
        name: TextType.Selection,
        windowID: request.windowID,
        data: {
          url: window.location.href,
          title: window.document.title,
          type: ArticleSnapshotType.Selection,
          content: str,
          textContent: str,
          id: "",
        },
      });
      return;
    }
  }
  // youtube
  if (getVideoID(window.location.href)) {
    let res = await getTranscription();
    chrome.runtime.sendMessage({
      name: TextType.Transcription,
      windowID: request.windowID,
      data: res,
    });
    //console.log("getTranscription ", res);
    return;
  }
  // full text
  chrome.runtime.sendMessage({
    name: TextType.FullText,
    windowID: request.windowID,
    data: extractContent(),
  });
});
