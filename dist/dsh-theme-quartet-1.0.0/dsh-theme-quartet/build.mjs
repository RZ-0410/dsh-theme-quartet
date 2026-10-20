/**
 * 构建脚本：把色板数据 + 压缩后的底图打进 lib/client.js，并产出可离线预览的 preview.html。
 *
 * 用法：node build.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SKINS, surfaceCss, tokensFor } from './src/skins.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ART_DIR = path.join(ROOT, 'assets');
const LIB_DIR = path.join(ROOT, 'lib');

/** 底图 slug → data URI */
const ART = {};
for (const skin of SKINS) {
  const file = path.join(ART_DIR, `${skin.art}.webp`);
  if (!fs.existsSync(file)) throw new Error(`缺少底图：${file}（先跑 tools/compress.py）`);
  ART[skin.art] = `data:image/webp;base64,${fs.readFileSync(file).toString('base64')}`;
}

/** 浏览器端只需要展示用的字段，色板与装饰 CSS 已经编译成成品。 */
const PUBLIC_SKINS = SKINS.map(({ id, name, sub, hint, swatch, art }) => ({ id, name, sub, hint, swatch, art }));

const TOKENS = {};
for (const skin of SKINS) TOKENS[skin.id] = tokensFor(skin);

/** 底图只出现一次：注册成自定义属性，卡片缩略图与会话区背景共用。 */
const ART_VARS = `:root{${SKINS.map((skin) => `--q-art-${skin.art}:url("${ART[skin.art]}")`).join(";")}}`;
const SKIN_CSS = `${ART_VARS}\n${SKINS.map((skin) => surfaceCss(skin)).join("\n")}`;

/** 单次替换，避免 `$&` 之类的替换字符串魔法。 */
function inject(source, values) {
  let out = source;
  for (const [key, value] of Object.entries(values)) out = out.replace(key, () => value);
  return out;
}

const payload = {
  __SKINS__: JSON.stringify(PUBLIC_SKINS, null, '\t'),
  __TOKENS__: JSON.stringify(TOKENS),
  __SKIN_CSS__: JSON.stringify(SKIN_CSS),
};

fs.mkdirSync(LIB_DIR, { recursive: true });

const clientSource = fs.readFileSync(path.join(ROOT, 'src', 'client.template.js'), 'utf8');
const client = inject(clientSource, payload);
fs.writeFileSync(path.join(LIB_DIR, 'client.js'), client);

const previewSource = fs.readFileSync(path.join(ROOT, 'src', 'preview.template.html'), 'utf8');
const preview = inject(previewSource, payload);
fs.writeFileSync(path.join(ROOT, 'preview.html'), preview);

const kb = (value) => `${(Buffer.byteLength(value) / 1024).toFixed(0)} KB`;
console.log(`lib/client.js  ${kb(client)}`);
console.log(`preview.html   ${kb(preview)}`);
console.log(`底图合计       ${kb(Object.values(ART).join(''))}`);
