import fetch from "node-fetch";
export interface RawActivity {
    content: string;
    start_time: number;
    end_time: number;
    item: {
        title: string;
    };
    total_time: number;
    nature: 0 | 1 | 2;
}

export class UptimerApi {
    private header: {[key:string]:string};
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
                'startTime': window.moment().startOf("day").unix(),
                'endTime': window.moment().endOf("day").unix()
            })
        })
            .then(res => res.json())
            .then(data => data.data)) as RawActivity[];
    }
}
export interface LoginResponse{
    code: number;
    data: {
        userinfo: {
            token: string
        }
    }
}

export async function getUptimerToken(account: string, password: string):Promise<string | undefined> {
    return await fetch('https://apii.mytimelog.cn/api/User/login', {
        method: 'POST',
        headers: {
            'authority': 'apii.mytimelog.cn',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'content-type': 'application/json; charset=utf-8',
            'origin': 'https://webapp.mytimelog.cn',
            'referer': 'https://webapp.mytimelog.cn/',
            'sec-ch-ua': '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
            'account': account,
            'password': password
        })
    }).then(res => res.json() as Promise<LoginResponse>)
    .then(data  => data.data.userinfo.token)
    .catch(err => undefined);
}