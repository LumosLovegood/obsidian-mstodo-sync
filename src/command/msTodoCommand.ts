import { Editor, Notice } from 'obsidian';
import MsTodoSync from '../main';
import { TodoApi } from '../api/todoApi';
import { MsTodoSyncSettings } from '../gui/msTodoSyncSettingTab';
import { t } from './../lib/lang';
import { log } from './../lib/logging';

export function getTaskIdFromLine(line: string, plugin: MsTodoSync): string {
	const regex = /\^(?!.*\^)([A-Za-z0-9]+)/gm;
	const blocklistMatch = regex.exec(line.trim());
	if (blocklistMatch) {
		const blocklink = blocklistMatch[1];
		const taskId = plugin.settings.taskIdLookup[blocklink];
		console.log(taskId);
		return taskId;
	}
	return '';
}

export async function postTask(
	todoApi: TodoApi,
	listId: string | undefined,
	editor: Editor,
	fileName: string | undefined,
	plugin: MsTodoSync,
	replace?: boolean,
) {
	if (!editor.somethingSelected()) {
		new Notice('好像没有选中什么');
		return;
	}
	if (!listId) {
		new Notice('请先设置同步列表');
		return;
	}
	new Notice('创建待办中...', 3000);
	const body = `${t('displayOptions_CreatedInFile')} [[${fileName}]]`;
	const formatted = editor
		.getSelection()
		.replace(/(- \[ \] )|\*|^> |^#* |- /gm, '')
		.split('\n')
		.filter((s) => s != '');
	log('debug', formatted.join(' :: '));
	Promise.all(
		formatted.map(async (s) => {
			const line = s.trim();
			const regex = /\^(?!.*\^)([A-Za-z0-9]+)/gm;
			const blocklistMatch = regex.exec(line);
			if (blocklistMatch) {
				const blocklink = blocklistMatch[1];
				const taskId = plugin.settings.taskIdLookup[blocklink];
				const cleanTaskTitle = line.replace(`^${blocklink}`, '');

				console.log(blocklink);
				console.log(taskId);
				const updatedTask = await todoApi.updateTask(listId, taskId, cleanTaskTitle);
				console.log(updatedTask);
				return { line, blocklink };
			} else {
				const newTask = await todoApi.createTask(listId, line, body);
				plugin.settings.taskIdIndex = plugin.settings.taskIdIndex + 1;
				const index = `${Math.random().toString(20).substring(2, 6)}${plugin.settings.taskIdIndex
					.toString()
					.padStart(5, '0')}`;
				plugin.settings.taskIdLookup[index] = newTask.id === undefined ? '' : newTask.id;
				await plugin.saveSettings();
				return { line, index };
			}
		}),
	).then((res) => {
		new Notice('创建待办成功√');
		if (replace) {
			// TODO 格式
			editor.replaceSelection(
				res
					.map((i) => {
						let createdAt = '';
						const blocklink = `^${i.index}`;
						if (plugin.settings.displayOptions_ReplaceAddCreatedAt) {
							createdAt = `${t('displayOptions_CreatedAtTime')} ${window.moment().format('HH:mm')}`;
						}
						return `- [ ] ${i.line} ${createdAt} ${blocklink}`;
					})
					.join('\n'),
			);
		}
	});
}

export async function createTodayTasks(todoApi: TodoApi, settings: MsTodoSyncSettings, editor?: Editor) {
	new Notice('获取微软待办中', 3000);
	const now = window.moment();
	const pattern = `status ne 'completed' or completedDateTime/dateTime ge '${now.format('yyyy-MM-DD')}'`;
	const taskLists = await todoApi.getLists(pattern);
	if (!taskLists || taskLists.length == 0) {
		new Notice('任务列表为空');
		return;
	}
	const segments = taskLists
		.map((taskList) => {
			if (!taskList.tasks || taskList.tasks.length == 0) return;
			taskList.tasks.sort((a, b) => (a.status == 'completed' ? 1 : -1));
			const lines = taskList.tasks?.map((task) => {
				const formattedCreateDate = window
					.moment(task.createdDateTime)
					.format(settings.displayOptions_DateFormat);
				const done = task.status == 'completed' ? 'x' : ' ';
				const createDate =
					formattedCreateDate == now.format(settings.displayOptions_DateFormat)
						? ''
						: `${settings.displayOptions_TaskCreatedPrefix}[[${formattedCreateDate}]]`;
				const body = !task.body?.content ? '' : `${settings.displayOptions_TaskBodyPrefix}${task.body.content}`;

				return `- [${done}] ${task.title}  ${createDate}  ${body}`;
			});
			return `#### ${taskList.displayName}
${lines?.join('\n')}
`;
		})
		.filter((s) => s != undefined)
		.join('\n\n');

	new Notice('待办列表已获取');
	if (editor) editor.replaceSelection(segments);
	else return segments;
}
