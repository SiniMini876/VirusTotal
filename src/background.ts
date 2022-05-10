import { addTestToStorage } from './functions/addTestToStorage';
import { getFile } from './functions/getFile';
import { getURL } from './functions/getURL';
import { postURL } from './functions/postURL';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: 'Scan URL',
        contexts: ['link'],
        id: 'vtscanurl',
    });
    chrome.storage.sync.set({
        settings: {
            downloads: true,
            apikey: '0884cf2c2e6d77db8a6bf524d38b6aff88ccee7b61cde1621799d63da1958c6e',
        },
    });
});

chrome.downloads.onCreated.addListener(async (downloadedItem) => {
    chrome.notifications.create(`scanyesorno|${downloadedItem.url}`, {
        title: 'Virus Total',
        iconUrl: 'vt-200px.png',
        message: 'Do you want to scan the file?',
        type: 'basic',
        buttons: [
            {
                title: 'Yes',
            },
            {
                title: 'No',
            },
        ],
    });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
    const { settings } = await chrome.storage.sync.get(['settings']);
    const { apikey } = settings;
    const result = await postURL(info.linkUrl!, apikey);
    setTimeout(async () => {
        chrome.alarms.create(`urlreport|${result.data.id}`, {
            periodInMinutes: 1,
        });
    }, 15000);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    const { settings } = await chrome.storage.sync.get(['settings']);
    const { apikey } = settings;
    const prefix = alarm.name.split('|')[0];
    if (prefix === 'urlreport') {
        const id = alarm.name.split('|')[1];
        const modifiedId = id.split('-')[1];
        console.log(prefix, id, modifiedId);
        setTimeout(async () => {
            const urlreport = await getURL(modifiedId, apikey);
            console.log(urlreport);
            await addTestToStorage(urlreport);
            chrome.alarms.clear(alarm.name);
        }, 15000);
    }
    if (prefix === 'filereport') {
        const sha256 = alarm.name.split('|')[1];
        const filereport = await getFile(sha256, apikey);
        console.log(prefix, sha256);
        if (!filereport.data) {
            chrome.alarms.clear(alarm.name);
            console.log(filereport);
            await addTestToStorage(filereport);
        }
    }
});

chrome.notifications.onButtonClicked.addListener(async (id, index) => {
    const args = id.split('|');
    const { settings } = await chrome.storage.sync.get(['settings']);

    if (id === 'imageCheck') {
        settings.imageCheck = true;
        await chrome.storage.sync.set({ settings });
    }

    if (args[0] === 'scanyesorno' && index === 0) {
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
                    message:
                        "I couldn't scan the file, proceed at your own risk.",
                    iconUrl: 'vt-200px.png',
                    type: 'basic',
                });
                return;
            }
            if (
                urlReport.data.attributes.last_http_response_headers[
                    'content-type'
                ].includes('image')
            ) {
                if (settings.imageCheck) {
                    console.log("Don't show again enabled!");
                    await addTestToStorage(urlReport);
                    return;
                }
                chrome.notifications.create(
                    'imageCheck',
                    {
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
                    },
                    async (id) => {
                        settings.imageNotification = id;
                        await chrome.storage.sync.set({ settings });
                        console.log(settings);
                    },
                );
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
});
