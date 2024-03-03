export type ArticleSnapshot = {
  title: string;
  url: string;
  type: ArticleSnapshotType;
  content: string;
  textContent: string;
  id: string;
};

export enum ArticleSnapshotType {
  Youtube = "Youtube",
  FullText = "FullText",
  Selection = "Selection",
  Unknown = "Unknown",
}

export enum TextType {
  Selection = "Selection",
  Transcription = "Transcription",
  FullText = "FullText",
}
export type summarySourceText = {
  title: string;
  text: string;
  url: string;
};
export function getSelection() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      let tabid = tabs[i].id;
      if (tabid) {
        chrome.tabs.sendMessage(tabid, {
          name: TextType.Selection,
          windowID: tabid,
        });
      }
    }
  });
}
function secondsToHMS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  return [hours, minutes, sec]
    .map((val) => val.toString().padStart(2, "0"))
    .join(":");
}
function parseXmlToTranscript(xmlString: string): string {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const texts = xmlDoc.getElementsByTagName("text");

  let transcriptString = "";
  for (let i = 0; i < texts.length; i++) {
    const textElement = texts[i];
    const start = textElement.getAttribute("start");
    const text = textElement.textContent;
    if (start && text) {
      const startSeconds = secondsToHMS(parseFloat(start));
      transcriptString += `${startSeconds}: ${text}\n`; // 改行区切りで文字列を追加
    }
  }
  return transcriptString.trim();
}
export function toSummarySource(snapshot: ArticleSnapshot): summarySourceText {
  if (!snapshot) {
    return { title: "", text: "", url: "" };
  }
  switch (snapshot.type) {
    case ArticleSnapshotType.Youtube:
      return {
        title: snapshot.title,
        text: parseXmlToTranscript(snapshot.content),
        url: snapshot.url,
      };
    case ArticleSnapshotType.FullText:
      return {
        title: snapshot.title,
        text: snapshot.textContent,
        url: snapshot.url,
      };
    case ArticleSnapshotType.Selection:
      return {
        title: snapshot.title,
        text: snapshot.textContent,
        url: snapshot.url,
      };
  }
  return {
    title: snapshot.title,
    text: "unknown type",
    url: "",
  };
}

const wrap = <T>(task: Promise<Response>): Promise<T> => {
  return new Promise((resolve, reject) => {
    task
      .then((response) => {
        if (!response.ok) {
          response
            .text()
            .then((text) => {
              reject(text);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          response
            .json()
            .then((json) => {
              // jsonが取得できた場合だけresolve
              resolve(<Promise<T>>json);
            })
            .catch((error) => {
              reject(error);
            });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export const fetcher = <T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> => {
  return wrap<T>(fetch(input, init));
};

export type OpenAIRequest = {
  model: string;
  messages: Message[];
};
export type OpenAIResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  prompt_filter_results: PromptFilterResult[];
  choices: Choice[];
  usage: Usage;
  system_fingerprint: string;
};
type PromptFilterResult = {
  prompt_index: number;
  content_filter_results: ContentFilterResults;
};
type ContentFilterResults = {
  hate: FilterResult;
  self_harm: FilterResult;
  sexual: FilterResult;
  violence: FilterResult;
};
type FilterResult = {
  filtered: boolean;
  severity: string;
};
type Choice = {
  finish_reason: string;
  index: number;
  message: Message;
  content_filter_results: ContentFilterResults;
};
type Message = {
  role: string;
  content: string;
};
type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};
