import { MicrosoftClientProvider } from "../clientProvider";
// import { TodoTaskList } from '@microsoft/microsoft-graph-types';
const cp = new MicrosoftClientProvider();
import * as moment from 'moment';
// const endpoint = "/AQMkADAwATM3ZmYAZS0wZDFlLWQzYWQtMDACLTAwCgAuAAADNRwkZ96KDUyv_fUjtGWdTQEAxeQdgc-Ink6_okIsSFGrPAABkG-71wAAAA==/tasks";
// cp.getClient().then(async client => {
//     const user = (await client.api('/me/todo/lists/AQMkADAwATM3ZmYAZS0wZDFlLWQzYWQtMDACLTAwCgAuAAADNRwkZ96KDUyv_fUjtGWdTQEAxeQdgc-Ink6_okIsSFGrPAAAAgESAAAA').get()) as TodoTaskList;
//     console.log(user)
// })


import { TodoApi } from "../todoApi";

const api = new TodoApi(cp);
api.getListIdByName("obsidian").then(
    res => {
        api.getListTasks(res).then(data => {
            if(data!=undefined && data.length!=0){
                // const createTime = moment(data[0].createdDateTime).format("dddd, MMMM Do YYYY, HH:mm");
                console.log(moment(data[0].createdDateTime).isSame(moment(), "day"));
            }

        })
    }
)