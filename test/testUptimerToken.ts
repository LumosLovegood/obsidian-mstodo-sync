import { UptimerApi } from "../api/uptimerApi";

const a  = new UptimerApi("8af0afca-9eb4-4963-bda6-a5cd59421a95");
a.getTodayActivities().then(res => console.log(res));