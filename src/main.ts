import { createTimeLine } from "./command/uptimerCommand";
import { Editor, MarkdownView, Plugin } from "obsidian";
import { TodoApi } from "./api/todoApi";
import { UptimerApi } from "./api/uptimerApi";
import {
	DEFAULT_SETTINGS,
	MsTodoSyncSettings,
	MsTodoSyncSettingTab,
} from "./gui/msTodoSyncSettingTab";
import {
	createTodayTasks,
	postTask,
	getTaskIdFromLine,
} from "./command/msTodoCommand";
import { BotManager } from "./bot/botManager";
import { createTodaySummary } from "./command/summaryCommand";
import { t } from "./lib/lang";
import { log, logging } from "./lib/logging";

export default class MsTodoSync extends Plugin {
	settings: MsTodoSyncSettings;
	public todoApi: TodoApi;
	public uptimerApi: UptimerApi;
	public botManager: BotManager = new BotManager(this);

	async onload() {
		logging.registerConsoleLogger();

		log(
			"info",
			`loading plugin "${this.manifest.name}" v${this.manifest.version}`
		);

		await this.loadSettings();
		const item = this.addStatusBarItem();
		// 在右键菜单中注册命令：将选中的文字创建微软待办
		// Register command in the context menu: Create to Do with the selected text
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item.setTitle(t("EditorMenu_SyncToTodo")).onClick(
						async () =>
							await postTask(
								this.todoApi,
								this.settings.todoListSync?.listId,
								editor,
								this.app.workspace.getActiveFile()?.basename,
								this
							)
					);
				});
			})
		);

		// 在右键菜单中注册命令：将选中的文字创建微软待办并替换
		// Register command in the context menu: Create and replace the selected text to Microsoft To-Do
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item.setTitle(t("EditorMenu_SyncToTodoAndReplace")).onClick(
						async () =>
							await postTask(
								this.todoApi,
								this.settings.todoListSync?.listId,
								editor,
								this.app.workspace.getActiveFile()?.basename,
								this,
								true
							)
					);
				});
			})
		);

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item.setTitle(t("EditorMenu_OpenToDo")).onClick(
						async () => {
							const cursorLocation = editor.getCursor();
							const line = editor.getLine(cursorLocation.line);
							const taskId = getTaskIdFromLine(line, this);
							if (taskId !== "") {
								//TODO May add a setting for desktop users to choose how to open the todo.
								// window.open(
								// 	`https://to-do.live.com/tasks/id/${taskId}/details`,
								// 	"_blank"
								// )
								window.open(
									`ms-todo://tasks/id/${taskId}/details`,
									"_blank"
								);
							}
						}
					);
				});
			})
		);

		// 注册命令：将选中的文字创建微软待办
		// Register command: Create to Do with the selected text
		this.addCommand({
			id: "only-create-task",
			name: "Post the selection as todos to MsTodo.",
			editorCallback: async (editor: Editor, view: MarkdownView) =>
				await postTask(
					this.todoApi,
					this.settings.todoListSync?.listId,
					editor,
					this.app.workspace.getActiveFile()?.basename,
					this
				),
		});

		// 注册命令：将选中的文字创建微软待办并替换
		// Register command: Create and replace the selected text to Microsoft To-Do
		this.addCommand({
			id: "create-task-replace",
			name: "Post the selection as todos to MsTodo and Replace.",
			editorCallback: async (editor: Editor, view: MarkdownView) =>
				await postTask(
					this.todoApi,
					this.settings.todoListSync?.listId,
					editor,
					this.app.workspace.getActiveFile()?.basename,
					this,
					true
				),
		});

		// Register command: Open link to ToDo
		this.addCommand({
			id: "open-task-link",
			name: "Open To Do",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const cursorLocation = editor.getCursor();
				const line = editor.getLine(cursorLocation.line);
				const taskId = getTaskIdFromLine(line, this);
				if (taskId !== "") {
					// window.open(
					// 	`https://to-do.live.com/tasks/id/${taskId}/details`,
					// 	"_blank"
					// )
					window.open(
						`ms-todo://tasks/id/${taskId}/details`,
						"_blank"
					);
				}
			},
		});

		this.addCommand({
			id: "add-microsoft-todo",
			name: "Insert the MsTodo summary.",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				// TODO 模板化日期
				await createTodayTasks(this.todoApi, this.settings, editor);
			},
		});

		this.addCommand({
			id: "add-uptimer",
			name: "Insert the uptimer Timeline.",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				await createTimeLine(this.uptimerApi, editor);
			},
		});

		this.addCommand({
			id: "add-summary",
			name: "Insert today's summary to diary.",
			callback: async () =>
				await createTodaySummary(
					this.uptimerApi,
					this.todoApi,
					this.app.vault,
					this.settings
				),
		});

		this.addCommand({
			id: "open-bot",
			name: "Launch the bot.",
			callback: async () => {
				this.botManager.launch();
				item.setText("🔥BOT ON");
			}
		});

		this.addCommand({
			id: 'close-bot',
			name: 'Stop the Bot',
			callback: (() => {
				this.botManager.stop();
				item.setText("😴BOT OFF");
			})
		});

		this.addSettingTab(new MsTodoSyncSettingTab(this));
		if (this.settings.uptimer?.token != undefined) {
			this.uptimerApi = new UptimerApi(this.settings.uptimer.token);
		}
		this.todoApi = new TodoApi();
		if (this.settings.bot?.autoLaunch) {
			this.botManager.launch();
			item.setText("🔥BOT ON");
		}

		// const a = this.app.vault.getAbstractFileByPath('0进行中/00Today/未命名 2.md')
		// if(a) await this.app.vault.append(a,"hello")
		// this.registerInterval(window.setTimeout(() => this.uptimerApi.getTodayActivities(),(window.moment("18:21", "HH:mm") as unknown as number) - (window.moment() as unknown as number)));
		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// });
		// Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// console.log(await this.todoApi.getListIdByName("obsidian"))
	}

	async onunload() {
		log(
			"info",
			`unloading plugin "${this.manifest.name}" v${this.manifest.version}`
		);
		await this.botManager.stop();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
