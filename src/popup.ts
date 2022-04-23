import { Settings, VTtest } from '../types/VT';
const clear_scans = document.getElementById('clearscans');
const downloads = document.getElementById('scandownloads') as Checkbox;
const scans_element = document.getElementById('scans');

async function initialSetup() {
    const { settings } = await chrome.storage.sync.get(['settings']);

    downloads.checked = settings.downloads;

    let { VTtests } = (await chrome.storage.sync.get(['VTtests'])) as {
        VTtests: VTtest[];
    };

    if (!VTtests) {
        VTtests = [];
    }

    if (VTtests.length !== 0) {
        for (const test of VTtests) {
            const newText = `<br><a href="${test.links.item}" target="blank_">${
                test.meta.file_info ? 'File' : 'Site'
            }</a>:<br>ID: ${test.id}<br>Harmless: ${
                test.stats.harmless
            }<br>Malicious: ${test.stats.malicious}<br>Suspicious: ${
                test.stats.suspicious
            }<br>Undetected: ${test.stats.undetected}`;

            scans_element!.innerHTML += newText;
        }
    }
}
function clearTests() {
    chrome.storage.sync.set({ VTtests: [] });
}

async function downloadOption() {
    const downloads3 = document.getElementById('scandownloads') as Checkbox;
    let { settings } = await chrome.storage.sync.get(['settings']);
    if (!settings) {
        settings = {
            downloads: downloads3.checked,
        };
    }
    settings.downloads = downloads3.checked;
    await chrome.storage.sync.set({ settings });
}

document.addEventListener('DOMContentLoaded', initialSetup);
clear_scans?.addEventListener('click', clearTests);
downloads?.addEventListener('change', downloadOption);

export {};
