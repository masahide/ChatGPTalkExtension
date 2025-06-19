export type ArticleSnapshot = {
  title: string;
  url: string;
  type: ArticleSnapshotType;
  content: string;
  textContent: string;
  id: string;
};

export const defaultMaxCharsToSplit = 4500;
export const promptTemplate =
  "Condense the provided text into concise bulletpoints, selecting a fitting emoji for each, and respond in {{SELECTED_LANGUAGE}} using the content: {{CONTENT}}";

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

export type injectData = {
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

export function getSelection(
  prompt: string,
  autoSend: boolean,
  maxCharsToSplit: number,
) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      let tabid = tabs[i].id;
      if (tabid) {
        chrome.tabs.sendMessage(tabid, {
          name: TextType.Selection,
          windowID: tabid,
          prompt: prompt,
          autoSend: autoSend,
          maxCharsToSplit: maxCharsToSplit,
        });
      }
    }
  });
}

export function replaceTemplateVariables(
  template: string,
  variables: { [key: string]: string },
): string {
  return Object.keys(variables).reduce((currentTemplate, key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    return currentTemplate.replace(regex, variables[key]);
  }, template);
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
      transcriptString += `${text}\n`;
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
        text: parseXmlToTranscript(snapshot.content),
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

export const fetcher = <T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    fetch(input, init)
      .then((response) => {
        if (!response.ok) {
          response.text().then(reject).catch(reject);
        } else {
          response.json().then(resolve).catch(reject);
        }
      })
      .catch(reject);
  });
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
  choices: Choice[];
  usage: Usage;
};

type Choice = {
  finish_reason: string;
  index: number;
  message: Message;
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
