import * as moment from 'moment';
import fetch from "node-fetch";

export class UptimerApi {
    private header: any;
    constructor(token: string) {
        this.header = {
            'authority': 'apii.mytimelog.cn',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'authorization': `Bearer ${token}`,
            'content-type': 'application/json; charset=utf-8',
            'origin': 'https://webapp.mytimelog.cn',
            'referer': 'https://webapp.mytimelog.cn/',
            'sec-ch-ua': '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'token': token,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'

        }
    }

    public async getTodayActivities() {
        return (await fetch('https://apii.mytimelog.cn/api/TimeLog/listOnlyLogV2?categoryCode&channelCode&tag&keyword&pageNum=1&pageSize=999', {
            method: 'POST',
            headers: this.header,
            body: JSON.stringify({
                'page': 0,
                'size': 999,
                'startTime': moment().startOf("day").unix(),
                'endTime': moment().endOf("day").unix()
            })
        })
            .then(res => res.json())
            .then(data => data.data)).reverse();
    }
}