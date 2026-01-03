import { cfg, type oneshotOptions } from "../config";
import hyprEvents from "../hypr/events";
import type hyprland from "../hypr/hyprland";

type oneshotDescriptor = {
	class: RegExp;
	windows: string[];
};

var oneshots: { [id: string]: oneshotDescriptor } = {};

var currentWorkspace = "";
var lastNonOneshotWorkspace = "";

export default async function oneshotService(hyprl: hyprland) {
	const defaultMonitor = hyprl.monitors()[0].name;

	for (var oneshotWorkspace in cfg.oneshots) {
		var oneshotdata = <oneshotOptions[keyof oneshotOptions]>cfg.oneshots[oneshotWorkspace];

		const deRegexClassName = oneshotdata.class.replace(/\./g, `\\.`).replace(/\*/g, `.*`);
		hyprl
			.batch()
			.keyword(
				"workspace",
				`name:${oneshotWorkspace}`,
				`monitor:${oneshotdata.prefferedMonitor ?? defaultMonitor}`,
				"gapsout:0",
				"gapsin:0",
				"bordersize:0",
				"persistent:false",
			)
			.keyword("windowrule", `match:class (^${deRegexClassName}$)`, `workspace name:${oneshotWorkspace}`)
			.issue();

		oneshots[oneshotWorkspace] = {
			class: new RegExp(`^(${oneshotdata.class})$`),
			windows: [],
		};
	}

	function handleWindow(data: { windowAddr: string; workspace: string; class: string; title: string }) {
		for (var oneshotID in oneshots) {
			var oneshotdata = <oneshotDescriptor>oneshots[oneshotID];
			if (!oneshotdata.class.test(data.class)) continue;
			oneshotdata.windows.push(data.windowAddr);
			return;
		}
		if (currentWorkspace != lastNonOneshotWorkspace) {
			console.log(data.class, data.windowAddr, "was opened in", data.workspace);
			hyprl.dispatch("movetoworkspacesilent", `name:${lastNonOneshotWorkspace},address:0x${data.windowAddr}`);
		}
	}

	currentWorkspace = hyprl.activeworkspace().name;
	lastNonOneshotWorkspace = currentWorkspace;
	for (var oneshotWorkspace in oneshots) {
		if (oneshotWorkspace == currentWorkspace) {
			lastNonOneshotWorkspace = "1";
			break;
		}
	}
	const openWindows = hyprl.clients();
	for (var openWindow of openWindows) {
		handleWindow({
			windowAddr: openWindow.address,
			workspace: openWindow.workspace.name,
			class: openWindow.class,
			title: openWindow.title,
		});
	}
	hyprl.events.on("openwindow", handleWindow);

	hyprl.events.on("closewindow", data => {
		for (var oneshotWorkspace in oneshots) {
			var oneshot = <oneshotDescriptor>oneshots[oneshotWorkspace];
			for (var idx in oneshot.windows) {
				var applications = <string>oneshot.windows[idx];
				if (applications != data.windowAddr) continue;
				oneshot.windows = oneshot.windows.filter(v => {
					return v != data.windowAddr;
				});
				if (oneshot.windows.length == 0) {
					if (currentWorkspace == oneshotWorkspace) hyprl.dispatch("workspace", `${lastNonOneshotWorkspace ?? "1"}`);
				}
				return;
			}
		}
	});

	hyprl.events.on("workspace", data => {
		currentWorkspace = data.name;
		for (var oneshotWorkspace in oneshots) {
			if (oneshotWorkspace == data.name) return;
		}
		lastNonOneshotWorkspace = data.name;
	});
}
