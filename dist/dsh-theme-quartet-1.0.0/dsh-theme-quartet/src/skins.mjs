/**
 * 四套皮肤的单一数据源。
 *
 * 每套皮肤给出 light / dark 两套色板，再由 tokensFor() 映射成
 * DeepSeek Harness 的设计令牌（--dsw-alias-* / --dsw-specific-*）。
 * 构建脚本用同一份数据产出 lib/client.js 和 preview.html，
 * 因此"预览看到的"与"装进 DSH 的"必然一致。
 */

/** #RRGGBB → rgba()，用于按底色推导纱幕。 */
function tint(hex, alpha) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (match === null) return hex;
  const value = Number.parseInt(match[1], 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
}

/** 补齐可推导字段，避免每套色板重复写一遍。 */
function normalize(p, mode) {
  const light = mode === 'light';
  return {
    ...p,
    dimmed: p.dimmed || p.layer3,
    toastBg: p.toastBg || p.label1,
    toastLabel: p.toastLabel || (light ? '#FFFFFF' : '#0F1115'),
    tooltipBg: p.tooltipBg || p.label1,
    tag: p.tag || p.codeBanner,
    inlineCode: p.inlineCode || p.code,
    scrollbarHover: p.scrollbarHover || p.scrollbar,
    link: p.link || p.accent,
    idle: p.idle || p.border4,
    // 纱幕两层：正文所在的中间带近乎纸面，两侧留白处透气看得到画面
    veil: tint(p.base, light ? 0.95 : 0.93),
    veilSoft: tint(p.base, light ? 0.55 : 0.50),
    veilClear: tint(p.base, light ? 0.26 : 0.24),
  };
}

