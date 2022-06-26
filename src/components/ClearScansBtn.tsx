import "../css/ClearScansBtn.css";
import React from "react";

function ClearScansBtn() {
	function clearTests() {
		chrome.storage.sync.set({ VTtests: [] });
	}
	return (
		<div>
			<button className="clearscans" onClick={clearTests}>
				Clear Scans
			</button>

			<div className="line"></div>
		</div>
	);
}

export default ClearScansBtn;
