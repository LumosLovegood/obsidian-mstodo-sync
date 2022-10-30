import { MicrosoftClientProvider } from "../utils/microsoftClientProvider";
import { TodoTask, TodoTaskList } from '@microsoft/microsoft-graph-types';
import { Notice } from "obsidian";
import { Client } from "@microsoft/microsoft-graph-client";
export class TodoApi {
    private client: Client;
    constructor(clientProvider: MicrosoftClientProvider) {
        clientProvider.getClient().then(client => {
            this.client = client;
        })
    }

    // List operation
    async getLists(): Promise<TodoTaskList[] | undefined> {
        const endpoint = "/me/todo/lists";
        const todoLists = (await this.client.api(endpoint).get()).value as TodoTaskList[];
        return todoLists;
    }
    async getListIdByName(listName: string | undefined): Promise<string | undefined> {
        if (!listName) return;
        const endpoint = `/me/todo/lists`;
        const res: TodoTaskList[] = (await this.client.api(endpoint).filter(`displayName eq '${listName}'`).get()).value;
        if (!res || res.length == 0) return;
        const target = res[0] as TodoTaskList;
        return target.id;
    }
    async getList(listId: string | undefined): Promise<TodoTaskList | undefined> {
        if (!listId) return;
        const endpoint = `/me/todo/lists/${listId}`;
        return (await this.client.api(endpoint).get()) as TodoTaskList;
    }
    async createTaskList(displayName: string): Promise<TodoTaskList | undefined> {
        return await this.client.api('/me/todo/lists')
            .post({
                displayName
            })
    }

    // Task operation
    async getListTasks(listId: string,searchText?:string): Promise<TodoTask[] | undefined> {
        if (!listId) return;
        const endpoint = `/me/todo/lists/${listId}/tasks`;
        const res = await this.client.api(endpoint).get()
            .catch(err => {
                new Notice("获取失败，请检查同步列表是否已删除");
                return;
            })
        if (!res) return;
        console.log("🚀 ~ res", res)
        return res.value as TodoTask[];
    }
    async getTask(listId: string, taskId: string): Promise<TodoTask | undefined> {
        const endpoint = `/me/todo/lists/${listId}/tasks/${taskId}`;
        return (await this.client.api(endpoint).get()) as TodoTask;
    }
    async createTask(listId: string|undefined, title: string): Promise<TodoTask> {
        const endpoint = `/me/todo/lists/${listId}/tasks`;
        return await this.client.api(endpoint).post({
            title: title,
            body: {
                content: '',
                contentType: 'text'
            }
        });
    }
}