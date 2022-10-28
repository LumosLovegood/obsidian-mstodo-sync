import ClientProvider from "./clientProvider.js";


const clientId = "a1172059-5f55-45cd-9665-8dccc98c2587"
const authority = "https://login.microsoftonline.com/consumers"

let cp = new ClientProvider(clientId,authority);
let client = await cp.getClient();

let user = await client.api('/me/todo/lists/AQMkADAwATM3ZmYAZS0wZDFlLWQzYWQtMDACLTAwCgAuAAADNRwkZ96KDUyv_fUjtGWdTQEAxeQdgc-Ink6_okIsSFGrPAABkG-71wAAAA==/tasks')
.select('id')
.get();

console.log(user)


