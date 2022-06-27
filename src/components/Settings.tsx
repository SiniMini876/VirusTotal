import React, { useEffect, useState } from "react";
import { getSettings } from "../bg_scripts/functions/getChromeStorage";
import "../css/Settings.css";

function Settings() {
	const [setting, setSettings] = useState<Settings>({} as Settings);
	const [apiValue, setApiValue] = useState<string>("");
	const [downloads, setDownloads] = useState(true);
	useEffect(() => {
		async function chromeDownloads() {
			const settings = await getSettings();
			setSettings(settings);
			setDownloads(settings.downloads);
		}
		chromeDownloads();
	}, []);

	function turnDownloads() {
		const newDownloads = !downloads;
		setDownloads(newDownloads);
	}

	async function onSubmit(e: any) {
		e.preventDefault();
		let apiKey = apiValue;
		if (apiKey.length === 0) {
			apiKey = setting.apikey;
		}
		const newSettings: Settings = {
			apikey: apiKey,
			downloads: downloads,
			notSupportedChecked: setting.notSupportedChecked,
		};
		chrome.storage.sync.set({ settings: newSettings });
	}

	function keyOnChange(e: any) {
		e.preventDefault();
		setApiValue(e.target.value);
	}
	return (
		<div>
			<h2>Settings:</h2>
			<form onSubmit={onSubmit}>
				<div className="textscandownloads">
					Scan for income downlaods
				</div>
				<label className="switch">
					<input
						checked={downloads}
						type="checkbox"
						className="scandownloads"
						onChange={turnDownloads}
					/>
					<span className="slider round"></span>
				</label>
				<br />
				<div className="apikeytext">Api Key:</div>
				<input
					type="text"
					className="apitextinput"
					placeholder={
						apiValue.length === 0
							? "For safety, the stored key won't be shown"
							: ""
					}
					onChange={keyOnChange}
					value={apiValue}
				/>
				<button type="submit" className="settings_submit">
					Save
				</button>
			</form>
			<br />
		</div>
	);
}

export default Settings;
