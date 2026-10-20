/**
 * 一条命令把发布材料填好：package.json 的 repository 字段 + 两个提交模板。
 *
 * 用法：node tools/prepare-publish.mjs --owner <GitHub用户名> [--repo dsh-theme-quartet]
 *
 * 幂等：重复跑只会覆盖同样几处，不会累积。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const get = (flag, fallback) => {
	const index = args.indexOf(flag);
	return index >= 0 ? args[index + 1] : fallback;
};

const owner = get('--owner');
const repo = get('--repo', 'dsh-theme-quartet');

if (owner === undefined || !/^[A-Za-z0-9-]+$/.test(owner)) {
	console.error('用法：node tools/prepare-publish.mjs --owner <GitHub用户名>');
	console.error('GitHub 用户名只含字母、数字、连字符。');
	process.exit(1);
}

const pkgFile = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
const url = `https://github.com/${owner}/${repo}`;

pkg.repository = { type: 'git', url: `git+${url}.git` };
pkg.homepage = `${url}#readme`;
pkg.bugs = { url: `${url}/issues` };
pkg.author = owner;

fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
console.log(`· package.json 已写入 repository：${url}`);

const en = 'Four switchable skins for the DeepSeek Harness web UI (sakura JK, bronze tech, tide, lunar), built as a pure design-token overlay — no host source changes, light and dark palettes included.';
const zh = '给 DeepSeek Harness Web 界面换肤的四套预设（樱风 JK / 褐东风 / 潮汐 / 月壤），纯设计令牌覆盖，不改宿主源码，每套自带明暗两版色板。';

const submissionDir = path.join(ROOT, 'submission');
fs.mkdirSync(submissionDir, { recursive: true });

// 1) awesome-dsh-plugin：data/plugins/<owner>__<repo>.yml
fs.writeFileSync(
	path.join(submissionDir, `${owner}__${repo}.yml`),
	`url: ${url}
name: ${owner}/${repo}
category: theme
description:
  en: '${en.replaceAll("'", "''")}'
  zh: '${zh.replaceAll("'", "''")}'
`,
	'utf8',
);

// 2) dsh-plugin.org：Issue 模板
const issue = `[插件提交] ${owner}/${repo} — 四套预设皮肤，点选即换

### 仓库地址
${url}

### 一句话价值
装上后 DSH 界面多出四套可选皮肤（樱风 / 褐东风 / 潮汐 / 月壤），右下角圆钮或 Alt+Shift+S 随时切换，跟着宿主明暗自动换色板。

### 能力分类
界面与体验

### 安装命令
dsh plugin --profile web add ${pkg.name}

### 兼容与运行要求
DSH >= 0.1.7-rc.1（依赖 ctx.theme.overrideTokens）；Web / 桌面版均可；无宿主侧依赖，纯客户端插件。

### 许可证
MIT

### 截图 / 演示
仓库 docs/ 目录下四张截图：docs/jk.jpg、docs/tech.jpg、docs/wave.jpg、docs/moon.jpg

### 补充说明
不采集任何数据、不发网络请求、不写宿主配置；皮肤选择只存在浏览器 localStorage。与其它皮肤插件同时启用会互相覆盖令牌，建议只启用一个。

### 提交前自查
- [x] 仓库已公开
- [x] 已添加 GitHub topic：dsh-plugin
- [x] README 包含安装命令
- [x] 插件导出 apply(ctx) 模块
- [x] 仓库根目录包含 package.json
`;

fs.writeFileSync(path.join(submissionDir, 'dsh-plugin-org-issue.md'), issue, 'utf8');

console.log(`· submission/${owner}__${repo}.yml（复制到 awesome-dsh-plugin 的 data/plugins/）`);
console.log('· submission/dsh-plugin-org-issue.md（贴到 dsh-plugin-hub 的 Issue）');
console.log('');
console.log('下一步：');
console.log('  1. 在 GitHub 建空仓库 ' + repo + '（不要勾选 README）');
console.log('  2. git init && git add -A && git commit -m "feat: 主题四合 0.1.0"');
console.log(`  3. git remote add origin ${url}.git && git branch -M main && git push -u origin main`);
console.log('  4. 仓库 Settings → Topics 加 dsh-plugin（必须，市场靠它自动发现）');
console.log('  5. npm login && npm publish --access public');
console.log('  6. 向 awesome-dsh-plugin 提 PR，加一条 data/plugins/' + `${owner}__${repo}.yml` + '（dsh-market 内置市场只认这份精选表）');
