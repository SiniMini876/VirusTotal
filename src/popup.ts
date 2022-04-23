import { VTtest } from '../types/VT';

const scans_element = document.getElementById('scans');
const clear_scans = document.getElementById('clearscans');
const downloads = document.getElementById('scandownloads') as Checkbox;

const { VTtests } = (await chrome.storage.sync.get(['VTtests'])) as {
    VTtests: VTtest[];
};

if (VTtests.length !== 0) {
    for (const test of VTtests) {
        const newText = `<br><a href="${test.url}" target="blank_">Site</a>:<br>ID: ${test.id}<br>Harmless: ${test.stats.harmless}<br>Malicious: ${test.stats.malicious}<br>Suspicious: ${test.stats.suspicious}<br>Undetected: ${test.stats.undetected}`;

        scans_element!.innerHTML += newText;
    }
}

clear_scans?.addEventListener('click', () => {
    chrome.storage.sync.set({ VTtests: [] });
});

downloads?.addEventListener('onchange', async () => {
    let settings = await chrome.storage.sync.get('settings');
    if (!settings) {
        settings = {
            downloads: downloads.checked,
        };
    }
    console.log(settings)
    settings.downloads.checked = downloads.checked;
    chrome.storage.sync.set({ settings });
});

export {};
