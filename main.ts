import { createTimeLine } from 'fromatter/createTimeline';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { TodoApi, MicrosoftClientProvider } from './api/todoApi';
import { UptimerApi } from './api/uptimerApi';
interface TodoListSync {
	listName: string | undefined;
	listId: string | undefined
}
interface MsTodoSyncSettings {
	mySetting: string;
	todoListSync: TodoListSync;
	uptimerToken: string | undefined;
}

const DEFAULT_SETTINGS: MsTodoSyncSettings = {
	mySetting: 'default',
	todoListSync: {
		listName: undefined,
		listId: undefined
	},
	uptimerToken: undefined
}

export default class MsTodoSync extends Plugin {
	settings: MsTodoSyncSettings;
	public todoApi: TodoApi;
	public uptimerApi: UptimerApi;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		this.addCommand({
			id: 'add-microsoft-todo',
			name: '获取微软待办',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (!this.settings.todoListSync.listId) {
					new Notice('请先设置同步列表');
					return;
				}
				/* TODO 测试发现删除某个列表之后，居然还可以通过listId查到，好神奇
				本来想用下面代码替换一下，不过感觉好像对使用逻辑没什么太大影响，先不改了 */
				// const listId = await this.api.getListIdByName(this.settings.todoListSync.listName);
				// if (!listId) {
				// 	new Notice("获取失败，请检查同步列表是否已删除");
				// 	return;
				// }
				// const tasks = await this.api.getListTasks(listId);
				const tasks = await this.todoApi.getListTasks(this.settings.todoListSync.listId);
				if (!tasks) return;
				editor.replaceSelection(tasks.map(i => `- [ ] ${i.title} 创建于${window.moment(i.createdDateTime).format("HH:mm")}`).join("\n"));
				new Notice('待办列表已获取');
			}
		});
		this.addCommand({
			id: 'create-task',
			name: '创建新待办',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (!this.settings.todoListSync.listId) {
					new Notice('请先设置同步列表');
					return;
				}
				Promise.all(editor.getSelection().replace(/(- \[ \] )|\*|^> |^#* |- /gm, "").split("\n").filter(s => s != "").map(async s => {
					const line = s.trim();
					return await this.todoApi.createTask(this.settings.todoListSync.listId, line);
				})).then(res => editor.replaceSelection(res.map(i => `- [ ] ${i.title} 创建于${window.moment(i.createdDateTime).format("HH:mm")}`).join("\n")));
				
				// this.todoApi.getListTasks()
			}
		});

		this.addCommand({
			id: 'add-uptimer',
			name: '生成今日时间线',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (!this.settings.uptimerToken) {
					new Notice('请先登录获取token');
					return;
				}
				const timeline = await createTimeLine(this.uptimerApi);
				if (!timeline) return;
				editor.replaceSelection(timeline);
				new Notice('今日时间线已生成');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MsTodoSyncSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.

		if (this.settings.uptimerToken != undefined) {
			this.uptimerApi = new UptimerApi(this.settings.uptimerToken);
			// this.registerInterval(window.setTimeout(() => this.uptimerApi.getTodayActivities(),(window.moment("18:21", "HH:mm") as unknown as number) - (window.moment() as unknown as number)));
		}

		this.todoApi = new TodoApi(await new MicrosoftClientProvider(`${this.app.vault.configDir}/msal_cache.json`,this.app.vault.adapter).getClient());
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class MsTodoSyncSettingTab extends PluginSettingTab {
	plugin: MsTodoSync;
	todoListNameSync: string;
	constructor(app: App, plugin: MsTodoSync) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Microsoft Todo设置' });

		new Setting(containerEl)
			.setName('输入要同步的微软Todo列表名称')
			.setDesc('如不存在则以该名称创建列表')
			.addText(text => text
				// .setPlaceholder('输入Todo列表名称')
				.setValue(this.plugin.settings.todoListSync.listName ?? "")
				.onChange(async (value) => {
					this.todoListNameSync = value;
					console.log("🚀 ~ value", value)
				}));

		// new Setting(containerEl)
		// 	.setName('Setting #1')
		// 	.setDesc('It\'s a secret')
		// 	.addText(text => text
		// 		.setPlaceholder('Enter your secret')
		// 		.setValue(this.plugin.settings.mySetting)
		// 		.onChange(async (value) => {
		// 			console.log('Secret: ' + value);
		// 			this.plugin.settings.mySetting = value;
		// 			await this.plugin.saveSettings();
		// 		}));
	}
	async hide() {
		const listName = this.todoListNameSync ?? this.plugin.settings.todoListSync.listName;
		if (!listName) {
			new Notice("同步列表未设置");
			return;
		}
		let listId = await this.plugin.todoApi.getListIdByName(listName);
		if (!listId) {
			listId = (await this.plugin.todoApi.createTaskList(listName))?.id;
		}
		if (!listId) {
			new Notice('创建列表失败');
			return;
		} else {
			this.plugin.settings.todoListSync = {
				listName,
				listId
			};
			new Notice('设置同步列表成功√');
			await this.plugin.saveSettings();
			console.log(this.plugin.settings.todoListSync);
		}

	}
}
