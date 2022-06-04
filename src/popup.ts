const clear_scans = document.getElementById('clearscans');
const progress = document.getElementById('progress');
const downloads = document.getElementById('scandownloads') as Checkbox;
const scans_element = document.getElementById('scans');
const changeAPIKey = document.getElementById('changeApiKey');
const template = document.getElementById('template');
const searchInput = document.getElementById('search_bar');

async function initialSetup() {
    const { settings } = await chrome.storage.sync.get(['settings']);

    downloads.checked = settings.downloads;

    let { VTtests } = (await chrome.storage.sync.get([
        'VTtests',
    ])) as StorageVTScans;

    if (!VTtests) VTtests = [];

    const allAlarms = await chrome.alarms.getAll();
    for (const alarm of allAlarms) {
        const [prefix, id, url] = alarm.name.split('|');
        const date = new Date(alarm.scheduledTime);
        const now = Date.now();
        const substruction = alarm.scheduledTime - now;
        const howMuchLong = 60000 - substruction;
        const howlong = howMuchLong / 60000;
        const precentege = Math.floor(howlong * 100);
        const newAlarm = `
        <a href="${url}">${prefix.toLocaleUpperCase()}</a>
        ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} 
        <div class="progressbar">
            <div id="${id}" class="progressbar__fill"></div>
            <span class="progressbar__text">${precentege}%</span>
        </div><br>`;

        progress!.innerHTML += newAlarm;
        const progress_bar = document.getElementById(id);
        progress_bar!.style.width = `${precentege}%`;
    }
    for (const test of VTtests) {
        const vtScanURL =
            test.type === 'file'
                ? `https://virustotal.com/gui/file/${test.sha256}`
                : `https://virustotal.com/gui/url/${test.sha256}`;
        const name = test.type === 'file' ? 'File' : 'Site';
        const newText = `
        <a class=stat href="${test.url}" target="blank_">${name}</a>
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

async function changeAPIKeyFunc() {
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
}

async function searchInputFunc(e: any) {
    const { VTtests } = (await chrome.storage.sync.get([
        'VTtests',
    ])) as StorageVTScans;

    const { value } = e.target;

    const testsToShow = [];

    for (const test of VTtests) {
        if (test.url.includes(value)) {
            testsToShow.push(test);
        }
    }
    scans_element!.innerHTML = '';
    for (const test of testsToShow) {
        const vtScanURL =
            test.type === 'file'
                ? `https://virustotal.com/gui/file/${test.sha256}`
                : `https://virustotal.com/gui/url/${test.sha256}`;
        const name = test.type === 'file' ? 'File' : 'Site';
        const newText = `
        <a class=stat href="${test.url}" target="blank_">${name}</a>
        <br><a class=stat href=${vtScanURL} target="blank_">VT Analyses</a>
        <br><div class=stat>Harmless</div>: ${test.stats.harmless}
        <br><div class=stat>Malicious</div>: ${test.stats.malicious}
        <br><div class=stat>Suspicious</div>: ${test.stats.suspicious}
        <br><div class=stat>Undetected</div>: ${test.stats.undetected}
        <br><div class=stat>SHA256</div>: ${test.sha256}<br>`;

        scans_element!.innerHTML += newText;
    }
}

document.addEventListener('DOMContentLoaded', initialSetup);
clear_scans?.addEventListener('click', clearTests);
downloads?.addEventListener('change', downloadOption);
changeAPIKey?.addEventListener('click', changeAPIKeyFunc);
searchInput?.addEventListener('input', searchInputFunc);

export {};
