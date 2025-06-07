import batteryService from "./src/services/battery";
import hyprEvents from "./src/hypr/hyprland";
import oneshotService from "./src/services/oneshots";
import { cfg, readConfig } from "./src/config";

readConfig('/etc/mydaemon/config.json');
readConfig(`${process.env["XDG_CONFIG_HOME"] ?? `${process.env["HOME"]}/.config`}/mydaemon/config.json`);

const hyprev = new hyprEvents();

batteryService(hyprev);
oneshotService(hyprev);