import { request } from "obsidian";


const headers = {
    'authority': 'www.bilibili.com',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7'
}
export async function getBiliInfo(url:string){
    const searchUrl = new URL(url);
    const res = await request({
      url: searchUrl.href,
      method: "GET",
      headers:headers
    });
    if(!res){
        return null;
    }
    const p = new DOMParser();
    const doc = p.parseFromString(res, "text/html");
    const $ = (s:any) => doc.querySelector(s);
    return $("meta[property='og:image']")?.content;
}