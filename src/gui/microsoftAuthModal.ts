import { App, Modal } from "obsidian";

export class MicrosoftAuthModal extends Modal{
    constructor(app:App,private readonly deviceCode:string, private readonly authUrl:string){
        super(app)
    }
    onOpen(): void {
        const {contentEl} = this;

        contentEl.empty();
        contentEl.addClass("auth-modal")

        contentEl.createEl("h2",{text:"首次使用需要进行微软验证"})
        // contentEl.createEl("span",{text:`设备代码 ${this.deviceCode} 已复制到剪贴板`})
        contentEl.createEl("h4",{text:this.deviceCode})
        // contentEl.createEl("span",{text:`设备代码已复制到剪贴板`})
        contentEl.createEl("div",{text:`设备代码已复制到剪贴板，请点击下面的链接验证`})
        contentEl.createEl("a",{text:this.authUrl,href:this.authUrl})
        contentEl.createEl("hr")
    }
    onClose(): void {
        const {contentEl} = this;
		contentEl.empty();
    }
}