export const SKINS = [
  {
    id: 'jk',
    name: '樱风',
    sub: 'JK · 制服与樱花',
    hint: '藏青 × 制服红 × 奶油粉',
    swatch: ['#FBF6F3', '#C8434F', '#2C3145', '#EFCFD2'],
    art: 'jk',
    radius: { xs: 6, sm: 8, md: 12, lg: 16, xl: 20 },
    light: normalize({
      base: '#FBF6F3',
      layer1: '#FFFFFF',
      layer2: '#F8F0EF',
      layer3: '#F2E7E7',
      sidebar: '#F9F2F1',
      label1: '#2C3145',
      label2: '#5A6076',
      label3: '#8A8FA2',
      caption: '#A6AAB8',
      border1: 'rgba(44,49,69,0.06)',
      border2: 'rgba(44,49,69,0.10)',
      border3: 'rgba(44,49,69,0.14)',
      border4: 'rgba(44,49,69,0.20)',
      accent: '#C8434F',
      accentText: '#FFFFFF',
      accentSoft: '#F7DFE2',
      hover: 'rgba(200,67,79,0.07)',
      active: 'rgba(200,67,79,0.13)',
      bubble: '#F6E3E4',
      bubbleHi: '#EFCFD2',
      code: '#F7F0EB',
      codeBanner: '#F2E7E1',
      menu: 'rgba(255,255,255,0.92)',
      input: '#FFFFFF',
      scrollbar: '#E3D4D5',
      glow: 'rgba(255,196,210,0.42)',
      line: 'rgba(200,67,79,0.05)',
    }, 'light'),
    dark: normalize({
      base: '#191723',
      layer1: '#201D2B',
      layer2: '#272334',
      layer3: '#2F2A3D',
      sidebar: '#1C1A26',
      label1: '#F4EEF2',
      label2: '#C6BFCE',
      label3: '#9A93A8',
      caption: '#7C7688',
      border1: 'rgba(255,255,255,0.06)',
      border2: 'rgba(255,255,255,0.10)',
      border3: 'rgba(255,255,255,0.14)',
      border4: 'rgba(255,255,255,0.20)',
      accent: '#F08CA0',
      accentText: '#2A1119',
      accentSoft: '#3A2630',
      hover: 'rgba(240,140,160,0.10)',
      active: 'rgba(240,140,160,0.16)',
      bubble: '#2E2733',
      bubbleHi: '#382F3F',
      code: '#211E2A',
      codeBanner: '#262232',
      menu: 'rgba(38,34,49,0.94)',
      input: '#242030',
      scrollbar: '#3A3344',
      glow: 'rgba(240,140,160,0.20)',
      line: 'rgba(240,140,160,0.05)',
    }, 'dark'),
    surface: `
      background-image:
        radial-gradient(110% 82% at 100% 0%, var(--q-glow), transparent 58%),
        repeating-linear-gradient(135deg, var(--q-line) 0 1.5px, transparent 1.5px 13px),
        linear-gradient(90deg, var(--q-veil-soft) 0%, var(--q-veil) 14%, var(--q-veil) 78%, var(--q-veil-clear) 100%),
        var(--q-art);
      background-size: auto, auto, auto, cover;
      background-position: center, center, center, left center;
      background-repeat: no-repeat, repeat, no-repeat, no-repeat;`,
  },
  {
    id: 'tech',
    name: '褐东风',
    sub: '科技褐 · 云纹铜构',
    hint: '青铜 × 焦褐 × 仪表金',
    swatch: ['#14100C', '#A9661C', '#D89B4A', '#3A2A16'],
    art: 'tech',
    radius: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
    light: normalize({
      base: '#F3EBDF',
      layer1: '#FBF5EC',
      layer2: '#EDE2D1',
      layer3: '#E4D6C2',
      sidebar: '#EFE5D7',
      label1: '#201A12',
      label2: '#57493A',
      label3: '#8A7A66',
      caption: '#A2937E',
      border1: 'rgba(60,44,28,0.07)',
      border2: 'rgba(60,44,28,0.12)',
      border3: 'rgba(60,44,28,0.17)',
      border4: 'rgba(60,44,28,0.24)',
      accent: '#A9661C',
      accentText: '#FFF8EC',
      accentSoft: '#F0DDC0',
      hover: 'rgba(169,102,28,0.08)',
      active: 'rgba(169,102,28,0.14)',
      bubble: '#EFE0CA',
      bubbleHi: '#E6D2B6',
      code: '#EDE3D3',
      codeBanner: '#E7DAC6',
      menu: 'rgba(251,245,236,0.94)',
      input: '#FDF8F1',
      scrollbar: '#D8C7B0',
      glow: 'rgba(216,155,74,0.30)',
      line: 'rgba(120,84,44,0.06)',
    }, 'light'),
    dark: normalize({
      base: '#14100C',
      layer1: '#1C1711',
      layer2: '#241D15',
      layer3: '#2D241A',
      sidebar: '#17120D',
      label1: '#F2E6D3',
      label2: '#C9B79C',
      label3: '#9C8A72',
      caption: '#7E6F5B',
      border1: 'rgba(255,255,255,0.06)',
      border2: 'rgba(255,255,255,0.10)',
      border3: 'rgba(255,255,255,0.15)',
      border4: 'rgba(255,255,255,0.22)',
      accent: '#D89B4A',
      accentText: '#1C1206',
      accentSoft: '#3A2A16',
      hover: 'rgba(216,155,74,0.10)',
      active: 'rgba(216,155,74,0.16)',
      bubble: '#2A2118',
      bubbleHi: '#342819',
      code: '#1B1610',
      codeBanner: '#211A12',
      menu: 'rgba(36,29,21,0.94)',
      input: '#221B13',
      scrollbar: '#3A2E20',
      glow: 'rgba(216,155,74,0.18)',
      line: 'rgba(216,155,74,0.05)',
    }, 'dark'),
    surface: `
      background-image:
        radial-gradient(100% 90% at 100% 100%, var(--q-glow), transparent 60%),
        repeating-linear-gradient(0deg, var(--q-line) 0 1px, transparent 1px 26px),
        repeating-linear-gradient(90deg, var(--q-line) 0 1px, transparent 1px 26px),
        linear-gradient(90deg, var(--q-veil-soft) 0%, var(--q-veil) 14%, var(--q-veil) 78%, var(--q-veil-clear) 100%),
        var(--q-art);
      background-size: auto, auto, auto, auto, cover;
      background-position: center, center, center, center, left center;
      background-repeat: no-repeat, repeat, repeat, no-repeat, no-repeat;`,
  },
  {
    id: 'wave',
    name: '潮汐',
    sub: '波浪 · 青海白沫',
    hint: '深青 × 靛蓝 × 浪白',
    swatch: ['#07181D', '#157D8C', '#3FC3CF', '#C9E6EA'],
    art: 'wave',
    radius: { xs: 8, sm: 10, md: 14, lg: 20, xl: 28 },
    light: normalize({
      base: '#F2F7F8',
      layer1: '#FFFFFF',
      layer2: '#E9F2F4',
      layer3: '#DDECEF',
      sidebar: '#EAF3F5',
      label1: '#0E2A33',
      label2: '#3C5A63',
      label3: '#6B8791',
      caption: '#8FA6AE',
      border1: 'rgba(14,42,51,0.06)',
      border2: 'rgba(14,42,51,0.10)',
      border3: 'rgba(14,42,51,0.14)',
      border4: 'rgba(14,42,51,0.20)',
      accent: '#157D8C',
      accentText: '#F2FDFF',
      accentSoft: '#D6EDF0',
      hover: 'rgba(21,125,140,0.07)',
      active: 'rgba(21,125,140,0.13)',
      bubble: '#DCEFF2',
      bubbleHi: '#C9E6EA',
      code: '#E9F1F2',
      codeBanner: '#E1ECEE',
      menu: 'rgba(255,255,255,0.92)',
      input: '#FFFFFF',
      scrollbar: '#C4D8DC',
      glow: 'rgba(90,200,212,0.28)',
      line: 'rgba(21,125,140,0.05)',
    }, 'light'),
    dark: normalize({
      base: '#07181D',
      layer1: '#0C2229',
      layer2: '#112B33',
      layer3: '#17343D',
      sidebar: '#081B21',
      label1: '#E4F3F5',
      label2: '#A9C8CE',
      label3: '#7EA1A8',
      caption: '#63848B',
      border1: 'rgba(255,255,255,0.06)',
      border2: 'rgba(255,255,255,0.10)',
      border3: 'rgba(255,255,255,0.14)',
      border4: 'rgba(255,255,255,0.20)',
      accent: '#3FC3CF',
      accentText: '#052A30',
      accentSoft: '#123C43',
      hover: 'rgba(63,195,207,0.10)',
      active: 'rgba(63,195,207,0.16)',
      bubble: '#103038',
      bubbleHi: '#164049',
      code: '#0B1F25',
      codeBanner: '#0F262D',
      menu: 'rgba(17,43,51,0.94)',
      input: '#0F2830',
      scrollbar: '#1E3E46',
      glow: 'rgba(63,195,207,0.16)',
      line: 'rgba(63,195,207,0.05)',
    }, 'dark'),
    surface: `
      background-image:
        radial-gradient(120% 70% at 0% 100%, var(--q-glow), transparent 62%),
        repeating-linear-gradient(180deg, transparent 0 34px, var(--q-line) 34px 35px),
        linear-gradient(90deg, var(--q-veil-soft) 0%, var(--q-veil) 14%, var(--q-veil) 78%, var(--q-veil-clear) 100%),
        var(--q-art);
      background-size: auto, auto, auto, cover;
      background-position: center, center, center, left center;
      background-repeat: no-repeat, repeat, no-repeat, no-repeat;`,
  },
  {
    id: 'moon',
    name: '月壤',
    sub: '月球 · 银灰陨野',
    hint: '月岩灰 × 星蓝 × 银紫',
    swatch: ['#0A0B10', '#5B6BA8', '#9FB0D8', '#E1E4EE'],
    art: 'moon',
    radius: { xs: 8, sm: 12, md: 16, lg: 22, xl: 30 },
    light: normalize({
      base: '#F4F5F9',
      layer1: '#FFFFFF',
      layer2: '#ECEEF5',
      layer3: '#E1E4EE',
      sidebar: '#EEF0F6',
      label1: '#161A26',
      label2: '#414A61',
      label3: '#6F788F',
      caption: '#949BB0',
      border1: 'rgba(22,26,38,0.06)',
      border2: 'rgba(22,26,38,0.10)',
      border3: 'rgba(22,26,38,0.14)',
      border4: 'rgba(22,26,38,0.20)',
      accent: '#5B6BA8',
      accentText: '#FFFFFF',
      accentSoft: '#DDE2F2',
      hover: 'rgba(91,107,168,0.07)',
      active: 'rgba(91,107,168,0.13)',
      bubble: '#E3E7F4',
      bubbleHi: '#D3D9EC',
      code: '#EDEFF6',
      codeBanner: '#E6E9F2',
      menu: 'rgba(255,255,255,0.92)',
      input: '#FFFFFF',
      scrollbar: '#CCD1DE',
      glow: 'rgba(180,194,235,0.35)',
      line: 'rgba(22,26,38,0.045)',
    }, 'light'),
    dark: normalize({
      base: '#0A0B10',
      layer1: '#11131B',
      layer2: '#171A25',
      layer3: '#1F2330',
      sidebar: '#0C0E14',
      label1: '#EAEDF5',
      label2: '#ADB4C7',
      label3: '#7F879B',
      caption: '#626A7E',
      border1: 'rgba(255,255,255,0.06)',
      border2: 'rgba(255,255,255,0.10)',
      border3: 'rgba(255,255,255,0.14)',
      border4: 'rgba(255,255,255,0.20)',
      accent: '#9FB0D8',
      accentText: '#0C1120',
      accentSoft: '#202741',
      hover: 'rgba(159,176,216,0.10)',
      active: 'rgba(159,176,216,0.16)',
      bubble: '#161A26',
      bubbleHi: '#1E2331',
      code: '#0F1119',
      codeBanner: '#131620',
      menu: 'rgba(23,26,37,0.94)',
      input: '#12151E',
      scrollbar: '#252B3A',
      glow: 'rgba(159,176,216,0.14)',
      line: 'rgba(159,176,216,0.045)',
    }, 'dark'),
    surface: `
      background-image:
        radial-gradient(70% 50% at 82% 12%, var(--q-glow), transparent 65%),
        radial-gradient(1.4px 1.4px at 18% 22%, rgba(255,255,255,0.55), transparent 100%),
        radial-gradient(1.2px 1.2px at 34% 12%, rgba(255,255,255,0.40), transparent 100%),
        radial-gradient(1.6px 1.6px at 58% 28%, rgba(255,255,255,0.45), transparent 100%),
        radial-gradient(1.2px 1.2px at 72% 8%, rgba(255,255,255,0.35), transparent 100%),
        linear-gradient(90deg, var(--q-veil-soft) 0%, var(--q-veil) 14%, var(--q-veil) 78%, var(--q-veil-clear) 100%),
        var(--q-art);
      background-size: auto, auto, auto, auto, auto, auto, cover;
      background-position: center, center, center, center, center, center, left center;
      background-repeat: no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat;`,
  },
];

