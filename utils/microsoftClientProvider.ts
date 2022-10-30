import * as msal from "@azure/msal-node";
import * as msalCommon from "@azure/msal-common";
// import * as fs from 'fs';
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
// import * as open from 'open';
import { App, Notice } from "obsidian";
import type { Vault } from "obsidian";
/**
 * @public
 */
export function getTokenPath(vault:Vault):string{
    return `${vault.configDir}/msal_cache.json`;
}
export class MicrosoftClientProvider {
    static scopes: string[] = ['Tasks.ReadWrite', 'Calendars.ReadWrite', 'People.Read', 'Tasks.Read', 'openid', 'profile'];
    // private cachePath = "./cache/msal_cache.json";
    private pca: msal.PublicClientApplication;
    private clientId = "a1172059-5f55-45cd-9665-8dccc98c2587";
    private authority = "https://login.microsoftonline.com/consumers";

    constructor(private cachePath:string,private app:App) {
        console.log("🚀 ~ cachePath", cachePath)
        const beforeCacheAccess = async (cacheContext: msalCommon.TokenCacheContext) => {
            // if (fs.existsSync(this.cachePath)) {
                // cacheContext.tokenCache.deserialize(fs.readFileSync(this.cachePath, "utf-8"));
        // }
            if (await this.app.vault.adapter.exists(this.cachePath)) {
                cacheContext.tokenCache.deserialize(await this.app.vault.adapter.read(this.cachePath));
            }
        };
        const afterCacheAccess = async (cacheContext: msalCommon.TokenCacheContext) => {
            if (cacheContext.cacheHasChanged) {
                // fs.writeFile(this.cachePath, cacheContext.tokenCache.serialize(), function () {
                //     console.log("write");
                // });
                await this.app.vault.adapter.write(this.cachePath, cacheContext.tokenCache.serialize());
            }
        };
        const cachePlugin = {
            beforeCacheAccess,
            afterCacheAccess
        };
        const config = {
            auth: {
                clientId: this.clientId,
                authority: this.authority,
            },
            cache: {
                cachePlugin
            }
        };
        this.pca = new msal.PublicClientApplication(config);
    }

    private async getAccessToken() {
        const msalCacheManager = this.pca.getTokenCache();
        // if (fs.existsSync(this.cachePath)) {
        //     msalCacheManager.deserialize(fs.readFileSync(this.cachePath, "utf-8"));
        // }
        if(await this.app.vault.adapter.exists(this.cachePath)){
            msalCacheManager.deserialize(await this.app.vault.adapter.read(this.cachePath));
        }
        const accounts = await msalCacheManager.getAllAccounts();
        if (accounts.length == 0) {
            return await this.authByDevice();
        } else {
            return await this.authSilent(accounts[0])
        }
    }
    private async authByDevice(): Promise<string> {
        const deviceCodeRequest = {
            deviceCodeCallback: (response: msalCommon.DeviceCodeResponse) => {
                // for test
                // open(response["verificationUri"])
                // console.log("设备代码已复制到剪贴板",response['userCode']);

                // for obsidian
                window.open(response["verificationUri"])
                new Notice("设备代码已复制到剪贴板√");
                navigator.clipboard.writeText(response['userCode']);
                console.log("设备代码已复制到剪贴板",response['userCode']);
            },
            scopes: MicrosoftClientProvider.scopes,
        };
        return await this.pca.acquireTokenByDeviceCode(deviceCodeRequest).then(res => {
            return res == null ? "error" : res['accessToken'];
        });
    }

    private async authSilent(account: msal.AccountInfo): Promise<string> {
        const silentRequest = {
            account: account,
            scopes: MicrosoftClientProvider.scopes,
        };
        return await this.pca.acquireTokenSilent(silentRequest)
            .then(res => {
                return res == null ? "error" : res['accessToken'];
            })
            .catch(async err => {
                return await this.authByDevice();
            });
    }

    public async getClient() {
        const authProvider = async (callback: (arg0: string, arg1: string) => void) => {
            const accessToken = await this.getAccessToken();
            const error = " ";
            callback(error, accessToken);
        };
        return Client.init({
            authProvider
        });
    }
}