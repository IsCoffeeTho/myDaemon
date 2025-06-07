import { EventEmitter } from "events";

export default class hyprland extends EventEmitter {
	constructor() {
		super();
		const HIS = process.env["HYPRLAND_INSTANCE_SIGNATURE"];
		const XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
		const hypreventSocket = `${XDG_RUNTIME_DIR}/hypr/${HIS}/.socket2.sock`;
		var _this = this;
		Bun.connect({
			unix: hypreventSocket,
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
									windowAddr: eventData[0]
								});
								break;
							case "openlayer":
							case "closelayer":
							case "workspace":
							case "createworkspace":
							case "destroyworkspace":
								_this.emit(eventName, {
									name: eventData[0]
								});
								break;
							case "workspacev2":
							case "createworkspacev2":
							case "destroyworkspacev2":
								_this.emit(eventName, {
									workspaceID: eventData[0],
									name: eventData[1]
								});
								break;
							case "openwindow":
								_this.emit(eventName, {
									windowAddr: eventData[0],
									workspace: eventData[1],
									class: eventData[2],
									title: eventData[3],
								});
								break;
							case "activewindow":
								_this.emit(eventName, {
									class: eventData[0],
									title: eventData[1]
								});
								break;
							case "windowtitlev2":
								_this.emit(eventName, {
									windowAddr: eventData[0],
									title: eventData[1]
								});
								break;
							default:
								console.log(eventName, eventData);
								_this.emit(eventName, eventData);
								break;
						}
					}
				},
			}
		});
	}
}