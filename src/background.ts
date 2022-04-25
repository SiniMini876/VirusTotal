import { VTPostResponse, VTGetAnalysis, GETRelationShip } from '../types/VT';

const apikey =
    '0884cf2c2e6d77db8a6bf524d38b6aff88ccee7b61cde1621799d63da1958c6e';
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: 'Scan URL',
        contexts: ['link'],
        id: 'vtscanurl',
    });
    chrome.storage.sync.set({ settings: { downloads: true } });
});

chrome.downloads.onCreated.addListener(async (downloadedItem) => {
    const { settings } = await chrome.storage.sync.get(['settings']);
    if (settings && !settings.downloads) return;
    await chrome.downloads.pause(downloadedItem.id);
    let result: VTPostResponse = {
        data: {
            id: '',
            type: '',
        },
        type: 'file',
    };
    if (downloadedItem.fileSize > 3.2e7)
        result = await postFile32MB(downloadedItem);
    if (downloadedItem.fileSize < 2e8)
        result = await postFile200MB(downloadedItem);
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
    const analysesResult = await getAnalysis(result.data.id);

    chrome.alarms.create(analysesResult.data.id, {
        periodInMinutes: 1,
    });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
    const result = await postURL(info.linkUrl!);
    const analysesResult = await getAnalysis(result.data.id);
    setTimeout(async () => {
        chrome.alarms.create(analysesResult.data.id, {
            periodInMinutes: 1,
        });
    }, 5000);
});

async function postFile32MB(downloadedItem: chrome.downloads.DownloadItem) {
    const filerespose = await fetch(downloadedItem.finalUrl);
    const blob = await filerespose.blob();
    const base64Blob = (await blobToBase64(blob)) as string;

    const options = {
        method: 'POST',
        headers: {
            'x-apikey': apikey,
            'Content-Type':
                'multipart/form-data; boundary=---011000010111000001101001',
        },
        body: `-----011000010111000001101001\r\nContent-Disposition: form-data; name="file"; filename="file"\r\n\r\n${base64Blob}\r\n-----011000010111000001101001--\r\n\r\n`,
    };

    const response = await fetch(
        'https://www.virustotal.com/api/v3/files',
        options,
    );
    const data = (await response.json()) as VTPostResponse;
    data.type = 'file';
    return data
        ? data
        : ({
              data: {
                  id: '',
                  type: '',
              },
              type: 'file',
          } as VTPostResponse);
}

async function postFile200MB(downloadedItem: chrome.downloads.DownloadItem) {
    const filerespose = await fetch(downloadedItem.finalUrl);
    const blob = await filerespose.blob();
    const base64Blob = (await blobToBase64(blob)) as string;

    const options_uploadurl = {
        method: 'GET',
        headers: { Accept: 'application/json', 'x-apikey': apikey },
    };

    const uploadURL_data = await fetch(
        'https://www.virustotal.com/api/v3/files/upload_url',
        options_uploadurl,
    );
    const upload_URL = await uploadURL_data.json();

    if (upload_URL.data) {
        const options = {
            method: 'POST',
            headers: {
                'x-apikey': apikey,
                'Content-Type':
                    'multipart/form-data; boundary=---011000010111000001101001',
            },
            body: `-----011000010111000001101001\r\nContent-Disposition: form-data; name="file"; filename="file"\r\n\r\n${base64Blob}\r\n-----011000010111000001101001--\r\n\r\n`,
        };

        const response = await fetch(
            'https://www.virustotal.com/api/v3/files',
            options,
        );
        const data = (await response.json()) as VTPostResponse;
        data.type = 'file';
        return data
            ? data
            : ({
                  data: {
                      id: '',
                      type: '',
                  },
                  type: 'file',
              } as VTPostResponse);
    }

    return {
        data: {
            id: '',
            type: '',
        },
        type: 'file',
    } as VTPostResponse;
}

async function postURL(url: string) {
    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'x-apikey':
                '0884cf2c2e6d77db8a6bf524d38b6aff88ccee7b61cde1621799d63da1958c6e',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ url }),
    };

    const response = await fetch(
        'https://www.virustotal.com/api/v3/urls',
        options,
    );
    const data = (await response.json()) as VTPostResponse;
    data.type = 'url';
    return data
        ? data
        : ({
              data: {
                  id: '',
                  type: '',
              },
              type: 'url',
          } as VTPostResponse);
}

async function getAnalysis(id: string) {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'x-apikey': apikey,
        },
    };

    const modifiedId = encodeURIComponent(id);
    const response = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${modifiedId}`,
        options,
    );
    const data = (await response.json()) as VTGetAnalysis;
    return data ? data : ({} as VTGetAnalysis);
}

function blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
    const analysis = await getAnalysis(alarm.name);
    console.log(analysis);
    if (analysis.data.attributes.status === 'completed') {
        chrome.alarms.clear(alarm.name);
        await addTestToStorage(analysis);
    }
});

async function getRelationShip(id: string) {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'x-apikey': apikey,
        },
    };

    const response = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${id}`,
        options,
    );
    return response.json() as Promise<GETRelationShip>;
}

async function addTestToStorage(analysesResult: VTGetAnalysis) {
    const item = await getRelationShip(analysesResult.data.id);

    const resultInStorage = {
        date: analysesResult.data.attributes.date,
        id: analysesResult.data.id,
        stats: analysesResult.data.attributes.stats,
        meta: analysesResult.meta,
        links: analysesResult.data.links,
        sha256: '',
    };

    if (item.data.type === 'file') {
        resultInStorage.sha256 = item.data.attributes.sha256;
    }
    if (item.data.type === 'url') {
        resultInStorage.sha256 = item.data.id;
    }

    let { VTtests } = await chrome.storage.sync.get(['VTtests']);

    if (!VTtests) VTtests = [];

    VTtests.push(resultInStorage);
    console.log(VTtests);

    await chrome.storage.sync.set({
        VTtests,
    });

    if (analysesResult.data.attributes.stats.malicious > 0) {
        chrome.notifications.create({
            title: 'Virus Total',
            message: `WARNING!!! ${analysesResult.data.attributes.stats.malicious} anti viruses identified this website/file as malicious! It's be recommended to leave/delete the page/file`,
            iconUrl: 'vt-200px.jpeg',
            type: 'basic',
        });
        return;
    }
    if (analysesResult.data.attributes.stats.suspicious > 0) {
        chrome.notifications.create({
            title: 'Virus Total',
            message: `WARNING!!! ${analysesResult.data.attributes.stats.suspicious} anti viruses identified this website/file as malicious! It's be recommended to leave/delete the page/file`,
            iconUrl: 'vt-200px.jpeg',
            type: 'basic',
        });
    }
}
