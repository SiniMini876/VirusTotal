const apikey =
    '0884cf2c2e6d77db8a6bf524d38b6aff88ccee7b61cde1621799d63da1958c6e';
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: 'Scan URL',
        contexts: ['link'],
        id: 'vtscanurl',
    });
});

chrome.downloads.onCreated.addListener(async (downloadedItem) => {
    const settings = await chrome.storage.sync.get('settings');
    if (settings && !settings.downloads) return;
    await chrome.downloads.pause(downloadedItem.id);
    let result: VTPostResponse = {
        data: {
            id: '',
            type: '',
        },
        type: 'file',
    };
    console.log(downloadedItem.fileSize);
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

    console.log(result);

    if (!result.data.id) {
        chrome.notifications.create({
            title: 'Virus Total',
            message: "I couldn't scan the file, proceed at your own risk.",
            iconUrl: 'vt-200px.jpeg',
            type: 'basic',
        });
        return;
    }

    const analysesResult = await getFileAnalysis(result);

    const resultInStorage = {
        date: analysesResult.data.attributes.date,
        id: result.data.id,
        stats: analysesResult.data.attributes.stats,
    };

    const { VTtests } = await chrome.storage.sync.get(['VTtests']);

    console.log(VTtests);

    VTtests.push(resultInStorage);

    await chrome.storage.sync.set({
        VTtests,
    });

    if (analysesResult.data.attributes.stats.malicious > 0) {
        chrome.notifications.create({
            title: 'Virus Total',
            message: `WARNING!!! ${analysesResult.data.attributes.stats.malicious} anti viruses identified this file as malicious! It's be recommended to stop the download.`,
            iconUrl: 'vt-200px.jpeg',
            type: 'basic',
        });
        return;
    }
    if (analysesResult.data.attributes.stats.suspicious > 0) {
        chrome.notifications.create({
            title: 'Virus Total',
            message: `WARNING!!! ${analysesResult.data.attributes.stats.suspicious} anti viruses identified this file as suspicious! It's be recommended to stop the download.`,
            iconUrl: 'vt-200px.jpeg',
            type: 'basic',
        });
    }
});

chrome.contextMenus.onClicked.addListener(async (info) => {
    const result = await postURL(info.linkUrl!);
    let analysesResult = {} as VTGetURLAnalysis;

    setTimeout(async () => {
        analysesResult = await getURLAnalysis(result);

        const arrayOfId = result.data.id.split('-');
        const modifiedId = arrayOfId[1];

        const resultInStorage = {
            date: analysesResult.data.attributes.last_analysis_date,
            id: modifiedId,
            stats: analysesResult.data.attributes.last_analysis_stats,
        };

        const { VTtests } = await chrome.storage.sync.get(['VTtests']);

        console.log(VTtests);

        VTtests.push(resultInStorage);

        await chrome.storage.sync.set({
            VTtests,
        });

        if (analysesResult.data.attributes.last_analysis_stats.malicious > 0) {
            chrome.notifications.create({
                title: 'Virus Total',
                message: `WARNING!!! ${analysesResult.data.attributes.last_analysis_stats.malicious} anti viruses identified this website as malicious! It's be recommended to leave the page`,
                iconUrl: 'vt-200px.jpeg',
                type: 'basic',
            });
            return;
        }
        if (analysesResult.data.attributes.last_analysis_stats.suspicious > 0) {
            chrome.notifications.create({
                title: 'Virus Total',
                message: `WARNING!!! ${analysesResult.data.attributes.last_analysis_stats.suspicious} anti viruses identified this website as suspicious! It's be recommended to leave the page`,
                iconUrl: 'vt-200px.jpeg',
                type: 'basic',
            });
        }

        if (analysesResult.data.attributes.total_votes.malicious > 0) {
            chrome.notifications.create({
                title: 'Virus Total',
                message: `${analysesResult.data.attributes.total_votes.malicious} people voted website as suspicious. Anything is at your own risk.`,
                iconUrl: 'vt-200px.jpeg',
                type: 'basic',
            });
        }
    }, 3500);
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

function blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

async function getFileAnalysis(vt_response: VTPostResponse) {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'x-apikey': apikey,
        },
    };

    const modifiedId = vt_response.data.id.replace(/-/g, '%3D');
    const response = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${modifiedId}`,
        options,
    );
    const data = (await response.json()) as VTGetAnalysis;
    console.log(data);
    return data ? data : ({} as VTGetAnalysis);
}

async function getURLAnalysis(vt_response: VTPostResponse) {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'x-apikey': apikey,
        },
    };
    const arrayOfId = vt_response.data.id.split('-');
    const modifiedId = arrayOfId[1];
    const response = await fetch(
        `https://www.virustotal.com/api/v3/urls/${modifiedId}`,
        options,
    );
    const data = (await response.json()) as VTGetURLAnalysis;
    console.log(data);
    return data ? data : ({} as VTGetURLAnalysis);
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
    console.log(data);
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
