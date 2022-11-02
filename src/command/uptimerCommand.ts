import { Notice, Editor } from 'obsidian';
import { RawActivity, UptimerApi } from '../api/uptimerApi';

interface Activity {
    isValid: boolean;
    title: string;
    content: string;
    startTime: string;
    endTime: string;
    total_time: number;
    desc: string;
    ganttForm: string;
    nature: 0 | 1 | 2;
}

export async function createTimeLine(uptimerApi: UptimerApi, editor?: Editor) {
    if (!uptimerApi) {
        new Notice('请先登录获取token');
        return;
    }
    const startOfDay = window.moment().startOf("day").unix();
    return await uptimerApi.getTodayActivities()
        .then(data => {
            const activities = data?.map((item: RawActivity) => {
                if (item.start_time < startOfDay) {
                    return { isValid: false } as Activity;
                }
                const startTime = window.moment.unix(item.start_time).format("HH:mm");
                const endTime = window.moment.unix(item.end_time).format("HH:mm");
                const total_time = Math.floor(item.total_time / 60);
                const duration = total_time > 60 ? `${Math.floor(total_time / 60)}小时${Math.round(total_time % 60)}分钟` : `${total_time}分钟`;
                let sign = "";
                if (item.nature === 0) {
                    sign = "active";
                } else if (item.nature === 1) {
                    sign = "crit";
                }
                return {
                    isValid: true,
                    title: item.item.title,
                    content: item.content,
                    startTime,
                    endTime,
                    total_time,
                    desc: `- ${startTime}-${endTime} 【${item.item.title}】 ${item.content} ${duration}`,
                    ganttForm: `${item.item.title} :${sign},${startTime},${endTime}`,
                    nature: item.nature
                } as Activity;
            })?.filter(i => i.isValid)?.reverse();
            if (activities.length == 0) return "";
            new Notice('今日时间线已生成');
            const gantt = createGantt(activities);
            const timeline = `
${gantt}
${activities.map(i => i?.desc).join("\n")}
`;
            if(editor) editor.replaceSelection(timeline);
            else return timeline;
        });
}

export function createGantt(activities: Activity[] | undefined) {
    if (!activities) return;
    const positives = activities.filter(i => i?.nature === 0).map(e => e?.ganttForm);
    const ordinarys = activities.filter(i => i?.nature === 2).map(e => e?.ganttForm);
    const negatives = activities.filter(i => i?.nature === 1).map(e => e?.ganttForm);

    const positiveSum = activities.filter(i => i?.nature === 0).reduce((c, R) => c + (R?.total_time ?? 0), 0);
    const ordinarysSum = activities.filter(i => i?.nature === 2).reduce((c, R) => c + (R?.total_time ?? 0), 0);
    const negativesSum = activities.filter(i => i?.nature === 1).reduce((c, R) => c + (R?.total_time ?? 0), 0);
    const allSum = positiveSum + negativesSum + ordinarysSum;

    const now = new Date();
    return `\`\`\`mermaid
gantt
    title Timeline
    dateFormat  HH:mm
    axisFormat %H:%M
    %% Current Time: ${now.toLocaleTimeString()}

    section 积极(${(positiveSum / allSum * 100).toFixed(2)}%)

${positives.join('\n')}

    section 普通(${(ordinarysSum / allSum * 100).toFixed(2)}%)

${ordinarys.join('\n')}

    section 消极(${(negativesSum / allSum * 100).toFixed(2)}%)

${negatives.join('\n')}
\`\`\`
`;
}