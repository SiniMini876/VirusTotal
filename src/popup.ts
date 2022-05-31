const clear_scans = document.getElementById('clearscans');
const progress = document.getElementById('progress');
const downloads = document.getElementById('scandownloads') as Checkbox;
const scans_element = document.getElementById('scans');
const changeAPIKey = document.getElementById('changeApiKey');
const template = document.getElementById('template');

async function initialSetup() {
    const { settings } = await chrome.storage.sync.get(['settings']);

    downloads.checked = settings.downloads;

    let { VTtests } = (await chrome.storage.sync.get([
        'VTtests',
    ])) as StorageVTScans;

    if (!VTtests) VTtests = [];

    if (VTtests.length === 0) return;
    const allAlarms = await chrome.alarms.getAll();
    for (const alarm of allAlarms) {
        const [prefix, url] = alarm.name.split('|');
        const date = new Date(alarm.scheduledTime);
        const newAlarm = `
        <a href="${url}">${prefix.toLocaleUpperCase()}</a>
        ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}<br>`;

        progress!.innerHTML += newAlarm;
    }
    for (const test of VTtests) {
        const vtScanURL =
            test.type === 'file'
                ? `https://virustotal.com/gui/file/${test.sha256}`
                : `https://virustotal.com/gui/url/${test.sha256}`;
        const name = test.type === 'file' ? 'File' : 'Site';
        const newText = `
        <a class=stat href="${test.lastURL}" target="blank_">${name}</a>
        <br><a class=stat href=${vtScanURL} target="blank_">VT Analyses</a>
        <br><div class=stat>Harmless</div>: ${test.stats.harmless}
        <br><div class=stat>Malicious</div>: ${test.stats.malicious}
        <br><div class=stat>Suspicious</div>: ${test.stats.suspicious}
        <br><div class=stat>Undetected</div>: ${test.stats.undetected}
        <br><div class=stat>SHA256</div>: ${test.sha256}<br>`;

        scans_element!.innerHTML += newText;
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
changeAPIKey?.addEventListener('click', () => {
    const textInput = document.createElement('input');
    const submit = document.createElement('button');
    submit.innerText = 'Submit';
    textInput.className = 'apitextinput';
    submit.className = 'apisubmit';

    template?.appendChild(textInput);
    template?.appendChild(submit);

    submit.addEventListener('click', async () => {
        const newApiKey = textInput.value;

        let { settings } = await chrome.storage.sync.get(['settings']);
        if (!settings) {
            settings = {
                downloads: true,
                apikey: newApiKey,
            };
        }
        settings.apikey = newApiKey;
        await chrome.storage.sync.set({ settings });

        template?.removeChild(textInput);
        template?.removeChild(submit);
    });
});

export {};
