const yes = document.getElementById('yes');
const no = document.getElementById('no');

yes?.addEventListener('click', () => {
    chrome.runtime.sendMessage('yes');
});

no?.addEventListener('click', () => {
    chrome.runtime.sendMessage('no');
});
