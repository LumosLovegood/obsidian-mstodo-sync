import { createTimeLine } from "./uptimerCommand";
import { UptimerApi } from '../api/uptimerApi';
import { TodoApi } from '../api/todoApi';
import { createTodayTasks } from "./msTodoCommand";
import { TFile, Vault } from "obsidian";
import { MsTodoSyncSettings } from '../gui/msTodoSyncSettingTab';

export async function createTodaySummary(uptimerApi:UptimerApi, todoApi:TodoApi, vault:Vault, setting:MsTodoSyncSettings){
    const uptimerTimeline = await createTimeLine(uptimerApi);
    const todayTasks = await createTodayTasks(todoApi,setting.diary.format.replace(/.*\//,""));
    const summary = "\n" + uptimerTimeline + "\n" + todayTasks;
    const fileName = window.moment().format(setting.diary.format) + ".md";
    const filePath = setting.diary.folder + "/" + fileName;
    console.log("🚀 ~ filePath ", filePath )
    
    const file = vault.getAbstractFileByPath(filePath);

    if (file instanceof TFile) await vault.append(file,summary);
}