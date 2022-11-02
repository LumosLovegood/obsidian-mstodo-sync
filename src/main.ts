import { createTimeLine } from './command/uptimerCommand';
import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { TodoApi, MicrosoftClientProvider } from './api/todoApi';
import { UptimerApi } from './api/uptimerApi';
import { Bot } from 'mirai-js'
import { DEFAULT_SETTINGS, MsTodoSyncSettings, MsTodoSyncSettingTab } from './gui/msTodoSyncSettingTab';
import { createTodayTasks, postTask } from './command/msTodoCommand';
import { listenEvents } from './bot/listenEvents';


export default class MsTodoSync extends Plugin {
	settings: MsTodoSyncSettings;
	public todoApi: TodoApi;
	public uptimerApi: UptimerApi;
	public bot: Bot;

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
			name: '同步到微软待办',
			editorCallback: async (editor: Editor, view: MarkdownView) =>
				await postTask(this.todoApi, this.settings.todoListSync?.listId, editor, this.app.workspace.getActiveFile()?.basename)
		});
		this.addCommand({
			id: 'create-task-replace',
			name: '同步到微软待办并替换',
			editorCallback: async (editor: Editor, view: MarkdownView) =>
				await postTask(this.todoApi, this.settings.todoListSync?.listId, editor, this.app.workspace.getActiveFile()?.basename, true)
		});

		// 注册命令：将选中的文字创建微软待办并替换
		this.addCommand({
			id: 'add-microsoft-todo',
			name: '获取微软待办',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				// TODO 模板化日期
				await createTodayTasks(this.todoApi, editor, "yyyy年M月D日");
			}
		});

		this.addCommand({
			id: 'add-uptimer',
			name: '生成今日时间线',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (!this.settings.uptimer?.token) {
					new Notice('请先登录获取token');
					return;
				}
				const timeline = await createTimeLine(this.uptimerApi);
				if (!timeline) return;
				editor.replaceSelection(timeline);
				new Notice('今日时间线已生成');
			}
		});

		this.addCommand({
			id: 'open-bot',
			name: '打开机器人',
			callback: async () => {
				if (!this.settings.bot) {
					new Notice("请先配置机器人信息")
					return;
				}
				this.bot = new Bot();
				await this.bot.open(this.settings.bot).then(() => {
					new Notice("机器人已开启√")
					const item = this.addStatusBarItem();
					item.setText("机器人运行中");
					this.addCommand({
						id: 'to-close-bot',
						name: '关闭机器人',
						callback: (() => {
							if (this.bot != undefined) {
								this.bot?.close();
								new Notice("机器人已关闭");
								item.empty();
							}
						})
					});
				})
				this.bot.on('FriendMessage', async data => await listenEvents(data, this.bot));
			}
		});
		this.addSettingTab(new MsTodoSyncSettingTab(this));
		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		if (this.settings.uptimer?.token != undefined) {
			this.uptimerApi = new UptimerApi(this.settings.uptimer.token);
		}
		this.todoApi = new TodoApi(await new MicrosoftClientProvider().getClient());

		// const a = this.app.vault.getAbstractFileByPath('0进行中/00Today/致谢.md')
		// if(a) await this.app.vault.read(a)
		// this.registerInterval(window.setTimeout(() => this.uptimerApi.getTodayActivities(),(window.moment("18:21", "HH:mm") as unknown as number) - (window.moment() as unknown as number)));
		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// });
		// Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// console.log(await this.todoApi.getListIdByName("obsidian"))
	}

	onunload() {
		this.bot?.close();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

