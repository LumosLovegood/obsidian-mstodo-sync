import { Bot } from "mirai-js";
import { Notice } from 'obsidian';
import MsTodoSync from '../main';
import { getBilibiliCover } from "./botEvents";

interface event{
    id: number;
    fun: Function
}

export class BotManager {
    private readonly bot: Bot = new Bot();
    private events: event[];
    private botOn = false;
    constructor(private readonly plugin:MsTodoSync) {
        this.events = [{id:0,fun:getBilibiliCover}]
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
        await this.bot.open(this.plugin.settings.bot)
        .then(() => {
            new Notice("Bot has been started.")
            this.botOn = true;
        })
        .catch(err => {
            new Notice("Mirai is not working");
            console.error(err)
        })

        this.events.map(e => {
            this.bot.on(
                "FriendMessage", 
                data => e.fun(data, this.bot)
            )
        })
    }
    async stop(){
        if(this.botOn) await this.bot.close().then(() => {
            this.botOn = false;
            new Notice("The bot has been stopped.");
        });
    }
    
    eventHandler(){
        
    }
}