import notifier from "node-notifier";
import { cfg } from "../config";
import type hyprland from "../hypr/hyprland";

enum batteryState {
	OK,
	FULL,
	LOW,
	CRITICAL,
}

export default async function batteryService(hyprl: hyprland) {
	var batState = batteryState.OK;

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
		var percent = parseInt(obj["percentage"] ?? "0%");
		if (obj["state"] == "discharging") {
			if (percent <= <number>(<any>cfg.battery).CRITICAL && batState < batteryState.CRITICAL) {
				batState = batteryState.CRITICAL;
				notifier.notify({
					title: "Battery Critically Low",
					message: `Charge the device to avoid losing progress.`,
					urgency: "critical",
				});
			} else if (percent <= <number>(<any>cfg.battery).LOW && batState < batteryState.LOW) {
				batState = batteryState.LOW;
				notifier.notify({
					title: "Battery Level Low",
					message: `Please charge the device soon to avoid losing pogress.`,
					urgency: "critical",
				});
			}
		} else if (obj["state"] != "fully-charged") {
			batState = batteryState.OK;
		} else if (batState != batteryState.FULL) {
			batState = batteryState.FULL;
			notifier.notify({
				title: "Battery is Full",
				message: `You can unplug the device safely.`,
				urgency: "low",
			});
		}
	}
}
