import { Bot } from "mirai-js";
import { Notice } from 'obsidian';
import MsTodoSync from '../main';
import { listenEvents } from "./listenEvents";

export class BotManager {
    private readonly bot: Bot = new Bot();
    private botOn = false;
    constructor(private readonly plugin:MsTodoSync) {
        
    }
    async launch() {
        if(this.botOn){
            new Notice("The Bot is ON.");
            return;
        }
        if (!this.plugin.settings.bot){
            new Notice("Please complete the bot configuration first.")
            return;
        }
        await this.bot.open(this.plugin.settings.bot).then(() => {
            new Notice("Bot has been started.")
            const item = this.plugin.addStatusBarItem();
            item.setText("🔥BOT is ON");
            this.plugin.addCommand({
                id: 'close-bot',
                name: 'Stop the Bot',
                callback: (() => {
                    if (this.botOn) {
                        this.bot.close();
                        new Notice("The bot has been stopped.");
                        item.setText("😴BOT is OFF");
                    }
                })
            });
            this.botOn = true;
        })
        this.bot.on('FriendMessage', async data => await listenEvents(data, this.bot));
    }
    async stop(){
        if(this.botOn) await this.bot.close().then(() => {
            this.botOn = false;
            new Notice("The bot is OFF.")
        });
    }
}