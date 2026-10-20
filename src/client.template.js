window.__ModuleLoader__.load({
	id: "dsh-theme-quartet",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		/**
		 * 主题四合 · DeepSeek Harness 换肤插件（浏览器半边）
		 *
		 * 做三件事：
		 * 1. 通过 ctx.theme.overrideTokens() 叠一层设计令牌，替换整套颜色；
		 * 2. 注入一层极薄的装饰 CSS（只画会话滚动区背景，不碰布局）；
		 * 3. 在右下角挂一个皮肤切换器（Shadow DOM 隔离，可拖动、可记忆）。
		 *
		 * 不注册自定义主题 id —— DSH 的主题偏好白名单只认 light/dark/system，
		 * 自定义 id 存不进去；皮肤选择由本插件自己的 localStorage 承担。
		 */

		const PLUGIN_ID = "dsh-theme-quartet";
		const STORAGE_SKIN = "dsh-theme-quartet.skin";
		const STORAGE_POS = "dsh-theme-quartet.pos";
		const SKINS = __SKINS__;
		const TOKENS = __TOKENS__;
		const SKIN_CSS = __SKIN_CSS__;

		const SKIN_MAP = Object.create(null);
		for (const skin of SKINS) SKIN_MAP[skin.id] = skin;

		function readStorage(key, fallback) {
			try {
				const value = window.localStorage.getItem(key);
				return value === null ? fallback : value;
			} catch {
				return fallback;
			}
		}

		function writeStorage(key, value) {
			try {
				window.localStorage.setItem(key, value);
			} catch {
				/* 隐私模式或存储被禁用：只在本次会话生效 */
			}
		}

		/** 设计令牌覆盖：{ token: { light, dark } } → DSH 主题层。 */
		function overrideTokens(ctx, tokens) {
			if (ctx.theme !== undefined && typeof ctx.theme.overrideTokens === "function") {
				return ctx.theme.overrideTokens(PLUGIN_ID, tokens);
			}
			return null;
		}

		/** 没有主题服务时的降级 CSS：直接写到 body 上（带 !important，够用不致命）。 */
		function fallbackCss(tokens) {
			const light = [];
			const dark = [];
			for (const [name, value] of Object.entries(tokens)) {
				light.push(`${name}:${value.light}!important`);
				dark.push(`${name}:${value.dark}!important`);
			}
			return `body{${light.join(";")}}body[data-ds-dark-theme]{${dark.join(";")}}`;
		}

		function mountFallback(tokens) {
			const tag = document.createElement("style");
			tag.dataset.plugin = PLUGIN_ID;
			tag.dataset.pluginCss = `${PLUGIN_ID}/tokens-fallback`;
			tag.textContent = fallbackCss(tokens);
			document.head.appendChild(tag);
			return tag;
		}

		const UI_CSS = `
			:host{all:initial}
			*{box-sizing:border-box;margin:0;padding:0;font:inherit;color:inherit}
			.wrap{
				position:fixed;right:20px;bottom:148px;z-index:2147483000;
				display:flex;flex-direction:column;align-items:flex-end;
				pointer-events:none;
				font-family:"Inter","PingFang SC","Microsoft YaHei",system-ui,-apple-system,sans-serif;
				color:var(--dsw-alias-label-primary,#1b1b1c);
			}
			.wrap>*{pointer-events:auto}
			.orb{
				width:46px;height:46px;border-radius:50%;padding:0;border:1px solid var(--dsw-alias-border-l3,rgba(0,0,0,.16));
				background:conic-gradient(#e4748a 0 25%,#b4632a 0 50%,#157d8c 0 75%,#5b6ba8 0 100%);
				background-size:cover;background-position:center;cursor:grab;
				box-shadow:0 10px 26px rgba(0,0,0,.24),0 0 0 4px color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 55%,transparent);
				transition:transform .18s ease,box-shadow .18s ease;
				touch-action:none;position:relative;
			}
			.orb::after{
				content:"";position:absolute;inset:0;border-radius:50%;
				box-shadow:inset 0 0 0 3px color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 72%,transparent);
			}
			.orb:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 14px 32px rgba(0,0,0,.28),0 0 0 4px color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 55%,transparent)}
			.orb:active{cursor:grabbing;transform:scale(.97)}
			.orb:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4176e6);outline-offset:3px}
			.panel{
				position:absolute;right:0;bottom:58px;width:406px;padding:16px 16px 12px;
				border-radius:20px;border:1px solid var(--dsw-alias-border-l3,rgba(0,0,0,.14));
				background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 90%,transparent);
				-webkit-backdrop-filter:blur(22px) saturate(1.15);backdrop-filter:blur(22px) saturate(1.15);
				box-shadow:0 26px 64px rgba(0,0,0,.30),0 2px 8px rgba(0,0,0,.10);
				opacity:0;transform:translateY(10px) scale(.985);pointer-events:none;
				transition:opacity .2s ease,transform .2s ease;
			}
			.panel.open{opacity:1;transform:none;pointer-events:auto}
			.head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:2px 2px 12px}
			.title{font-size:14px;font-weight:600;letter-spacing:.01em;line-height:20px}
			.sub{margin-top:3px;font-size:11.5px;line-height:17px;color:var(--dsw-alias-label-tertiary,#81858c);display:flex;align-items:center;gap:6px}
			.mode{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.1));background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04));font-size:10.5px;line-height:16px;color:var(--dsw-alias-label-secondary,#61666b)}
			.mode i{width:5px;height:5px;border-radius:50%;background:var(--dsw-alias-brand-primary,#4176e6);display:block}
			.mode em{font-style:normal}
			.close{width:24px;height:24px;border-radius:50%;border:0;background:transparent;color:var(--dsw-alias-label-tertiary,#81858c);font-size:16px;line-height:1;cursor:pointer;display:grid;place-items:center}
			.close:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#1b1b1c)}
			.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
			.card{
				position:relative;height:112px;border-radius:15px;overflow:hidden;padding:0;
				border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.1));background:#0d0d10;cursor:pointer;
				transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;text-align:left;
			}
			.card:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(0,0,0,.22)}
			.card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4176e6);outline-offset:2px}
			.card .art{position:absolute;inset:0;background-size:cover;background-position:center;transform:scale(1.02);transition:transform .45s ease}
			.card:hover .art{transform:scale(1.09)}
			.card .shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,12,.82) 0%,rgba(8,8,12,.28) 46%,rgba(8,8,12,0) 72%)}
			.card .label{position:absolute;left:10px;right:10px;bottom:9px;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.55)}
			.card .label b{display:block;font-size:13px;font-weight:600;letter-spacing:.02em;line-height:18px}
			.card .label span{display:block;margin-top:1px;font-size:10.5px;line-height:15px;opacity:.78}
			.card[aria-pressed="true"]{border-color:var(--dsw-alias-brand-primary,#4176e6);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary,#4176e6) 38%,transparent)}
			.card .dot{
				position:absolute;top:8px;right:8px;width:18px;height:18px;border-radius:50%;
				display:grid;place-items:center;font-size:11px;line-height:1;color:#fff;
				background:var(--dsw-alias-brand-primary,#4176e6);opacity:0;transform:scale(.6);
				transition:opacity .18s ease,transform .18s ease;box-shadow:0 2px 8px rgba(0,0,0,.35);
			}
			.card[aria-pressed="true"] .dot{opacity:1;transform:none}
			.card .strip{position:absolute;left:0;right:0;bottom:0;height:3px;display:flex}
			.card .strip i{flex:1;display:block}
			.foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 2px 2px}
			.reset{border:0;background:transparent;padding:4px 6px;border-radius:8px;cursor:pointer;font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-secondary,#61666b)}
			.reset:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#1b1b1c)}
			.kbd{font-size:10.5px;line-height:16px;color:var(--dsw-alias-label-tertiary,#81858c)}
			.kbd b{font-weight:500;padding:1px 5px;border-radius:5px;border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.1));background:var(--dsw-alias-bg-layer-2,rgba(0,0,0,.03));color:var(--dsw-alias-label-secondary,#61666b);font-size:10px}
			@media (max-width:520px){.panel{width:min(92vw,406px)}}
		`;

		class Quartet {
			constructor(ctx) {
				this.ctx = ctx;
				this.current = "none";
				this.tokenDisposer = null;
				this.fallbackTag = null;
				this.styleTag = null;
				this.host = null;
				this.shadow = null;
				this.panel = null;
				this.orb = null;
				this.modeLabel = null;
				this.observer = null;
				this.onKeyDown = this.onKeyDown.bind(this);
				this.onDocPointerDown = this.onDocPointerDown.bind(this);
			}

			mount() {
				this.installCss();
				this.buildUi();
				this.bindGlobal();
				const saved = readStorage(STORAGE_SKIN, "none");
				this.applySkin(saved in SKIN_MAP ? saved : "none", { silent: true });
			}

			destroy() {
				document.removeEventListener("keydown", this.onKeyDown, true);
				document.removeEventListener("pointerdown", this.onDocPointerDown, true);
				if (this.observer !== null) this.observer.disconnect();
				if (this.tokenDisposer !== null) {
					try {
						this.tokenDisposer();
					} catch {
						/* 主题层可能已随宿主卸载 */
					}
					this.tokenDisposer = null;
				}
				if (this.fallbackTag !== null) this.fallbackTag.remove();
				if (this.styleTag !== null) this.styleTag.remove();
				if (this.host !== null) this.host.remove();
				document.documentElement.removeAttribute("data-dsh-quartet");
			}

			/** 装饰样式表：只画背景，不改布局。 */
			installCss() {
				const tag = document.createElement("style");
				tag.dataset.plugin = PLUGIN_ID;
				tag.dataset.pluginCss = `${PLUGIN_ID}/skins`;
				tag.textContent = SKIN_CSS;
				document.head.appendChild(tag);
				this.styleTag = tag;
			}

			mode() {
				return document.body !== null && document.body.hasAttribute("data-ds-dark-theme") ? "深色" : "浅色";
			}

			buildUi() {
				const host = document.createElement("div");
				host.id = PLUGIN_ID;
				const shadow = host.attachShadow({ mode: "open" });

				const style = document.createElement("style");
				style.textContent = UI_CSS;
				shadow.append(style);

				const wrap = document.createElement("div");
				wrap.className = "wrap";

				const panel = document.createElement("div");
				panel.className = "panel";
				panel.setAttribute("role", "dialog");
				panel.setAttribute("aria-label", "主题皮肤");

				const head = document.createElement("div");
				head.className = "head";
				head.innerHTML = `
					<div>
						<div class="title">主题皮肤</div>
						<div class="sub"><span>四套预设 · 点选即刻生效</span><span class="mode"><i></i><em data-mode>浅色</em></span></div>
					</div>
					<button class="close" type="button" aria-label="收起面板">×</button>`;
				panel.append(head);

				const grid = document.createElement("div");
				grid.className = "grid";
				for (const skin of SKINS) {
					const card = document.createElement("button");
					card.type = "button";
					card.className = "card";
					card.dataset.skin = skin.id;
					card.setAttribute("aria-pressed", "false");
					card.title = skin.hint;
					card.innerHTML = `
						<span class="art" style="background-image:var(--q-art-${skin.art})"></span>
						<span class="shade"></span>
						<span class="dot">✓</span>
						<span class="label"><b>${skin.name}</b><span>${skin.sub}</span></span>
						<span class="strip">${skin.swatch.map((color) => `<i style="background:${color}"></i>`).join("")}</span>`;
					card.addEventListener("click", () => this.applySkin(skin.id));
					grid.append(card);
				}
				panel.append(grid);

				const foot = document.createElement("div");
				foot.className = "foot";
				foot.innerHTML = `<button class="reset" type="button">恢复原生外观</button><span class="kbd"><b>Alt</b> + <b>Shift</b> + <b>S</b></span>`;
				foot.querySelector(".reset").addEventListener("click", () => this.applySkin("none"));
				panel.append(foot);

				panel.querySelector(".close").addEventListener("click", () => this.setOpen(false));

				const orb = document.createElement("button");
				orb.type = "button";
				orb.className = "orb";
				orb.title = "主题皮肤（Alt + Shift + S）";
				orb.setAttribute("aria-label", "打开主题皮肤面板");

				wrap.append(panel, orb);
				shadow.append(wrap);
				(document.body !== null ? document.body : document.documentElement).appendChild(host);

				this.host = host;
				this.shadow = shadow;
				this.panel = panel;
				this.orb = orb;
				this.modeLabel = head.querySelector("[data-mode]");
				this.bindOrb(orb);
				this.bindDrag(orb);
			}

			bindOrb(orb) {
				orb.addEventListener("click", (event) => {
					if (orb.dataset.dragged === "1") {
						orb.dataset.dragged = "0";
						event.preventDefault();
						return;
					}
					this.setOpen(!this.panel.classList.contains("open"));
				});
				orb.addEventListener("dblclick", () => {
					this.clearPos();
					this.applySkin("none");
				});
			}

			/** 圆钮可拖，位置记在本地；拖完贴边不越界。 */
			bindDrag(orb) {
				let startX = 0;
				let startY = 0;
				let originRight = 0;
				let originBottom = 0;
				let dragging = false;

				orb.addEventListener("pointerdown", (event) => {
					if (event.button !== 0) return;
					dragging = true;
					orb.dataset.dragged = "0";
					startX = event.clientX;
					startY = event.clientY;
					const rect = this.shadow.querySelector(".wrap").getBoundingClientRect();
					originRight = window.innerWidth - rect.right;
					originBottom = window.innerHeight - rect.bottom;
					orb.setPointerCapture(event.pointerId);
				});

				orb.addEventListener("pointermove", (event) => {
					if (!dragging) return;
					const dx = event.clientX - startX;
					const dy = event.clientY - startY;
					if (Math.abs(dx) + Math.abs(dy) > 4) orb.dataset.dragged = "1";
					const wrap = this.shadow.querySelector(".wrap");
					const right = Math.min(Math.max(originRight - dx, 12), window.innerWidth - 70);
					const bottom = Math.min(Math.max(originBottom + dy, 12), window.innerHeight - 70);
					wrap.style.right = `${right}px`;
					wrap.style.bottom = `${bottom}px`;
				});

				const end = () => {
					if (!dragging) return;
					dragging = false;
					const wrap = this.shadow.querySelector(".wrap");
					writeStorage(STORAGE_POS, JSON.stringify({ right: parseFloat(wrap.style.right || "20"), bottom: parseFloat(wrap.style.bottom || "148") }));
					if (orb.dataset.dragged === "1") this.setOpen(false);
				};
				orb.addEventListener("pointerup", end);
				orb.addEventListener("pointercancel", end);

				try {
					const saved = JSON.parse(readStorage(STORAGE_POS, "null"));
					if (saved !== null && typeof saved.right === "number" && typeof saved.bottom === "number") {
						const wrap = this.shadow.querySelector(".wrap");
						wrap.style.right = `${Math.min(Math.max(saved.right, 12), window.innerWidth - 70)}px`;
						wrap.style.bottom = `${Math.min(Math.max(saved.bottom, 12), window.innerHeight - 70)}px`;
					}
				} catch {
					/* 位置脏数据直接忽略 */
				}
			}

			clearPos() {
				writeStorage(STORAGE_POS, "null");
				const wrap = this.shadow.querySelector(".wrap");
				wrap.style.right = "20px";
				wrap.style.bottom = "148px";
			}

			bindGlobal() {
				document.addEventListener("keydown", this.onKeyDown, true);
				document.addEventListener("pointerdown", this.onDocPointerDown, true);
				this.observer = new MutationObserver(() => this.syncMode());
				if (document.body !== null) {
					this.observer.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
				}
			}

			onKeyDown(event) {
				if (event.altKey && event.shiftKey && (event.key === "S" || event.key === "s")) {
					event.preventDefault();
					this.setOpen(!this.panel.classList.contains("open"));
					return;
				}
				if (event.key === "Escape" && this.panel.classList.contains("open")) {
					this.setOpen(false);
					return;
				}
				if (this.panel.classList.contains("open") && /^[1-4]$/.test(event.key)) {
					const skin = SKINS[Number(event.key) - 1];
					if (skin !== undefined) {
						event.preventDefault();
						this.applySkin(skin.id);
					}
				}
			}

			onDocPointerDown(event) {
				if (!this.panel.classList.contains("open")) return;
				if (event.composedPath().includes(this.host)) return;
				this.setOpen(false);
			}

			setOpen(open) {
				this.panel.classList.toggle("open", open);
				if (open) this.syncMode();
			}

			syncMode() {
				if (this.modeLabel !== null) this.modeLabel.textContent = this.mode();
			}

			sync() {
				for (const card of this.panel.querySelectorAll(".card")) {
					card.setAttribute("aria-pressed", String(card.dataset.skin === this.current));
				}
				if (this.current === "none") {
					this.orb.style.backgroundImage = "";
					this.orb.style.background = "conic-gradient(#e4748a 0 25%,#b4632a 0 50%,#157d8c 0 75%,#5b6ba8 0 100%)";
				} else {
					this.orb.style.background = "";
					this.orb.style.backgroundImage = `var(--q-art-${SKIN_MAP[this.current].art})`;
					this.orb.style.backgroundSize = "cover";
					this.orb.style.backgroundPosition = "center";
				}
				this.syncMode();
			}

			applySkin(id, options = {}) {
				if (id !== "none" && !(id in SKIN_MAP)) id = "none";

				// 换肤：同 source 再调一次即可替换整层，不必先卸载（避免闪一下原生色）。
				if (id === "none") {
					if (this.tokenDisposer !== null) {
						try {
							this.tokenDisposer();
						} catch {
							/* 已随主题服务重建 */
						}
						this.tokenDisposer = null;
					}
					if (this.fallbackTag !== null) {
						this.fallbackTag.remove();
						this.fallbackTag = null;
					}
					document.documentElement.removeAttribute("data-dsh-quartet");
				} else {
					const tokens = TOKENS[id];
					const disposer = overrideTokens(this.ctx, tokens);
					if (disposer !== null) {
						this.tokenDisposer = disposer;
					} else if (this.fallbackTag === null) {
						this.fallbackTag = mountFallback(tokens);
					} else {
						this.fallbackTag.textContent = fallbackCss(tokens);
					}
					document.documentElement.setAttribute("data-dsh-quartet", id);
				}

				this.current = id;
				writeStorage(STORAGE_SKIN, id);
				this.sync();

				if (options.silent !== true && id !== "none") {
					this.panel.animate(
						[
							{ boxShadow: "0 26px 64px rgba(0,0,0,.30), 0 0 0 0 color-mix(in srgb, var(--dsw-alias-brand-primary, #4176e6) 45%, transparent)" },
							{ boxShadow: "0 26px 64px rgba(0,0,0,.30), 0 0 0 10px transparent" },
						],
						{ duration: 420, easing: "ease-out" },
					);
				}
			}
		}

		const inject = ["theme"];

		/**
		 * 浏览器插件入口。
		 * @param ctx - 客户端 cordis 上下文（已注入 theme 服务）。
		 */
		function apply(ctx) {
			if (typeof document === "undefined") return;
			const runtime = new Quartet(ctx);
			ctx.effect(() => {
				runtime.mount();
				return () => runtime.destroy();
			}, "theme-quartet: 换肤面板与令牌层");
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
