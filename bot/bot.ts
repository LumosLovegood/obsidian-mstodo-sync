import {Bot,Message} from 'mirai-js'
import { getBiliInfo } from './bilibili';
const bot = new Bot();
bot.open({
    baseUrl: 'http://localhost:10010',
    verifyKey: 'hElloMoON',
    qq: 3299273988,
}).then(async () => {
    bot.sendMessage({
        // 好友 qq 号
        friend: 1364835669,
        // Message 实例，表示一条消息
        message: new Message().addImageUrl(await getBiliInfo("https://www.bilibili.com/video/BV1eG411g7Zd/"))
    }).then(() => console.log("get"))
})

