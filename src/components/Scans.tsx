import React, { useEffect, useState } from "react";
import "../css/Scans.css";
import Tooltip from "./Tooltip";

function Scans() {
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

	function searchInputFunc(e: any) {
		const { value } = e.target;

		const testsToShow = [];
		for (const test of tests) {
			if (
				test.name.toLowerCase().includes(value.toLowerCase()) ||
				test.url.toLowerCase().includes(value.toLowerCase())
			) {
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
				placeholder="Search by Name / URL"
			/>
			{results.map((scan) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion

				return (
					<div key={scan.url}>
						<Tooltip content={scan}>
							<a className="stat" href={scan.url} target="blank_">
								{scan.name}
							</a>
						</Tooltip>
					</div>
				);
			}) ?? "Not loaded"}
		</div>
	);
}

export default Scans;
