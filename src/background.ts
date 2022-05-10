import { addTestToStorage } from './functions/addTestToStorage';
import { getAnalysis } from './functions/getAnalysis';
import { postFile200MB } from './functions/postFile200MB';
import { postFile32MB } from './functions/postFile32MB';
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
    // const popup = await chrome.windows.create({
    //     focused: true,
    //     width: 400,
    //     height: 205,
    //     type: 'popup',
    //     url: 'option.html',
    //     top: 40,
    //     left: 35,
    // });
    // chrome.runtime.onMessage.addListener(async (request, sender) => {
    //     if (sender.tab!.id! !== popup.tabs![0].id) return;
    //     chrome.windows.remove(popup.id!);
    //     if (request === 'no') {
    //         console.log('Received NO!');
    //         return;
    //     }
    //     console.log('Received YES');

        const { settings } = await chrome.storage.sync.get(['settings']);
        const { apikey } = settings;
        if (settings && !settings.downloads) return;
        let result: VTPostResponse = {
            data: {
                id: '',
                type: '',
            },
            type: 'file',
        };
        if (downloadedItem.fileSize > 3.2e7)
            result = await postFile32MB(downloadedItem, apikey);
        if (downloadedItem.fileSize < 2e8)
            result = await postFile200MB(downloadedItem, apikey);
        if (downloadedItem.fileSize > 2e8) {
            chrome.notifications.create({
                title: 'Virus Total',
                message:
                    "The file is over 200MB, I couldn't scan the file, proceed at your own risk.",
                iconUrl: 'vt-200px.jpeg',
                type: 'basic',
            });
            return;
        }

        if (!result.data.id) {
            chrome.notifications.create({
                title: 'Virus Total',
                message: "I couldn't scan the file, proceed at your own risk.",
                iconUrl: 'vt-200px.jpeg',
                type: 'basic',
            });
            return;
        }
        console.log('Started Analysing');
        const analysesResult = await getAnalysis(result.data.id, apikey);

        chrome.alarms.create(analysesResult.data.id, {
            periodInMinutes: 1,
        });
    // });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
    const { settings } = await chrome.storage.sync.get(['settings']);
    const { apikey } = settings;
    const result = await postURL(info.linkUrl!);
    const analysesResult = await getAnalysis(result.data.id, apikey);
    setTimeout(async () => {
        chrome.alarms.create(analysesResult.data.id, {
            periodInMinutes: 1,
        });
    }, 5000);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    const { settings } = await chrome.storage.sync.get(['settings']);
    const { apikey } = settings;
    const analysis = await getAnalysis(alarm.name, apikey);
    console.log(analysis);
    if (analysis.data.attributes.status === 'completed') {
        chrome.alarms.clear(alarm.name);
        await addTestToStorage(analysis, apikey);
    }
});