/** 皮肤 id → 皮肤定义 */
export const SKIN_MAP = Object.fromEntries(SKINS.map((s) => [s.id, s]));

/** 皮肤 id → 设计令牌覆盖表（每个令牌都是 { light, dark } 对）。 */
export function tokensFor(skin) {
  const L = skin.light;
  const D = skin.dark;
  const pair = (key) => ({ light: L[key], dark: D[key] });
  const fixed = (value) => ({ light: value, dark: value });

  /** token 名 → 色板字段名 */
  const colors = {
    '--dsw-alias-bg-base': 'base',
    '--dsw-alias-bg-document-preview': 'layer2',
    '--dsw-alias-bg-layer-1': 'layer1',
    '--dsw-alias-bg-layer-2': 'layer2',
    '--dsw-alias-bg-layer-3': 'layer3',
    '--dsw-alias-bg-module-platform': 'layer2',
    '--dsw-alias-bg-multi-select': 'layer3',
    '--dsw-alias-bg-overlay': 'layer3',
    '--dsw-alias-bg-skeleton': 'border1',
    '--dsw-alias-label-primary': 'label1',
    '--dsw-alias-label-primary-dimmed': 'label1',
    '--dsw-alias-label-primary-bluish': 'label1',
    '--dsw-alias-label-primary-inverted': 'base',
    '--dsw-alias-label-primary-foreground': 'accentText',
    '--dsw-alias-label-secondary': 'label2',
    '--dsw-alias-label-tertiary': 'label3',
    '--dsw-alias-label-caption': 'caption',
    '--dsw-alias-label-dimmed': 'dimmed',
    '--dsw-alias-menu-icon': 'label2',
    '--dsw-alias-border-l1': 'border1',
    '--dsw-alias-border-l2': 'border2',
    '--dsw-alias-border-l2-darkmode-thin': 'border2',
    '--dsw-alias-border-l3': 'border3',
    '--dsw-alias-border-l4': 'border4',
    '--dsw-alias-brand-primary': 'accent',
    '--dsw-alias-brand-text': 'accent',
    '--dsw-alias-button-primary-fill': 'accent',
    '--dsw-alias-button-primary-hover': 'accent',
    '--dsw-alias-button-primary-dimmed': 'accentSoft',
    '--dsw-alias-button-info-fill': 'accent',
    '--dsw-alias-button-info-hover': 'accent',
    '--dsw-alias-button-contrast-fill': 'label1',
    '--dsw-alias-button-floating-fill': 'layer1',
    '--dsw-alias-button-floating-hover': 'layer2',
    '--dsw-alias-button-ghost-active-fill': 'layer3',
    '--dsw-alias-button-ghost-active-hover': 'layer2',
    '--dsw-alias-interactive-bg-hover': 'hover',
    '--dsw-alias-interactive-bg-hover-solid': 'layer2',
    '--dsw-alias-interactive-bg-hover-accent': 'hover',
    '--dsw-alias-interactive-bg-active': 'active',
    '--dsw-alias-markdown-code-block': 'code',
    '--dsw-alias-markdown-code-block-banner': 'codeBanner',
    '--dsw-alias-markdown-inline-code': 'inlineCode',
    '--dsw-alias-markdown-tag': 'tag',
    '--dsw-alias-markdown-citation': 'layer2',
    '--dsw-alias-markdown-placeholder': 'layer2',
    '--dsw-alias-state-business-primary': 'accent',
    '--dsw-alias-state-business-tertiary': 'accentSoft',
    '--dsw-alias-state-idle-primary': 'idle',
    '--dsw-alias-link': 'link',
    '--dsw-alias-switch-thumb': 'base',
    '--dsw-alias-toast-bg': 'toastBg',
    '--dsw-alias-toast-label': 'toastLabel',
    '--dsw-alias-tooltip-bg': 'tooltipBg',
    '--dsw-alias-turn-trigger-bg': 'code',
    '--dsw-alias-turn-trigger-bg-hover': 'hover',
    '--dsw-alias-menu-group-header-fill': 'menu',
    '--dsw-alias-scrollbar-bg-l1': 'scrollbar',
    '--dsw-alias-scrollbar-bg-l2': 'scrollbar',
    '--dsw-alias-scrollbar-hover-l1': 'scrollbarHover',
    '--dsw-alias-scrollbar-hover-l2': 'scrollbarHover',
    '--dsw-alias-state-success-primary': 'success',
    '--dsw-alias-state-error-primary': 'danger',
    '--dsw-specific-sidebar-fill': 'sidebar',
    '--dsw-specific-sidebar-nav-item-active': 'layer3',
    '--dsw-specific-sidebar-nav-item-hover': 'hover',
    '--dsw-specific-sidebar-nav-item-active-accent': 'accentSoft',
    '--dsw-specific-input-major': 'input',
    '--dsw-specific-menu': 'menu',
    '--dsw-specific-selector': 'layer2',
    '--dsw-specific-tip': 'layer3',
    '--dsw-specific-bubble': 'bubble',
    '--dsw-specific-bubble-highlight': 'bubbleHi',
  };

  const tokens = {};
  for (const [token, key] of Object.entries(colors)) {
    if (L[key] && D[key]) tokens[token] = pair(key);
  }

  tokens['--dsw-focus-ring-color'] = pair('accent');
  tokens['--dsw-alias-state-success-primary'] = fixed('#22C55E');
  tokens['--dsw-alias-state-error-primary'] = fixed(skin.id === 'jk' ? '#D63A4A' : '#EF4444');

  for (const [name, px] of Object.entries(skin.radius)) tokens[`--dsw-radius-${name}`] = fixed(`${px}px`);

  return tokens;
}

/** 皮肤 id → 背景装饰 CSS（只作用于会话滚动区，不动侧栏与输入区）。 */
export function surfaceCss(skin) {
  return `html[data-dsh-quartet="${skin.id}"] body{--q-art:var(--q-art-${skin.art});--q-veil:${skin.light.veil};--q-veil-soft:${skin.light.veilSoft};--q-veil-clear:${skin.light.veilClear};--q-glow:${skin.light.glow};--q-line:${skin.light.line};}
html[data-dsh-quartet="${skin.id}"] body[data-ds-dark-theme]{--q-veil:${skin.dark.veil};--q-veil-soft:${skin.dark.veilSoft};--q-veil-clear:${skin.dark.veilClear};--q-glow:${skin.dark.glow};--q-line:${skin.dark.line};}
html[data-dsh-quartet="${skin.id}"] [data-conversation-scroll]{${skin.surface}
  background-color:var(--dsw-alias-bg-base);}
html[data-dsh-quartet="${skin.id}"] ::selection{background:${skin.light.accentSoft};color:${skin.light.label1};}
html[data-dsh-quartet="${skin.id}"] body[data-ds-dark-theme] ::selection{background:${skin.dark.accentSoft};color:${skin.dark.label1};}`;
}
