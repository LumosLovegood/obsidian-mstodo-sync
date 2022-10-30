import { MicrosoftClientProvider } from "../utils/microsoftClientProvider";
import { TodoTask, TodoTaskList } from '@microsoft/microsoft-graph-types';
import { Notice } from "obsidian";
import { Client } from "@microsoft/microsoft-graph-client";
export class TodoApi {
    private client: Client;
    constructor(private readonly clientProvider: MicrosoftClientProvider) {
        clientProvider.getClient().then(client => {
            this.client = client;
        })
    }
    async getAllTodoLists(): Promise<TodoTaskList[] | undefined> {
        const endpoint = "/me/todo/lists";
        const client = await this.clientProvider.getClient();
        const todoLists = (await client.api(endpoint).get()).value as TodoTaskList[];
        return todoLists;
    }
    async getListIdByName(listName: string | undefined): Promise<string | undefined> {
        if (!listName) return;
        const endpoint = `/me/todo/lists`;
        const client = await this.clientProvider.getClient();
        const res: TodoTaskList[] = (await client.api(endpoint).filter(`displayName eq '${listName}'`).get()).value;
        if (!res || res.length == 0) return;
        const target = res[0] as TodoTaskList;
        return target.id;
    }
    async getTodoList(listId: string | undefined): Promise<TodoTaskList | undefined> {
        if (!listId) return;
        const endpoint = `/me/todo/lists/${listId}`;
        const client = await this.clientProvider.getClient();
        return (await client.api(endpoint).get()) as TodoTaskList;
    }
    async getListTasks(listId: string | undefined): Promise<TodoTask[] | undefined> {
        if (!listId) return;
        const endpoint = `/me/todo/lists/${listId}/tasks`;
        const client = await this.clientProvider.getClient();
        const res = await client.api(endpoint).get()
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
        const client = await this.clientProvider.getClient();
        return (await client.api(endpoint).get()) as TodoTask;
    }
    async createTaskList(displayName: string): Promise<TodoTaskList | undefined> {
        const client = await this.clientProvider.getClient();
        return await client.api('/me/todo/lists')
            .post({
                displayName
            })
    }
    // Create tasks 
    async createTask(listId: string | undefined, title: string): Promise<undefined> {
        if (!listId) return;
        const endpoint = `/me/todo/lists/${listId}/tasks`;
        const client = await this.clientProvider.getClient();
        await client.api(endpoint).post({
            title: title,
            body: {
                content: '',
                contentType: 'text'
            }
        });
    }
}