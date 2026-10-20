/**
 * 宿主半边：空实现。
 *
 * 作用只有一个 —— 让本包出现在 Loader 的 entries 里。client-modules 扫描
 * package.json 的 dsh.client 声明后，会把浏览器半边挂进 __DSH_BOOT__，
 * 真正的换肤逻辑全在 lib/client.js。
 */
export const name = "dsh-theme-quartet";

export function apply() {
	/* 无宿主侧行为：不注册工具、不监听事件、不写磁盘。 */
}
