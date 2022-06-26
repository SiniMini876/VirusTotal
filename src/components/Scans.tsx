import React, { useEffect, useState } from "react";
import "../css/Scans.css";

function Scans(props: any) {
	const [tests, setTests] = useState<VTtest[]>([]);
	const [results, setResults] = useState<VTtest[]>([]);

	useEffect(() => {
		async function chromeTests() {
			let { VTtests } = (await chrome.storage.sync.get([
				"VTtests",
			])) as StorageVTScans;

			if (!VTtests) VTtests = [];

			setTests(VTtests);
			setResults(VTtests);
		}

		chromeTests();
	}, []);

	useEffect(() => {
		async function chromeTests() {
			let { VTtests } = (await chrome.storage.sync.get([
				"VTtests",
			])) as StorageVTScans;

			if (!VTtests) VTtests = [];

			setTests(VTtests);
			setResults(VTtests);
		}

		chromeTests();
	}, [props]);

	function searchInputFunc(e: any) {
		const { value } = e.target;

		const testsToShow = [];

		for (const test of tests) {
			if (test.url.includes(value)) {
				testsToShow.push(test);
			}
		}

		setResults(testsToShow);
	}

	return (
		<div>
			<h1>Last Scans:</h1>
			<input
				onChange={searchInputFunc}
				type="search"
				className="search_bar"
				placeholder="Search by URL"
			/>
			{results.map((scan) => {
				const vtScanURL =
					scan.type === "file"
						? `https://virustotal.com/gui/file/${scan.sha256}`
						: `https://virustotal.com/gui/url/${scan.sha256}`;
				const name = scan.type === "file" ? "File" : "Site";
				return (
					<div key={scan.url}>
						<a className="stat" href={scan.url} target="blank_">
							{name}
						</a>
						<br />
						<a href={scan.widget} className="stat" target="blank_">
							Widget
						</a>
						<br />
						<a className="stat" href={vtScanURL} target="blank_">
							VT Analyses
						</a>
						<br />
						<div className="stat">Harmless</div>:{" "}
						{scan.stats.harmless}
						<br />
						<div className="stat">Malicious</div>:{" "}
						{scan.stats.malicious}
						<br />
						<div className="stat">Suspicious</div>:{" "}
						{scan.stats.suspicious}
						<br />
						<div className="stat">Undetected</div>:{" "}
						{scan.stats.undetected}
						<br />
						<div className="stat">SHA256</div>: {scan.sha256}
						<br />
					</div>
				);
			}) ?? "Not loaded"}
		</div>
	);
}

export default Scans;