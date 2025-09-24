import notifier from "node-notifier";
import { cfg } from "../config";
import type hyprland from "../hypr/hyprland";

enum batteryState {
	ok,
	low,
	critical,
}

export default async function batteryService(hyprl: hyprland) {
	var batState = batteryState.ok;

	var upower = Bun.spawn(["upower", "--monitor-detail"], { stdout: "pipe" });
	var upowerMon = upower.stdout.getReader();

	var decoder = new TextDecoder();

	while (true) {
		var monitor = decoder.decode((await upowerMon.read()).value);
		if (!monitor.match(/^\s+native-path:\s+BAT/g)) continue;
		var obj: { [_: string]: string } = {};
		for (const x of monitor.trim().split("\n")) {
			if (x.trim() !== "battery") {
				const key = x.split(/:\s+(?=[\w\d'])/);
				obj[(<string>key[0]).trim()] = <string>key[1];
			}
		}
		if (obj["state"] == "discharging") {
			var percent = parseInt(obj["percentage"] ?? "0%");
			if (percent <= <number>(<any>cfg.battery).critical && batState < batteryState.critical) {
				batState = batteryState.critical;
				notifier.notify({
					title: "Battery Critically Low",
					message: `Charge the device to avoid losing progress.`,
					urgency: "critical",
				});
			} else if (percent <= <number>(<any>cfg.battery).low && batState < batteryState.low) {
				batState = batteryState.low;
				notifier.notify({
					title: "Battery Level Low",
					message: `Please charge the device soon to avoid losing pogress.`,
					urgency: "critical",
				});
			}
		} else {
			batState = batteryState.ok;
		}
	}
}
