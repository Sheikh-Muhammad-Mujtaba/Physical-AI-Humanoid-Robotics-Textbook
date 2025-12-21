import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SRC = "docs";
const DEST = "i18n/ur/docusaurus-plugin-content-docs/current";

async function translate(text) {
  const prompt = `
Translate the following category label into Urdu.

Rules:
- Translate only the label text.
- Do not translate any other part of the JSON.
- Respond with only the translated text, no extra formatting.

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
  const files = glob.sync(`${SRC}/**/_category_.json`);

  for (const file of files) {
    const rel = path.relative(SRC, file);
    const destFile = path.join(DEST, rel);

    await fs.ensureDir(path.dirname(destFile));

    const content = await fs.readJson(file);
    const translatedLabel = await translate(content.label);
    
    const translatedContent = {
        ...content,
        label: translatedLabel,
    };

    await fs.writeJson(destFile, translatedContent, { spaces: 2, encoding: "utf8" });

    console.log(`✅ Translated category: ${rel}`);
    console.log('Waiting for 60 seconds before next translation...');
    await delay(60000);
  }
})();
