import { readFileSync } from "fs";

export type batteryOptions = {
	low: number,
	critical: number
};

export type oneshotData = {
	workspace: string,
	class: string,
	prefferedMonitor?: string
};

export type oneshotOptions = {
	[oneshot: string]: oneshotData
};

export type cfgOptions = {
	battery: Partial<batteryOptions>,
	oneshots: Partial<oneshotOptions>
};

export var cfg: Partial<cfgOptions> = {
	battery: {
		low: 10,
		critical: 5
	},
	oneshots: {}
};

export function readConfig(cfgFile: string) {
	var newcfg = {};
	try { 
		newcfg = JSON.parse(readFileSync(cfgFile).toString());
	} catch (err) { console.error(err);return}
	Object.assign(cfg, newcfg);
}