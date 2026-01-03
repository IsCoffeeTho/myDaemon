import batteryService from "./src/services/battery";
import oneshotService from "./src/services/oneshots";
import { cfg, readConfig } from "./src/config";
import hyprland from "./src/hypr/hyprland";

const pidFile = Bun.file(`${process.env["HOME"]}/.mydaemon.pid`);
if (await pidFile.exists()) {
	var runningPid = await pidFile.text();
	var pidCheck = Bun.spawnSync(["ps", "-p", runningPid]);
	var lines = pidCheck.stdout.toString().split("\n");
	console.log(lines);
	if (lines.length > 2) {
		console.log("mydaemon is already running; closing this instance");
		process.exit(0);
	}
}
pidFile.write(`${process.pid}`);

readConfig("/etc/mydaemon/config.json");
readConfig(`${process.env["XDG_CONFIG_HOME"] ?? `${process.env["HOME"]}/.config`}/mydaemon/config.json`);

const hyprctl = new hyprland();

batteryService(hyprctl);
oneshotService(hyprctl);
