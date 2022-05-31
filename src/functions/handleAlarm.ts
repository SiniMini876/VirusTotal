import { addTestToStorage } from './addTestToStorage';
import { getFile } from './getFile';
import { getURL } from './getURL';

export async function handleAlarm(alarm: chrome.alarms.Alarm) {
    const { settings } = await chrome.storage.sync.get(['settings']);
    const { apikey } = settings;
    const [prefix, id] = alarm.name.split('|');
    switch (prefix) {
        case 'urlreport':
            const modifiedId = id.split('-')[1];
            setTimeout(async () => {
                const urlreport = await getURL(modifiedId, apikey);
                await addTestToStorage(urlreport);
                console.log('Got URL report')
                chrome.alarms.clear(alarm.name);
            }, 15000);
            break;
        case 'filereport':
            const sha256 = alarm.name.split('|')[1];
            const filereport = await getFile(sha256, apikey);
            if (filereport.data.attributes.names.length !== 0) {
                chrome.alarms.clear(alarm.name);
                console.log('Got file report');
                await addTestToStorage(filereport);
            }
            break;
        case 'urlfilereport':
            const urlReport = await getURL(id, apikey);
            if (!urlReport.data.id) {
                chrome.notifications.create({
                    title: 'Virus Total',
                    message:
                        "I couldn't scan the file, proceed at your own risk.",
                    iconUrl: 'vt-200px.png',
                    type: 'basic',
                });
                return;
            }
            if (urlReport.data.attributes.tags.length === 0) break;
            await chrome.alarms.clear(alarm.name);
            console.log('Got file URL report');
            if (
                urlReport.data.attributes.last_http_response_headers[
                    'Content-Type'
                ].includes('image')
            ) {
                if (settings.imageCheck) {
                    await addTestToStorage(urlReport);
                    break;
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
                break;
            }
            chrome.alarms.create(
                `filereport|${urlReport.data.attributes.last_http_response_content_sha256}`,
                {
                    periodInMinutes: 1,
                },
            );
            break;
        default:
            break;
    }
}
