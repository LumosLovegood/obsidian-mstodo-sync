import { Bot, Message } from "mirai-js";
import { getBiliInfo } from "./bilibili";

export async function listenEvents(data: any, bot: Bot) {
    const sender = data.sender;
    const message = data.messageChain[1];
    const reg = /https?:\/\/((www|m)\.bilibili\.com\/video\/\S*\?|b23\.tv\/\S*)/gm;
    console.log(typeof(message.content),message.content);
    const target = (message.text ?? message.content?.replace(/\\/gm,""))?.match(reg);
    if (target) {
        await bot.sendMessage({
            friend: sender.id,
            message: new Message().addImageUrl(await getBiliInfo(target[0]))
        })
    }
    else {
        console.log(message);
        // await bot.sendMessage({
        //     friend: sender.id,
        //     message: new Message().addText("")
        // })
    }
}