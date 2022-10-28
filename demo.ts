import {ClientProvider} from "./clientProvider";

const clientId = "a1172059-5f55-45cd-9665-8dccc98c2587"
const authority = "https://login.microsoftonline.com/consumers"

const cp = new ClientProvider(clientId,authority);
// const client = await cp.getClient();
cp.getClient().then(async client =>  {
    const user = await client.api('/me/todo/lists/AQMkADAwATM3ZmYAZS0wZDFlLWQzYWQtMDACLTAwCgAuAAADNRwkZ96KDUyv_fUjtGWdTQEAxeQdgc-Ink6_okIsSFGrPAABkG-71wAAAA==/tasks')
.select('id')
.get();

console.log(user)
})




