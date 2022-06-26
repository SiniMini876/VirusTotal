import "../css/ProgressBar.css";
import React, { useEffect, useState } from "react";

function ProgressBar() {
	const [alarms, setAlarms] = useState<chrome.alarms.Alarm[]>([]);
	useEffect(() => {
		async function setAlarm() {
			let allAlarms = await chrome.alarms.getAll();
			if (!allAlarms) allAlarms = [];
			setAlarms(allAlarms);
		}
		setAlarm();
	}, []);
	return (
		<div>
			<h1>Scans in progress:</h1>
			<p id="progress" className="progress">
				{alarms.map((alarm) => {
					const [prefix, , url] = alarm.name.split("|");
					const date = new Date(alarm.scheduledTime);
					const now = Date.now();
					const substruction = alarm.scheduledTime - now;
					const howMuchLong = 60000 - substruction;
					const howlong = howMuchLong / 60000;
					const precentege = Math.floor(howlong * 100);

					return (
						<div key={url} className="font-sans text-base">
							<a href={url}>{prefix.toLocaleUpperCase()}</a>
							&nbsp;
							{date.getUTCHours()}:{date.getUTCMinutes()}:
							{date.getUTCSeconds()}
							&nbsp;
							<div className="progressbar">
								<div
									className="progressbar__fill"
									style={{
										width: `${precentege}%`,
									}}
								></div>
								<span className="progressbar__text">
									{precentege}%
								</span>
							</div>
						</div>
					);
				}) ?? "Not loaded"}
			</p>
		</div>
	);
}

export default ProgressBar;
