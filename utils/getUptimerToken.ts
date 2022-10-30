import fetch from "node-fetch"

export interface UserInfo{
    token:string;
}

export interface ResponseData{
    userinfo:UserInfo
}

export interface FetchResponse{
    code: number;
    data: ResponseData
}

export async function getUptimerToken(account: string, password: string):Promise<string> {
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
    }).then(res => res.json() as Promise<FetchResponse>)
    .then(data  => data.data.userinfo.token);
}