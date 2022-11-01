import MsTodoSync from "../main";
import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { getUptimerToken } from "api/uptimerApi";


export interface MsTodoSyncSettings {
	todoListSync: {
		listName: string | undefined,
		listId: string | undefined,
	};
	uptimer:{
		email: string | undefined,
		password: string | undefined,
		token: string | undefined
	};
	bot: {
		baseUrl: string,
		verifyKey: string,
		qq: number,
	} | undefined
}

export const DEFAULT_SETTINGS: MsTodoSyncSettings = {
	todoListSync:{
		listName: undefined,
		listId: undefined,
	},
	uptimer: {
		email: undefined,
		password: undefined,
		token: undefined
	},
	bot: undefined
}

export class MsTodoSyncSettingTab extends PluginSettingTab {
    plugin: MsTodoSync;
    constructor(app: App, plugin: MsTodoSync) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Microsoft Todo设置' });

        new Setting(containerEl)
            .setName('默认的同步微软Todo列表名称')
            .setDesc('如不存在则以该名称创建列表')
            .addText(text => text
                // .setPlaceholder('输入Todo列表名称')
                .setValue(this.plugin.settings.todoListSync.listName ?? "")
                .onChange(async (value) => {
                    this.plugin.settings.todoListSync.listName = value;
                }));

        containerEl.createEl('h2', { text: 'Uptimer设置' });

        new Setting(containerEl)
            .setName('uptimer注册邮箱')
            .addText(text => text
                .setValue(this.plugin.settings.uptimer.email ?? "")
                .onChange(async (value) => {
                    console.log('Secret: ' + value);
                    this.plugin.settings.uptimer.email = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('uptimer密码')
            .addText(text => text
                .setValue(this.plugin.settings.uptimer.password ?? "")
                .onChange(async (value) => {
                    console.log('Secret: ' + value);
                    this.plugin.settings.uptimer.password = value;
                    await this.plugin.saveSettings();
                }));
    }
    async hide() {
        const listName = this.plugin.settings.todoListSync.listName;
        const email = this.plugin.settings.uptimer.email;
        const password = this.plugin.settings.uptimer.password;

        if (this.plugin.settings.todoListSync.listId!=undefined || !listName) {
            if(!listName) new Notice("微软同步列表未设置");
        }else{
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
            }
        }

        if( !this.plugin.settings.uptimer.token){
            if((!email || !password)) new Notice("uptimer未设置");
            else{
                const token = await getUptimerToken(email,password);
                if(!token){
                    new Notice("邮箱或密码错误")
                }
                this.plugin.settings.uptimer.token = token;
                new Notice('uptimer已配置完成√');
                await this.plugin.saveSettings();
            }
        }
    }
}
