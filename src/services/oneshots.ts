import { cfg } from "../config";
import hyprEvents from "../hypr/events";
import type hyprland from "../hypr/hyprland";

type oneshotDescriptor = {
	class: RegExp,
	workspace: string,
	windows: string[]
};

var oneshots: { [id: string]: oneshotDescriptor } = {

};

var currentWorkspace = "";

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
		
		oneshots[oneshotID] = {
			class: new RegExp(`^(${oneshotdata.class})$`),
			workspace: oneshotdata.workspace,
			windows: []
		};
		
	};
	
	function handleWindow(data: {
		windowAddr: string,
		workspace: string,
		class: string,
		title: string,
	}) {
		for (var oneshotID in oneshots) {
			var oneshotdata = <oneshotDescriptor>oneshots[oneshotID];
			if (!oneshotdata.class.test(data.class))
				continue;
			oneshotdata.windows.push(data.windowAddr);
			break;
		}
	}

	currentWorkspace = hyprl.activeworkspace().name;
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

	hyprl.events.on("closewindow", (data) => {
		for (var oneshotID in oneshots) {
			var oneshot = <oneshotDescriptor>oneshots[oneshotID];
			for (var idx in oneshot.windows) {
				var applications = <string>oneshot.windows[idx];
				if (applications != data.windowAddr)
					continue;
				oneshot.windows = oneshot.windows.filter(v => {
					return v != data.windowAddr;
				});
				if (oneshot.windows.length == 0) {
					if (currentWorkspace == oneshot.workspace)
						hyprl.dispatch("workspace", "m+1");
				}
				return;
			}
		}
	});
	
	hyprl.events.on("workspace", (data) => {
		currentWorkspace = data.name;
	});
}

