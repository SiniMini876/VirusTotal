const apikey =
    '0884cf2c2e6d77db8a6bf524d38b6aff88ccee7b61cde1621799d63da1958c6e';

chrome.contextMenus.create({
    title: 'Scan URL',
    contexts: ['link'],
    id: 'vtscanurl',
});

chrome.downloads.onCreated.addListener(async (downloadedItem) => {
    await chrome.downloads.pause(downloadedItem.id);

    const result = await postFile(downloadedItem);

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
    console.log(resultInStorage);
    chrome.storage.local.set({ [downloadedItem.id]: resultInStorage });

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
    const analysesResult = await getURLAnalysis(result);

    const resultInStorage = {
        date: analysesResult.data.attributes.last_analysis_date,
        id: result.data.id,
        stats: analysesResult.data.attributes.last_analysis_stats,
    };

    console.log(resultInStorage);
    chrome.storage.local.set({ [result.data.id]: resultInStorage });

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
});

async function postFile(downloadedItem: chrome.downloads.DownloadItem) {
    const filerespose = await fetch(downloadedItem.finalUrl);
    const blob = await filerespose.blob();
    const base64Blob = (await blobToBase64(blob)) as string;

    const options = {
        method: 'POST',
        headers: {
            'x-apikey':
                '0884cf2c2e6d77db8a6bf524d38b6aff88ccee7b61cde1621799d63da1958c6e',
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
        body: new URLSearchParams({ url: url }),
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
