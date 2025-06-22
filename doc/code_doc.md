# AiSidebarExtension コード解説

このドキュメントは、AiSidebarExtensionリポジトリのコード構造と主要なファイルについて説明します。

## 概要

このプロジェクトは、Webページにサイドバーを挿入するChrome拡張機能です。SvelteとTypeScriptで構築されており、ビルドツールとしてViteを使用しています。

## プロジェクト構造

```
.
├── _locales         # 国際化ファイル (i18n)
├── dist             # ビルド後の拡張機能ファイル
├── doc              # ドキュメントとアイコン
├── node_modules     # 依存パッケージ
├── public           # 静的アセット
├── src              # ソースコード
│   ├── background     # バックグラウンドスクリプト
│   ├── components     # Svelteコンポーネント
│   ├── contentscript  # コンテンツスクリプト
│   ├── lib            # ユーティリティ関数
│   └── sidepanel      # サイドパネルのUI
├── crxjs_patch.ts   # CRXJS Viteプラグインのパッチ
├── package.json     # プロジェクト情報と依存関係
├── svelte.config.js # Svelteの設定ファイル
├── tsconfig.json    # TypeScriptの設定ファイル
└── vite.config.ts   # Viteの設定ファイル
```

## 主要なファイルとディレクトリ

### `src`

すべてのソースコードがこのディレクトリにあります。

- **`src/background/index.ts`**: 拡張機能のバックグラウンドで実行されるスクリプトです。イベントのリッスンや、他のパートとの通信を担います。

- **`src/contentscript`**: Webページに挿入され、DOMにアクセスして操作するためのスクリプトです。

  - `index.ts`: コンテンツスクリプトのメインファイルです。
  - `chatgpt.ts`, `gemini.ts`: 特定のWebサイト（ChatGPT, Gemini）向けのコンテンツスクリプトです。

- **`src/sidepanel`**: 拡張機能のサイドパネルUIに関連するファイルです。

  - `index.html`: サイドパネルのHTMLエントリーポイントです。
  - `index.ts`: サイドパネルのメインスクリプトです。

- **`src/components/Sidepanel.svelte`**: Svelteで書かれたサイドパネルのUIコンポーネントです。

- **`src/lib/utils.ts`**: プロジェクト全体で共有されるユーティリティ関数が含まれています。

### `public`

`vite.svg`や`bootstrap`のCSS/JSファイルなど、ビルド時にそのままコピーされる静的ファイルが配置されます。

### `dist`

`pnpm run build`コマンドを実行すると生成される、ビルド済みの拡張機能ファイルが格納されるディレクトリです。このディレクトリをChromeに読み込ませることで、拡張機能として利用できます。

### 設定ファイル

- **`vite.config.ts`**: ビルドツールであるViteの設定ファイルです。`@crxjs/vite-plugin`を使い、Chrome拡張機能向けのビルド設定を行っています。

- **`svelte.config.js`**: Svelteコンパイラの設定ファイルです。

- **`tsconfig.json`**: TypeScriptコンパイラの設定ファイルです。

- **`package.json`**: プロジェクトのメタデータ（名前、バージョンなど）と、`dependencies`（実行時依存）および`devDependencies`（開発時依存）を定義します。また、`scripts`セクションには`dev`（開発サーバーの起動）や`build`（本番用ビルド）などのコマンドが定義されています。

### `src/lib/utils.ts` の詳細

このファイルには、拡張機能全体で再利用される型定義、定数、およびヘルパー関数が含まれています。

#### 主要な型定義

- **`ArticleSnapshot`**: Webページから取得した記事やコンテンツのスナップショットを表す型です。タイトル、URL、コンテンツ（HTML）、テキストコンテンツなどが含まれます。
- **`ArticleSnapshotType`**: `ArticleSnapshot`の種類を示すEnumです（`Youtube`, `FullText`, `Selection`など）。
- **`summarySourceText`**: 要約処理の入力となるテキストソースの型です。
- **`injectData`**: コンテンツスクリプトに渡すデータの型です。
- **`OpenAIRequest`, `OpenAIResponse`**: OpenAI APIとの通信に使用されるリクエストとレスポンスの型です。

#### 定数

- **`defaultMaxCharsToSplit`**: テキストを分割する際のデフォルトの最大文字数です。
- **`promptTemplate`**: AIへの指示（プロンプト）を生成するためのテンプレート文字列です。

#### 主要な関数

- **`getSelection(...)`**: 現在アクティブなタブにメッセージを送信し、ユーザーが選択したテキストを取得します。

  - **引数**:
    - `prompt` (string): AIに渡すプロン​​プトリクエスト。
    - `autoSend` (boolean): 自動で送信するかどうかのフラグ。
    - `maxCharsToSplit` (number): 分割する最大文字数。
  - **戻り値**: なし (`void`)。`chrome.tabs.sendMessage` を介して非同期にメッセージを送信します。

- **`replaceTemplateVariables(...)`**: テンプレート文字列内のプレースホルダー（例: `{{KEY}}`）を実際の値に置き換えます。

  - **引数**:
    - `template` (string): プレースホルダーを含むテンプレート文字列。
    - `variables` (object): キーと値のペアを持つ置換用のオブジェクト。
  - **戻り値**: `string` - プレースホルダーが実際の値に置き換えられた文字列。

- **`toSummarySource(snapshot)`**: `ArticleSnapshot`オブジェクトを、AIによる要約が可能な`summarySourceText`形式に変換します。スナップショットのタイプに応じて、XMLのパースなど適切な処理を行います。

  - **引数**:
    - `snapshot` (ArticleSnapshot): 処理対象の記事スナップショット。
  - **戻り値**: `summarySourceText` - AIでの要約処理に適した形式に変換されたオブジェクト。

- **`fetcher(...)`**: 標準の`fetch` APIのラッパーで、レスポンスのJSON変換やエラーハンドリングを簡略化します。
  - **引数**:
    - `input` (RequestInfo): fetchリクエストの情報（URLなど）。
    - `init` (RequestInit, optional): fetchリクエストの初期化オプション。
  - **戻り値**: `Promise<T>` - レスポンスをJSONとして解決するPromise。
