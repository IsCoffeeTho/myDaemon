import { readFileSync } from "fs";

export var cfg: any = {};

const defaultConfig = {
	battery: {
		low: 10,
		critical: 5
	},
	oneshots: {}
}
Object.assign(cfg, defaultConfig);

export function readConfig(cfgFile: string) {
	var newcfg = {};
	try { 
		newcfg = JSON.parse(readFileSync(cfgFile).toString());
	} catch (err) { console.error(err);return}
	Object.assign(cfg, newcfg);
}