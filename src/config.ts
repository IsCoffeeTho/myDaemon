import { readFileSync } from "fs";

export type batteryOptions = {
	low: number;
	critical: number;
};

export type oneshotOptions = {
	[oneshotWorkspace: string]: {
		class: string;
		prefferedMonitor?: string;
	};
};

export type cfgOptions = {
	battery: batteryOptions;
	oneshots: oneshotOptions;
};

export var cfg: cfgOptions = {
	battery: {
		low: 10,
		critical: 5,
	},
	oneshots: {},
};

export function readConfig(cfgFile: string) {
	var newcfg = {};
	try {
		newcfg = JSON.parse(readFileSync(cfgFile).toString());
	} catch (err) {
		console.error(err);
		return;
	}
	Object.assign(cfg, newcfg);
}
