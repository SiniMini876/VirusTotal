import { getSettings } from "./functions/getChromeStorage";
import { handleAlarm } from "./functions/handleAlarm";
import { handleFileScan } from "./functions/handleFileScan";
import { postURL } from "./functions/postURL";

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		title: "Scan URL",
		contexts: ["link"],
		id: "vtscanurl",
	});
	chrome.storage.sync.set({
		settings: {
			downloads: true,
			apikey: "0884cf2c2e6d77db8a6bf524d38b6aff88ccee7b61cde1621799d63da1958c6e",
			notSupportedChecked: false,
		},
	});
});

chrome.downloads.onDeterminingFilename.addListener((downloadedItem) => {
	console.log("Started Processing");
	if (downloadedItem.url.length > 485) {
		chrome.notifications.create({
			title: "Virus Total",
			message: "I couldn't scan the file, proceed at your own risk.",
			iconUrl: "vt-200px.png",
			type: "basic",
		});
		return;
	}
	chrome.notifications.create(`scanyesorno|${downloadedItem.url}`, {
		title: "Virus Total",
		iconUrl: "vt-200px.png",
		message: "Do you want to scan the file?",
		type: "basic",
		buttons: [
			{
				title: "Yes",
			},
			{
				title: "No",
			},
		],
	});
});

chrome.contextMenus.onClicked.addListener(async (info) => {
	const settings = await getSettings();
	const { apikey } = settings;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const result = await postURL(info.linkUrl!, apikey);
	setTimeout(async () => {
		chrome.alarms.create(`urlreport|${result.data.id}|${info.linkUrl}`, {
			periodInMinutes: 1,
		});
	}, 15000);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
	await handleAlarm(alarm);
});

chrome.notifications.onButtonClicked.addListener(async (id, index) => {
	const args = id.split("|");
	const settings = await getSettings();

	if (id === "notSupportedChecked") {
		settings.notSupportedChecked = true;
		await chrome.storage.sync.set({ settings });
	}

	if (args[0] === "scanyesorno" && index === 0) {
		await handleFileScan(args, settings);
	}
});
