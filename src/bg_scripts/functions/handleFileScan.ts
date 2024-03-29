import { postURL } from "./postURL";

export async function handleFileScan(args: string[], settings: Settings) {
	const url = args[1];

	const { apikey } = settings;
	if (settings && !settings.downloads) return;
	const result = await postURL(url, apikey);
	if (!result.data.id) {
		chrome.notifications.create({
			title: "Virus Total",
			message: "I couldn't scan the file, proceed at your own risk.",
			iconUrl: "vt-200px.png",
			type: "basic",
		});
		return;
	}

	const modifiedId = result.data.id.split("-")[1];
	console.log(`urlfilereport|${modifiedId}|${url}`);
	chrome.alarms.create(`urlfilereport|${modifiedId}|${url}`, {
		periodInMinutes: 1,
	});
}
