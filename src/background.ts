import { addTestToStorage } from './functions/addTestToStorage';
import { getFile } from './functions/getFile';
import { getURL } from './functions/getURL';
import { handleFileScan } from './functions/handleFileScan';
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
        if (filereport.data.attributes.names.length !== 0) {
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
        await handleFileScan(args, settings);
    }
});
