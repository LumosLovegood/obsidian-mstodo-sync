import en from "./locale/en.json";
import zhCN from "./locale/zh-cn.json";

export interface Translations {
	[key: string]: string;
}

const localeMap: { [k: string]: Translations } = {
	en,
	zh: zhCN,
};

const lang = window.localStorage.getItem("language");
const locale = localeMap[lang || "en"];

export function t(str: string): string {
	if (!locale) {
		console.error("Error: locale not found", lang);
	}

	return (locale && locale[str]) || str;
}
