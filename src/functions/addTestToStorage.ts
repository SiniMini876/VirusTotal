import { getRelationShip } from './getRelationShip';

export async function addTestToStorage(
    analysesResult: VTGetAnalysis,
    apikey: string,
) {
    let item = await getRelationShip(analysesResult.data.id, apikey);
    console.log(item);
    if (!item.data.attributes) item = {} as GETRelationShip;

    const resultInStorage = {
        date: analysesResult.data.attributes.date,
        id: analysesResult.data.id,
        stats: analysesResult.data.attributes.stats,
        meta: analysesResult.meta,
        links: analysesResult.data.links,
        sha256: '',
        lastURL: '',
        type: '',
    };

    if (item.data.type === 'file') {
        resultInStorage.sha256 = item.data.attributes.sha256;
        resultInStorage.lastURL = item.data.links.self;
        resultInStorage.type = 'file';
    }
    if (item.data.type === 'url') {
        resultInStorage.sha256 = item.data.id;
        resultInStorage.lastURL = item.data.attributes.last_final_url;
        resultInStorage.type = 'url';
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
