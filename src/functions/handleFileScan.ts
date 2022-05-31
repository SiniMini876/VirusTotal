import { addTestToStorage } from './addTestToStorage';
import { getURL } from './getURL';
import { postURL } from './postURL';

export async function handleFileScan(args: string[], settings: any) {
    const url = args[1];

    const { apikey } = settings;
    if (settings && !settings.downloads) return;
    const result = await postURL(url, apikey);
    if (!result.data.id) {
        chrome.notifications.create('imageCheck', {
            title: 'Virus Total',
            message: "I couldn't scan the file, proceed at your own risk.",
            iconUrl: 'vt-200px.png',
            type: 'basic',
        });
        return;
    }

    const modifiedId = result.data.id.split('-')[1];
    console.log(modifiedId);
    setTimeout(async () => {
        const urlReport = await getURL(modifiedId, apikey);
        if (!urlReport.data.id) {
            chrome.notifications.create({
                title: 'Virus Total',
                message: "I couldn't scan the file, proceed at your own risk.",
                iconUrl: 'vt-200px.png',
                type: 'basic',
            });
            return;
        }
        console.log(urlReport);
        if (
            urlReport.data.attributes.last_http_response_headers[
                'Content-Type'
            ].includes('image')
        ) {
            if (settings.imageCheck) {
                console.log("Don't show again enabled!");
                await addTestToStorage(urlReport);
                return;
            }
            chrome.notifications.create('imageCheck', {
                title: 'Virus Total',
                message:
                    "Can't scan an image, scanned the url, proceed at your own risk.",
                iconUrl: 'vt-200px.png',
                type: 'basic',
                buttons: [
                    {
                        title: "Don't show again",
                    },
                ],
            });
            await addTestToStorage(urlReport);
            return;
        }
        console.log(urlReport);

        chrome.alarms.create(
            `filereport|${urlReport.data.attributes.last_http_response_content_sha256}`,
            {
                periodInMinutes: 1,
            },
        );
    }, 15000);
}
