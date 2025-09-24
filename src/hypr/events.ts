import { EventEmitter } from "events";

const hyprlandEventSocket = `${process.env["XDG_RUNTIME_DIR"]}/hypr/${process.env["HYPRLAND_INSTANCE_SIGNATURE"]}/.socket2.sock`;

export type hyprEventsMap = {
	configreloaded: [];
	urgent: [{ windowAddr: string }];
	activewindowv2: [{ windowAddr: string }];
	closewindow: [{ windowAddr: string }];
	windowtitle: [{ windowAddr: string }];
	openlayer: [{ name: string }];
	closelayer: [{ name: string }];
	workspace: [{ name: string }];
	createworkspace: [{ name: string }];
	destroyworkspace: [{ name: string }];
	workspacev2: [{ workspaceID: string; name: string }];
	createworkspacev2: [{ workspaceID: string; name: string }];
	destroyworkspacev2: [{ workspaceID: string; name: string }];
	openwindow: [{ windowAddr: string; workspace: string; class: string; title: string }];
	activewindow: [{ class: string; title: string }];
	windowtitlev2: [{ windowAddr: string; title: string }];
	screencast: [{ arg1: string; arg2: string }];
};

export default class hyprEvents extends EventEmitter<hyprEventsMap> {
	constructor() {
		super();
		var _this = this;
		Bun.connect({
			unix: hyprlandEventSocket,
			socket: {
				data(socket, data) {
					var events = data.toString().match(/.+/g) || [];
					for (var event of events) {
						var indexOfDataSplit = event.indexOf(">>");
						var eventName = event.slice(0, indexOfDataSplit);
						var eventData = event.slice(indexOfDataSplit + 2).split(",");

						switch (eventName) {
							case "configreloaded":
								_this.emit(eventName);
								break;
							case "urgent":
							case "activewindowv2":
							case "closewindow":
							case "windowtitle":
								_this.emit(eventName, {
									windowAddr: <string>eventData[0],
								});
								break;
							case "openlayer":
							case "closelayer":
							case "workspace":
							case "createworkspace":
							case "destroyworkspace":
								_this.emit(eventName, {
									name: <string>eventData[0],
								});
								break;
							case "workspacev2":
							case "createworkspacev2":
							case "destroyworkspacev2":
								_this.emit(eventName, {
									workspaceID: <string>eventData[0],
									name: <string>eventData[1],
								});
								break;
							case "openwindow":
								_this.emit(eventName, {
									windowAddr: <string>eventData[0],
									workspace: <string>eventData[1],
									class: <string>eventData[2],
									title: <string>eventData[3],
								});
								break;
							case "activewindow":
								_this.emit(eventName, {
									class: <string>eventData[0],
									title: <string>eventData[1],
								});
								break;
							case "windowtitlev2":
								_this.emit(eventName, {
									windowAddr: <string>eventData[0],
									title: <string>eventData[1],
								});
								break;
							case "screencast":
								_this.emit(eventName, {
									arg1: <string>eventData[0],
									arg2: <string>eventData[1],
								});
								break;
							default:
								console.log(eventName, eventData);
								// _this.emit(eventName, eventData);
								break;
						}
					}
				},
			},
		});
	}
}
