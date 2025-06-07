import batteryService from "./src/services/battery";
import oneshotService from "./src/services/oneshots";
import { cfg, readConfig } from "./src/config";
import hyprland from "./src/hypr/hyprland";

readConfig('/etc/mydaemon/config.json');
readConfig(`${process.env["XDG_CONFIG_HOME"] ?? `${process.env["HOME"]}/.config`}/mydaemon/config.json`);

const hyprctl = new hyprland();

batteryService(hyprctl);
oneshotService(hyprctl);