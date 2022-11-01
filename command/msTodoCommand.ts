import { Editor, Notice } from 'obsidian';
import { TodoApi } from '../api/todoApi';


export async function postTask(todoApi: TodoApi, listId: string | undefined, editor: Editor, fileName:string|undefined, replace?: boolean) {
    if (!listId) {
        new Notice('请先设置同步列表');
        return;
    }
    new Notice("创建待办中...", 3000)
    const body = `来自笔记 [[${fileName}]]`
    const formated = editor.getSelection().replace(/(- \[ \] )|\*|^> |^#* |- /gm, "").split("\n").filter(s => s != "");
    Promise.all(formated.map(async s => {
        const line = s.trim();
        await todoApi.createTask(listId, line, body);
        return line;
    })).then(res => {
        new Notice("创建待办成功√");
        if (replace) {
            // TODO 格式
            editor.replaceSelection(res.map(i => `- [ ] ${i} 创建于${window.moment().format("HH:mm")}`).join("\n"));
        }
    });
}

export async function createTodayTasks(todoApi: TodoApi,editor:Editor,dateFormat:string) {
    new Notice("获取微软待办中",3000);
    const now = window.moment();
    const pattern = `status ne 'completed' or completedDateTime/dateTime ge '${now.format("yyyy-MM-DD")}'`
    const taskLists = await todoApi.getLists(pattern);
    if (!taskLists || taskLists.length == 0) {
        new Notice("任务列表为空");
        return;
    }
    const segments = taskLists.map(taskList => {
        if(!taskList.tasks || taskList.tasks.length==0) return;
        taskList.tasks.sort((a,b) => a.status=="completed"?1:-1)
        const lines = taskList.tasks?.map(task => {
            const createDate = window.moment(task.createdDateTime).format(dateFormat);
            const done = task.status == "completed" ? "x" : " ";
            const date = createDate == now.format(dateFormat) ? "" : "🔎" + createDate;
            const body = !task.body?.content ? "" : "💡" + task.body.content;
            
            return `- [${done}] ${task.title}  ${date}  ${body}`;
        })
        return `#### ${taskList.displayName}
${lines?.join('\n')}
`
    })
    editor.replaceSelection(segments.filter(s => s!=undefined).join("\n\n"));
    new Notice("待办列表已获取");
}