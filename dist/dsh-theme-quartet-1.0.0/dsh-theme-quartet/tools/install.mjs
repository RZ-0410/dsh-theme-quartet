/**
 * 安装到本机 DSH profile（默认 desktop）。
 *
 * 幂等：包已存在就整目录覆盖，patch 行已存在就跳过。
 * 改的是 ~/.dsh/profiles/<profile>/，属于用户数据目录，所以先备份 patch 文件。
 *
 * 用法：node tools/install.mjs [--profile desktop] [--dry-run]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const profileIndex = args.indexOf('--profile');
const profile = profileIndex >= 0 ? args[profileIndex + 1] : 'desktop';
const dryRun = args.includes('--dry-run');

if (profile === undefined) {
  console.error('缺少 --profile 的值');
  process.exit(1);
}

const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
const profileDir = path.join(dshHome, 'profiles', profile);
const patchFile = path.join(profileDir, 'cordis.patch.yml');
const target = path.join(profileDir, 'node_modules', 'dsh-theme-quartet');

if (!fs.existsSync(profileDir)) {
  console.error(`找不到 profile：${profileDir}`);
  console.error('先启动一次 DeepSeek Harness，或用 --profile 指定其它 profile。');
  process.exit(1);
}

const FILES = ['package.json', 'cordis.patch.yml', 'README.md', 'LICENSE', 'lib'];

console.log(`profile : ${profileDir}`);
console.log(`安装到  : ${target}${dryRun ? '（dry-run）' : ''}`);

if (!dryRun) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of FILES) {
    const from = path.join(ROOT, entry);
    if (!fs.existsSync(from)) continue;
    fs.cpSync(from, path.join(target, entry), { recursive: true });
  }
  console.log('· 包文件已复制');
}

const ENTRY = `
# 主题四合（dsh-theme-quartet）：DeepSeek Harness 换肤插件
- insert:
    - id: theme-quartet
      name: dsh-theme-quartet
`;

const patch = fs.existsSync(patchFile) ? fs.readFileSync(patchFile, 'utf8') : '';
if (/id:\s*theme-quartet\b/.test(patch)) {
  console.log('· cordis.patch.yml 已有 theme-quartet 条目，跳过');
} else if (dryRun) {
  console.log('· 需要往 cordis.patch.yml 追加 insert 条目');
} else {
  const backup = `${patchFile}.bak-${Date.now()}`;
  fs.copyFileSync(patchFile, backup);
  console.log(`· 已备份 patch：${path.basename(backup)}`);
  fs.appendFileSync(patchFile, ENTRY, 'utf8');
  console.log('· 已写入 insert 条目');
}

console.log('\n完成。请完全退出并重新启动 DeepSeek Harness（不是刷新页面）。');
console.log('重启后右下角会出现换肤圆钮；Alt + Shift + S 也可开关面板。');
