import hyprEvents from "./events";

const hyprlandSocket = `${process.env["XDG_RUNTIME_DIR"]}/hypr/${process.env["HYPRLAND_INSTANCE_SIGNATURE"]}/.socket.sock`;

class batchableCommandHandler {
	#issue: ((...cmd: string[]) => any);
	constructor(issue: ((...cmd: string[]) => any)) {
		this.#issue = issue;
	}

	dispatch(dispatcher: string, command?: string) {
		this.#issue(`dispatch`, dispatcher, ...((command ?? "").split(" ")));
		return this;
	}
	keyword(keyword: string, ...args: string[]) {
		this.#issue(`keyword`, keyword, args.join(','));
		return this;
	}
	setcursor(theme: string, size: number) {
		this.#issue(`setcursor`, theme, `${Math.floor(size)}`);
		return this;
	}

	createOutput(backend: string, name: string) {
		this.#issue(`output`, `add`, backend, name);
		return this;
	}
	destroyOutput(name: string) {
		this.#issue(`output`, `remove`, name);
		return this;
	}

	switchXKBLayout(device: string, cmd: string) {
		this.#issue(`switchxkblayout`, device, cmd);
		return this;
	}

	setError(message: string, borderColor: string = "rgba(ffaaaaff)") {
		this.#issue(`switchxkblayout`, borderColor, message);
		return this;
	}
	clearError() {
		this.#issue(`seterror`, "disable");
		return this;
	}

	notify(message: string, icon: number = -1, color: string = "0", time_ms: number = 10000) {
		this.#issue(`notify`, `${icon}`, `${time_ms}`, color, message);
		return this;
	}

	dismissNotify(amount?: number) {
		this.#issue(`dismissnotify`, ...(amount ? [`${amount}`] : []));
		return this;
	}
}

class commandHandler extends batchableCommandHandler {
	#issue: ((...cmd: string[]) => string);
	constructor(issue: ((...cmd: string[]) => string)) {
		super(issue);
		this.#issue = issue;
	}

	binds() { return JSON.parse(this.#issue("binds", "-j")); }
	layers() { return JSON.parse(this.#issue("layers", "-j")); }
	splash() { return JSON.parse(this.#issue("splash", "-j")); }
	locked() { return JSON.parse(this.#issue("locked", "-j")); }
	submap() { return JSON.parse(this.#issue("submap", "-j")); }
	clients() { return JSON.parse(this.#issue("clients", "-j")); }
	devices() { return JSON.parse(this.#issue("devices", "-j")); }
	layouts() { return JSON.parse(this.#issue("layouts", "-j")); }
	version() { return JSON.parse(this.#issue("version", "-j")); }
	monitors() { return JSON.parse(this.#issue("monitors", "-j")); }
	cursorpos() { return JSON.parse(this.#issue("cursorpos", "-j")); }
	instances() { return JSON.parse(this.#issue("instances", "-j")); }
	workspaces() { return JSON.parse(this.#issue("workspaces", "-j")); }
	animations() { return JSON.parse(this.#issue("animations", "-j")); }
	rollinglog() { return JSON.parse(this.#issue("rollinglog", "-j")); }
	configerrors() { return JSON.parse(this.#issue("configerrors", "-j")); }
	descriptions() { return JSON.parse(this.#issue("descriptions", "-j")); }
	activewindow() { return JSON.parse(this.#issue("activewindow", "-j")); }
	workspacerules() { return JSON.parse(this.#issue("workspacerules", "-j")); }
	activeworkspace() { return JSON.parse(this.#issue("activeworkspace", "-j")); }
	getoption(option: string) { return JSON.parse(this.#issue("getoption", option, "-j")); }
	decorations(window: string) { return JSON.parse(this.#issue("decorations", window, "-j")); }

	// Batching these make no sense

	reload() { this.#issue(`reload`); return this; }
	kill() { this.#issue(`kill`); return this; }
}

export default class hyprland extends commandHandler {
	readonly events: hyprEvents = new hyprEvents();
	#issuer: ((...cmd: string[]) => string);
	constructor() {
		var issuer = (...cmd: string[]) => {
			return Bun.spawnSync(['hyprctl', ...cmd], {stderr:"ignore",stdout:"pipe"}).stdout.toString();
		};
		super(issuer);
		this.#issuer = issuer;
	}

	batch() {
		var issuer = this.#issuer;
		var commands: string[] = [];
		return new (class batch extends batchableCommandHandler {
			constructor() {
				super((...cmd: string[]) => {
					commands.push(cmd.join(" "));
				});
			}
			issue() {
				if (commands.length == 0)
					return;
				console.log(issuer(`--batch`, `--`, commands.join(" ; ")));
			}
		})();
	}
}