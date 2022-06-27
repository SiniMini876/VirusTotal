export async function getSettings() {
	const { settings } = await chrome.storage.sync.get(["settings"]);
	return settings as Settings;
}

export async function getTests() {
	const { VTtests } = await chrome.storage.sync.get(["VTtests"]);
	return VTtests as VTtest[];
}
