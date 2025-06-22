export type ArticleSnapshot = {
  title: string;
  url: string;
  type: ArticleSnapshotType;
  content: string;
  textContent: string;
  id: string;
};

export const defaultMaxCharsToSplit = 15000;
export const promptTemplate =
  "Condense the provided text into concise bulletpoints, selecting a fitting emoji for each, and respond in {{SELECTED_LANGUAGE}} using the content: {{CONTENT}}";

export enum ArticleSnapshotType {
  Youtube = "Youtube",
  FullText = "FullText",
  Selection = "Selection",
  Unknown = "Unknown",
}

export enum MessageTo {
  MainWindow = "MainWindow",
  ChatWindow = "ChatWindow",
  Sidebar = "Sidebar",
}

export enum MessageType {
  // to MainWindow
  SidebarCaption = "SidebarCaption", // sidebarのキャプションボタンをクリックした時のメッセージ
  GetSubTitlesURL = "GetSubTitlesURL", // MainWindowでYouTubeの字幕のURLを取得する時のメッセージ

  // to ChatWindow
  Selection = "Selection", // MainWindowでテキスト選択されている時のメッセージ
  Transcription = "Transcription", // MainWindowでYouTubeの動画の字幕を取得する時のメッセージ
  FullText = "FullText", // MainWindowでページ全体のテキストを取得する時のメッセージ
}
export type injectData = {
  to: MessageTo;
  type: MessageType;
  windowID: number;
  source: summarySourceText;
  prompt: string;
  autoSend: boolean;
  maxCharsToSplit: number;
};
export type summarySourceText = {
  title: string;
  text: string;
  html: string;
  url: string;
};

export function replaceTemplateVariables(
  template: string,
  variables: { [key: string]: string },
): string {
  return Object.keys(variables).reduce((currentTemplate, key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    return currentTemplate.replace(regex, variables[key]);
  }, template);
}
function secondsToHMS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  return [hours, minutes, sec]
    .map((val) => val.toString().padStart(2, "0"))
    .join(":");
}

interface Seg {
  utf8: string;
}
interface Event {
  segs?: Seg[];
}
interface Data {
  events: Event[];
}

const extractUtf8Text = (raw: string): string => {
  const data: Data = JSON.parse(raw);
  return data.events
    .flatMap((event) => event.segs ?? []) // segs があるイベントだけ抽出・展開
    .map((seg) => seg.utf8) // utf8 フィールドだけを抽出
    .filter((utf8): utf8 is string => typeof utf8 === "string") // 明示的にstring型のみ通す
    .join(""); // 全て連結して1つの文字列に
};
function parseTranscript(raw: string): string {
  const text = extractUtf8Text(raw); // ここでUTF-8テキストを抽出
  if (text.length > 0) {
    return text; // UTF-8テキストが存在する場合はそれを返す
  }
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(raw, "text/xml");
  const texts = xmlDoc.getElementsByTagName("text");

  let transcriptString = "";
  for (let i = 0; i < texts.length; i++) {
    const textElement = texts[i];
    const start = textElement.getAttribute("start");
    const text = textElement.textContent;
    if (start && text) {
      // const startSeconds = secondsToHMS(parseFloat(start));
      // transcriptString += `${startSeconds}: ${text}\n`; // 改行区切りで文字列を追加
      transcriptString += `${text}\n`; // 改行区切りで文字列を追加
    }
  }
  return transcriptString.trim();
}
export function toSummarySource(snapshot: ArticleSnapshot): summarySourceText {
  if (!snapshot) {
    return { title: "", text: "", html: "", url: "" };
  }
  switch (snapshot.type) {
    case ArticleSnapshotType.Youtube:
      return {
        title: snapshot.title,
        text: parseTranscript(snapshot.content),
        html: snapshot.content,
        url: snapshot.url,
      };
    case ArticleSnapshotType.FullText:
      return {
        title: snapshot.title,
        text: snapshot.textContent,
        html: snapshot.content,
        url: snapshot.url,
      };
    case ArticleSnapshotType.Selection:
      return {
        title: snapshot.title,
        text: snapshot.textContent,
        html: snapshot.content,
        url: snapshot.url,
      };
  }
  return {
    title: snapshot.title,
    text: "unknown type",
    html: "",
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
