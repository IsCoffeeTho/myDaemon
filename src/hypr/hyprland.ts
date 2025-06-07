import hyprEvents from "./events";

const hyprlandSocket = `${process.env["XDG_RUNTIME_DIR"]}/hypr/${process.env["HYPRLAND_INSTANCE_SIGNATURE"]}/.socket.sock`;

export default class hyprland extends hyprEvents {
	constructor() {
		super();
		Bun.connect({
			unix: hyprlandSocket,
			socket: {
				open(socket) {
					console.log(socket);
				},
				data(socket, data) {
					console.log(socket, data);
				}
			}
		});
	}
	
	
}