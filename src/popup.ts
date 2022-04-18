const scans_element = document.getElementById('scans');
const clear_scans = document.getElementById('clearscans');
const downloads = document.getElementById('#downloads');

const { VTtests } = (await chrome.storage.sync.get(['VTtests'])) as {
    VTtests: VTtest[];
};

if (VTtests.length !== 0) {
    for (const test of VTtests) {
        const newText = `${test.date} Test:\nID: ${test.id}\nHarmless: ${test.stats.harmless}\nMalicious: ${test.stats.malicious}\nSuspicious: ${test.stats.suspicious}\nUndetected: ${test.stats.undetected}`;

        scans_element!.innerText += newText;
    }
}

clear_scans?.addEventListener('click', () => {
    chrome.storage.sync.set({ VTtests: [] });
});

downloads?.addEventListener('onchange', async (e) => {
    let settings = await chrome.storage.sync.get('settings');
    if (!settings) {
        settings = {
            downloads: downloads.checked,
        };
    }

    settings.downloads.checked = downloads.checked
    chrome.storage.sync.set({ settings });
});

export {};
