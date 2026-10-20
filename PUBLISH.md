# 把「主题四合」发布到 DSH 插件市场

> 结论先说：**DSH 没有"上传插件"的按钮**。所谓插件市场，都是一层层索引器 —— 它们抓 GitHub 仓库、抓 npm 包，再生成条目。你要做的是**把这两个源头准备好**，剩下的等它们自己来抓。

## 一、四个渠道，各管一段

| 渠道 | 数据从哪来 | 你能得到什么 | 生效速度 |
| --- | --- | --- | --- |
| **npm registry** | `npm publish` | 一条命令安装；DSH 内置「插件中心」只展示有 npm 包的插件 | 立即 |
| **GitHub topic `dsh-plugin`** | 仓库设置里加 topic | dsh-plugin.org、dshfind、dshpluginhub 等站点自动抓取 | 数小时～1 天 |
| **awesome-dsh-plugin**（GitHub PR） | `data/plugins/*.yml` | `dsh-market`（你已装的 `dshmarket`）**唯一信任的安装源**，也是官方 Plugins → Discover 的索引 | 通常 1 天 |
| **dsh-plugin.org**（Issue） | 提交模板 | 人工核验，状态从 unconfirmed 变 verified | 一轮刷新 |

关键区别：**只上 GitHub 也能被收录**，但进不了「插件中心」和 `dsh-market` —— 那两个地方要求能用 `dsh plugin --profile web add <包名>` 一键安装。所以要真正"上架"，npm 包是必选项。

## 二、上架硬性要求（缺一条就打回）

| 要求 | 本仓库现状 |
| --- | --- |
| 公开仓库 | 待你建（本地已 git 化） |
| 仓库根目录有 `package.json` | ✅ |
| 导出 `apply(ctx)` 模块 | ✅ `lib/index.js` + `lib/client.js` |
| README 含安装命令 `dsh plugin --profile web add <包名>` | ✅ |
| 明确许可证 | ✅ MIT |
| 截图 / 演示 | ✅ `docs/*.jpg` |
| GitHub topic `dsh-plugin` | 待加（建仓库后一条命令） |
| npm 包已发布 | 待发布（包名 `dsh-theme-quartet` 目前未被占用，我查过 registry 返回 404） |

随时可以自查：

```bat
node tools/publish-check.mjs
```

## 三、按顺序做这五步

### 步骤 0 · 把 owner 填进去

```bat
cd E:\11work\预测\dsh-theme-quartet
node tools\prepare-publish.mjs --owner <你的GitHub用户名>
```

它会：写入 `repository` / `homepage` / `bugs` 字段；生成两个可直接粘贴的提交材料：

- `submission/<owner>__dsh-theme-quartet.yml` —— awesome-dsh-plugin 的条目
- `submission/dsh-plugin-org-issue.md` —— dsh-plugin.org 的 Issue 正文

### 步骤 1 · 建 GitHub 仓库、推代码、打 topic

网页新建一个**空仓库**（不要勾 README），然后：

```bat
git init
git add -A
git commit -m "feat: 主题四合 0.1.0 —— DSH 四套换肤皮肤"
git remote add origin https://github.com/<owner>/dsh-theme-quartet.git
git branch -M main
git push -u origin main
```

仓库名必须和 `package.json` 里的 `repository` 一致（都是 `dsh-theme-quartet`），否则市场无法把 npm 包和仓库对上。

加 topic（网页：仓库首页右侧齿轮 → Topics；或 CLI）：

```bat
gh repo edit --add-topic dsh-plugin,deepseek-harness,dsh,theme
```

> topic 必须精确写 `dsh-plugin` —— 写成 `dshplugin`、`dsh_plugin` 都抓不到。

### 步骤 2 · 发布到 npm

```bat
npm login
npm publish --access public
```

`prepublishOnly` 会自动跑 `build.mjs` + `publish-check.mjs`，构建产物不一致或占位符没替换会直接拦住发布。

验证：

```bat
npm view dsh-theme-quartet version
```

版本策略：现在 `0.1.0`。DSH 还在预览期，`--dsw-*` 令牌名可能变，先用 0.x 更诚实；以后升级用 `npm version patch`（或 `minor`）再 `npm publish`。

发布后马上能装：

```bat
dsh plugin --profile web add dsh-theme-quartet
```

### 步骤 3 · 提 PR 进 awesome-dsh-plugin（决定能不能在 dsh-market 里搜到）

1. fork `https://github.com/awesome-dsh-plugin/awesome-dsh-plugin`
2. 新建 `data/plugins/<owner>__dsh-theme-quartet.yml`，内容就是 `submission/` 里生成的那份
3. 提 PR，标题写 `Add dsh-theme-quartet (theme)`

约定：

- **一次 PR 只加一个条目**，多了会被要求拆
- `category` 用 `theme`（Themes & Appearance / 主题与外观）
- **不要手改 README** —— 两份 README 都由 `data/plugins/` 生成，改了反而会让校验挂掉
- 合并后站点与 `dsh-market` 自动同步，通常一天内生效

### 步骤 4 · 提 Issue 到 dsh-plugin.org

打开 `https://github.com/dshplugin/dsh-plugin-hub/issues/new`，把 `submission/dsh-plugin-org-issue.md` 整个粘进去。

这一步是"加速人工核验"，不是必须 —— 你已经有 topic + 根 package.json，自动扫描也会收录；但人工核验后才从 `unconfirmed` 变 `verified`。

## 四、收录后怎么验收

```bat
:: 1. 一条命令能装
dsh plugin --profile web add dsh-theme-quartet

:: 2. 能搜到（打开设置 → 插件市场，搜「主题四合」）
:: 3. 重启 DSH，右下角出现换肤圆钮
```

## 五、最常见的六种打回原因

1. 仓库根目录没有 `package.json`（多包 monorepo 把插件放在子目录里，市场扫不到）
2. README 没写安装命令，或写的是本地路径
3. topic 拼错
4. `cordis.patch.yml` 里的 `id` 与别的插件撞车（本包用 `theme-quartet`）
5. 私有仓库，或只发 release 里的 tgz
6. 名字或 README 冒充官方（`@deepseek-ai/*` 是官方命名空间，社区包不能用）

## 六、这个仓库里已经准备好的东西

| 文件 | 作用 |
| --- | --- |
| `tools/prepare-publish.mjs` | 填 owner、生成两个提交模板 |
| `tools/publish-check.mjs` | 把收录要求变成断言，发布前跑一遍 |
| `tools/install.mjs` | 装进本机 profile（本地自测用） |
| `tools/smoke.html` | 宿主替身冒烟测试 |
| `package.json` | 已补 `publishConfig`、`engines.dsh`、`prepublishOnly` |

> `engines.dsh` 值得解释一句：awesome-dsh-plugin 的抓取脚本会记录它，官方 Discover 页的"兼容性筛选"读的就是这个字段。本包声明 `>=0.1.7-rc.1`（`ctx.theme.overrideTokens` 从这版开始有）。
