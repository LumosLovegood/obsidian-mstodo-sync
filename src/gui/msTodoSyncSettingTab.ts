import MsTodoSync from "../main";
import { Notice, PluginSettingTab, Setting } from "obsidian";
import { getUptimerToken } from "../api/uptimerApi";


export interface MsTodoSyncSettings {
    todoListSync: {
        listName: string | undefined,
        listId: string | undefined,
    };
    uptimer: {
        email: string | undefined,
        password: string | undefined,
        token: string | undefined
    };
    bot: {
        baseUrl: string,
        verifyKey: string,
        qq: number,
    } | undefined
    diary: {
        folder: string,
        format: string,
        stayWithPN: boolean
    }
}

export const DEFAULT_SETTINGS: MsTodoSyncSettings = {
    todoListSync: {
        listName: undefined,
        listId: undefined,
    },
    uptimer: {
        email: undefined,
        password: undefined,
        token: undefined
    },
    bot: undefined,
    diary: {
        folder: "",
        format: "",
        stayWithPN: false
    }
}

export class MsTodoSyncSettingTab extends PluginSettingTab {
    plugin: MsTodoSync;
    constructor(plugin: MsTodoSync) {
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
                    this.plugin.settings.uptimer.password = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h2', { text: '日记格式设置' });
        new Setting(containerEl)
            .setName('与 Periodic Notes 插件保持一致')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.diary.stayWithPN)
                .onChange(async value => {
                    if (value) {
                        // @ts-ignore
                        const PNsetting = app.plugins.plugins['periodic-notes'];
                        if (PNsetting) {
                            const { format, folder } = PNsetting.settings.daily;
                            this.plugin.settings.diary = { format, folder, stayWithPN: true };
                            console.log("🚀 ~ this.plugin.settings.diary", this.plugin.settings.diary);
                            await this.plugin.saveSettings();
                            this.display();
                        }else{
                            new Notice("Periodic Notes 中未设置");
                            this.display();
                        }
                    }else{
                        this.plugin.settings.diary.stayWithPN = false;
                        await this.plugin.saveSettings();
                        this.display();
                    }
                })
            )

        const dateFormat = new Setting(containerEl)
            .setName('日期格式')
            .setDesc(`当前格式为  ${!this.plugin.settings.diary.format
                ?
                ""
                :
                window.moment().format(this.plugin.settings.diary.format)}`)
            .addText(text => text
                .setValue(this.plugin.settings.diary.format)
                .onChange(async (value) => {
                    this.plugin.settings.diary.format = value;
                    dateFormat.setDesc(`当前格式为  ${!this.plugin.settings.diary.format
                        ?
                        ""
                        :
                        window.moment().format(this.plugin.settings.diary.format)}`)
                    await this.plugin.saveSettings();
                })
            )
            .setDisabled(this.plugin.settings.diary.stayWithPN)

        new Setting(containerEl)
            .setName("文件夹")
            .setDesc("日记存放的文件夹")
            .addText(text => text
                .setValue(this.plugin.settings.diary.folder)
                .onChange(async (value) => {
                    this.plugin.settings.diary.format = value;
                    await this.plugin.saveSettings();
                })
            )
            .setDisabled(this.plugin.settings.diary.stayWithPN)
    }
    async hide() {
        const listName = this.plugin.settings.todoListSync.listName;
        const email = this.plugin.settings.uptimer.email;
        const password = this.plugin.settings.uptimer.password;

        if (this.plugin.settings.todoListSync.listId != undefined || !listName) {
            if (!listName) new Notice("微软同步列表未设置");
        } else {
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

        if (!this.plugin.settings.uptimer.token) {
            if ((!email || !password)) new Notice("uptimer未设置");
            else {
                const token = await getUptimerToken(email, password);
                if (!token) {
                    new Notice("邮箱或密码错误")
                }
                this.plugin.settings.uptimer.token = token;
                new Notice('uptimer已配置完成√');
                await this.plugin.saveSettings();
            }
        }
    }
}
