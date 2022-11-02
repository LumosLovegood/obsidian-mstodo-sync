import { createTimeLine } from './command/uptimerCommand';
import { Editor, MarkdownView, Plugin } from 'obsidian';
import { TodoApi } from './api/todoApi';
import { UptimerApi } from './api/uptimerApi';
import { DEFAULT_SETTINGS, MsTodoSyncSettings, MsTodoSyncSettingTab } from './gui/msTodoSyncSettingTab';
import { createTodayTasks, postTask } from './command/msTodoCommand';
import { BotManager } from './bot/botManager';
import { createTodaySummary } from './command/summaryCommand';


export default class MsTodoSync extends Plugin {
	settings: MsTodoSyncSettings;
	public todoApi: TodoApi;
	public uptimerApi: UptimerApi;
	public botManager: BotManager = new BotManager(this);

	async onload() {
		await this.loadSettings();
		// 在右键菜单中注册命令：将选中的文字创建微软待办
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item.setTitle("同步到微软待办")
						.onClick(async () =>
							await postTask(this.todoApi, this.settings.todoListSync?.listId, editor, this.app.workspace.getActiveFile()?.basename));
				});
			})
		);
		// 在右键菜单中注册命令：将选中的文字创建微软待办并替换
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item.setTitle("同步到微软待办并替换")
						.onClick(async () =>
							await postTask(this.todoApi, this.settings.todoListSync?.listId, editor, this.app.workspace.getActiveFile()?.basename, true));
				});
			})
		);
		// 注册命令：将选中的文字创建微软待办
		this.addCommand({
			id: 'only-create-task',
			name: 'Post the selection as todos to MsTodo.',
			editorCallback: async (editor: Editor, view: MarkdownView) =>
				await postTask(this.todoApi, this.settings.todoListSync?.listId, editor, this.app.workspace.getActiveFile()?.basename)
		});
		this.addCommand({
			id: 'create-task-replace',
			name: 'Post the selection as todos to MsTodo and Replace.',
			editorCallback: async (editor: Editor, view: MarkdownView) =>
				await postTask(this.todoApi, this.settings.todoListSync?.listId, editor, this.app.workspace.getActiveFile()?.basename, true)
		});

		// 注册命令：将选中的文字创建微软待办并替换
		this.addCommand({
			id: 'add-microsoft-todo',
			name: 'Insert the MsTodo summary.',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				// TODO 模板化日期
				await createTodayTasks(this.todoApi, "yyyy年M月D日", editor);
			}
		});
		this.addCommand({
			id: 'add-uptimer',
			name: 'Insert the uptimer Timeline.',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				await createTimeLine(this.uptimerApi, editor);
			}
		});
		this.addCommand({
			id: 'add-summary',
			name: 'Insert today\'s summary to diary.',
			callback: async () => await createTodaySummary(this.uptimerApi,this.todoApi,this.app.vault,this.settings)
		});

		this.addCommand({
			id: 'open-bot',
			name: 'Launch the bot.',
			callback: async () => this.botManager.launch()
		});

		this.addSettingTab(new MsTodoSyncSettingTab(this));
		if (this.settings.uptimer?.token != undefined) {
			this.uptimerApi = new UptimerApi(this.settings.uptimer.token);
		}
		this.todoApi = new TodoApi();
		if(this.settings.bot?.autoLaunch){
			this.botManager.launch();
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
		await this.botManager.stop();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

