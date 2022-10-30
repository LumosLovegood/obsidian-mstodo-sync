import { ClientProvider } from "./utils/microsoftClientProvider";


const cp = new ClientProvider();
cp.getClient().then(async client => {
    const user = await client.api('/me/todo/lists/AQMkADAwATM3ZmYAZS0wZDFlLWQzYWQtMDACLTAwCgAuAAADNRwkZ96KDUyv_fUjtGWdTQEAxeQdgc-Ink6_okIsSFGrPAABkG-71wAAAA==/tasks')
        .select('id')
        .get();
    console.log(user?.value)
})

