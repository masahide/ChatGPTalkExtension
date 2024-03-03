import { promises as fs } from "fs";

async function patchFile(filePath: string): Promise<void> {
  try {
    // ファイルの内容を読み込む
    let content = await fs.readFile(filePath, "utf8");

    // すでにコメントアウトされているか確認し、必要なら修正を加える
    const searchStr = `magic.prepend(\`import '\${customElementsId}';\`);`;
    const replaceStr = `// magic.prepend(\`import '\${customElementsId}';\`);`;
    if (content.includes(searchStr)) {
      content = content.replace(searchStr, replaceStr);
      await fs.writeFile(filePath, content, "utf8");
      console.log(`${filePath} has been patched.`);
    } else {
      console.log(`${filePath} is already patched or the line does not exist.`);
    }
  } catch (error) {
    console.error(`Error patching ${filePath}: ${error}`);
  }
}

// スクリプトを実行する
const filePath = "./node_modules/@crxjs/vite-plugin/dist/index.mjs";
patchFile(filePath);
