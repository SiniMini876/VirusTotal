export async function addTestToStorage(result: VTResponseFile | VTResponseURL) {
    const resultInStorage = {
        id: result.data.id,
        lastURL: '',
        date: result.data.attributes.last_analysis_date,
        stats: result.data.attributes.last_analysis_stats,
        links: result.data.links,
        sha256: '',
        type: '',
    };

    if (result.data.type === 'file') {
        resultInStorage.sha256 = result.data.attributes.sha256;
        resultInStorage.lastURL = result.data.links.self;
        resultInStorage.type = 'file';
    }
    if (result.data.type === 'url') {
        resultInStorage.sha256 = result.data.id;
        resultInStorage.lastURL = result.data.attributes.last_final_url;
        resultInStorage.type = 'url';
    }

    let { VTtests } = await chrome.storage.sync.get(['VTtests']);

    if (!VTtests) VTtests = [];

    VTtests.push(resultInStorage);

    await chrome.storage.sync.set({
        VTtests,
    });

    if (resultInStorage.stats.malicious > 0) {
        chrome.notifications.create({
            title: 'Virus Total',
            message: `WARNING!!! ${resultInStorage.stats.malicious} anti viruses identified this website/file as malicious! It's be recommended to leave/delete the page/file`,
            iconUrl: 'vt-200px.png',
            type: 'basic',
        });
        return;
    }
    if (resultInStorage.stats.suspicious > 0) {
        chrome.notifications.create({
            title: 'Virus Total',
            message: `WARNING!!! ${resultInStorage.stats.suspicious} anti viruses identified this website/file as malicious! It's be recommended to leave/delete the page/file`,
            iconUrl: 'vt-200px.png',
            type: 'basic',
        });
    }
}
