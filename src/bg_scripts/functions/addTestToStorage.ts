import { getSettings, getTests } from "./getChromeStorage";
import { getURLWidget } from "./getURLWidget";

export async function addTestToStorage(
	result: VTResponseFile | VTResponseURL,
	URL: string
) {
	console.log(result);
	chrome.notifications.create({
		title: "Virus Total",
		message: "The file/url report just got added!",
		iconUrl: "vt-200px.png",
		type: "basic",
	});
	const resultInStorage: VTtest = {
		name: "",
		id: result.data.id,
		url: URL,
		date: result.data.attributes.last_analysis_date,
		stats: result.data.attributes.last_analysis_stats,
		links: result.data.links,
		sha256: "",
		type: "",
		widget: "",
	};

	if (result.data.type === "file") {
		resultInStorage.name = result.data.attributes.names[0];
		resultInStorage.sha256 = result.data.attributes.sha256;
		resultInStorage.type = "file";
	}
	if (result.data.type === "url") {
		resultInStorage.name = result.data.attributes.title;
		resultInStorage.sha256 = result.data.id;
		resultInStorage.type = "url";
	}

	const settings = await getSettings();

	const widgetResponse = await getURLWidget(
		resultInStorage.sha256,
		settings.apikey
	);
	resultInStorage.widget = widgetResponse.data.url;

	let VTtests = await getTests();

	if (!VTtests) VTtests = [];

	VTtests.push(resultInStorage);

	await chrome.storage.sync.set({
		VTtests,
	});

	if (resultInStorage.stats.malicious > 0) {
		chrome.notifications.create({
			title: "Virus Total",
			message: `WARNING!!! ${resultInStorage.stats.malicious} anti viruses identified this website/file as malicious! It's be recommended to leave/delete the page/file`,
			iconUrl: "vt-200px.png",
			type: "basic",
		});
		return;
	}
	if (resultInStorage.stats.suspicious > 0) {
		chrome.notifications.create({
			title: "Virus Total",
			message: `WARNING!!! ${resultInStorage.stats.suspicious} anti viruses identified this website/file as malicious! It's be recommended to leave/delete the page/file`,
			iconUrl: "vt-200px.png",
			type: "basic",
		});
	}
}
