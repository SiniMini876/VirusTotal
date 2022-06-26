import React, { useEffect, useState } from "react";
import "../css/Settings.css";

function Settings() {
	const [setting, setSettings] = useState<Settings>({} as Settings);
	const [apiValue, setApiValue] = useState<string>("");
	useEffect(() => {
		async function chromeDownloads() {
			const { settings } = await chrome.storage.sync.get(["settings"]);
			setSettings(settings);
		}
		chromeDownloads();
	}, []);

	function turnDownloads() {
		const newSettings: Settings = {
			apikey: setting.apikey,
			downloads: !setting.downloads,
			imageChcek: setting.imageChcek,
		};
		setSettings(newSettings);
	}

	function onSubmit() {
		const newSettings: Settings = {
			apikey: setting.apikey,
			downloads: setting.downloads,
			imageChcek: setting.imageChcek,
		};
		setSettings(newSettings);
	}

	function keyOnChange(e: any) {
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
						checked={setting.downloads}
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
