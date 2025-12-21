import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SRC = "docs";
const DEST =
  "i18n/ur/docusaurus-plugin-content-docs/current";

async function translate(text) {
  const prompt = `
Translate the following documentation into Urdu.

Rules:
- Keep code blocks EXACTLY the same
- Do not translate technical terms like API, OAuth, CLI
- Maintain markdown structure
- Use professional technical Urdu

TEXT:
${text}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const files = glob.sync(`${SRC}/**/*.{md,mdx}`);

  for (const file of files) {
    const rel = path.relative(SRC, file);
    const destFile = path.join(DEST, rel);

    await fs.ensureDir(path.dirname(destFile));

    const content = await fs.readFile(file, "utf8");
    const translated = await translate(content);

    await fs.writeFile(destFile, translated, "utf8");

    console.log(`✅ Translated: ${rel}`);
    console.log('Waiting for 60 seconds before next translation...');
    await delay(60000);
  }
})();
