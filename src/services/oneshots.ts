import { cfg } from "../config";
import type hyprland from "../hypr/hyprland";

var oneshotwindows: { [_: string]: string[] } = {

};

export default async function oneshotService(hyprl: hyprland) {
	for (var oneshotID in cfg.oneshots) {
		var oneshotdata = cfg.oneshots[oneshotID];

		hyprl.batch().keyword("workspace",
			`name:${oneshotdata.workspace}`,
			"gapsout:0",
			"gapsin:0",
			"bordersize:0",
			"persistent:false"
		).keyword("windowrule",
			`workspace name:${oneshotdata.workspace}`,
			`class:${oneshotdata.class}`
		).issue();
	};

	hyprl.events.on("openwindow", (data) => {
		if (!cfg.oneshots)
			return;
		for (var oneshotID in cfg.oneshots) {
			var oneshotdata = cfg.oneshots[oneshotID];
			if (oneshotdata.class != data.class)
				continue;
			if (!oneshotwindows[data.class])
				oneshotwindows[data.class] = [];
			(<string[]>oneshotwindows[data.class]).push(data.windowAddr);
		}
	});

	hyprl.events.on("closewindow", (data) => {
		var openOneshots = Object.keys(oneshotwindows);
		for (var openOneshot of openOneshots) {
			var oneshotApplications = oneshotwindows[openOneshot];
			if (!oneshotApplications)
				continue;
			for (var idx in oneshotApplications) {
				var applications = oneshotApplications[idx];
				if (applications != data.windowAddr)
					continue;
				oneshotwindows[openOneshot] = oneshotApplications.filter(v => {
					return v != data.windowAddr;
				});
				if ((<string[]>oneshotwindows[openOneshot]).length == 0) {
					Bun.spawnSync(["hyprctl", "dispatch", "workspace", "m+1"]);
					delete oneshotwindows[openOneshot];
				}
				return;
			}
		}
	});

}

