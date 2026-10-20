/**
 * 发布前自检：把"插件市场收录要求"变成可执行断言。
 *
 * 用法：node tools/publish-check.mjs
 * 退出码非 0 表示有阻塞项。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(ROOT, file));

const results = [];
const pass = (title, detail = '') => results.push({ ok: true, title, detail });
const fail = (title, detail = '') => results.push({ ok: false, title, detail });
const warn = (title, detail = '') => results.push({ ok: true, warn: true, title, detail });

const pkg = JSON.parse(read('package.json'));

// 1. 包基本信息
if (pkg.name === undefined || pkg.version === undefined) fail('package.json 缺少 name / version');
else pass('包名与版本', `${pkg.name}@${pkg.version}`);

if (pkg.license === undefined) fail('package.json 缺少 license（市场要求明确开源协议）');
else pass('许可证', pkg.license);

// 2. DSH 清单
if (pkg.dsh?.bundle?.patch === undefined) fail('缺少 dsh.bundle.patch');
else pass('dsh.bundle.patch', pkg.dsh.bundle.patch);

if (pkg.dsh?.client?.platform !== 'web') fail('缺少 dsh.client.platform = "web"');
else pass('dsh.client.platform', 'web');

// 3. 入口文件
if (!exists('lib/index.js')) fail('缺少 lib/index.js（宿主半边）');
else {
	const src = read('lib/index.js');
	if (!/export\s+function\s+apply|export\s*\{[^}]*apply/.test(src)) fail('lib/index.js 未导出 apply(ctx)');
	else pass('宿主半边导出 apply(ctx)');
}

if (!exists('lib/client.js')) fail('缺少 lib/client.js（浏览器半边，需先 node build.mjs）');
else {
	const src = read('lib/client.js');
	if (!src.includes('window.__ModuleLoader__.load')) fail('lib/client.js 缺少 __ModuleLoader__ 包装');
	else pass('浏览器半边格式', 'window.__ModuleLoader__.load');
	if (!/exports\.apply\s*=/.test(src)) fail('lib/client.js 未导出 apply');
	if (!/exports\.inject\s*=/.test(src)) fail('lib/client.js 未导出 inject');
	if (src.includes('__SKINS__') || src.includes('__TOKENS__') || src.includes('__SKIN_CSS__')) {
		fail('lib/client.js 仍有未替换的构建占位符，先跑 node build.mjs');
	} else pass('构建占位符已全部替换');
	if (Buffer.byteLength(src) > 2 * 1024 * 1024) warn('lib/client.js 超过 2 MB', '市场卡片的加载体验会变差');
}

// 4. 配置层
if (!exists('cordis.patch.yml')) fail('缺少 cordis.patch.yml');
else {
	const yml = read('cordis.patch.yml');
	if (!yml.includes(pkg.name)) fail('cordis.patch.yml 里的 name 与包名不一致（启动会失败）');
	else pass('cordis.patch.yml 指向本包');
	if (!/id:\s*theme-quartet/.test(yml)) warn('cordis.patch.yml 里没有预期的 id', 'id 需全局唯一');
}

// 5. README 安装命令
const readme = read('README.md');
if (readme.includes(`dsh plugin --profile web add ${pkg.name}`)) pass('README 含可复制的安装命令');
else fail('README 缺少安装命令：dsh plugin --profile web add ' + pkg.name);

if (!/!\[[^\]]*\]\(docs\//.test(readme)) warn('README 没有截图引用', '市场页面会显得很空');
else pass('README 含截图');

// 6. 发布元数据（影响市场能否把 npm 包和仓库对上）
if (pkg.repository?.url === undefined) warn('尚未填 repository', '跑一次 node tools/prepare-publish.mjs --owner <你的GitHub用户名>');
else pass('repository', typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url);

// 7. 打包体积预演
const files = (pkg.files ?? []).filter((file) => exists(file));
let bytes = 0;
for (const file of files) {
	const stat = fs.statSync(path.join(ROOT, file));
	bytes += stat.isDirectory() ? 0 : stat.size;
}
pass('tarball 估算', `${files.length} 个条目，约 ${(bytes / 1024).toFixed(0)} KB`);

// 8. 包名占用（离线时跳过）
try {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 4000);
	const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}`, { signal: controller.signal });
	clearTimeout(timer);
	if (response.status === 404) pass('npm 包名可用', pkg.name);
	else if (response.ok) {
		const data = await response.json();
		if (data['dist-tags']?.latest === undefined) pass('npm 包名存在但无 latest', '可能是残留占位');
		else fail('npm 包名已被占用', `${pkg.name}@${data['dist-tags'].latest}（若这是你自己的包，改用 npm version 升版本）`);
	} else warn('npm 包名检查返回异常状态', String(response.status));
} catch {
	warn('跳过 npm 包名检查', '网络不可达或超时');
}

let blocking = 0;
for (const item of results) {
	const mark = item.ok ? (item.warn ? '!' : '✓') : '✗';
	if (!item.ok) blocking += 1;
	console.log(`${mark} ${item.title}${item.detail ? ` — ${item.detail}` : ''}`);
}

console.log('');
if (blocking === 0) {
	console.log('可以发布。下一步：');
	console.log(`  git add -A && git commit -m "feat: dsh-theme-quartet ${pkg.version}"`);
	console.log('  npm publish --access public');
	console.log('  git push -u origin main');
} else {
	console.log(`有 ${blocking} 个阻塞项，先修完再发布。`);
	process.exit(1);
}
