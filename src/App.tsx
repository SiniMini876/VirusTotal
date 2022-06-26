import React from "react";
import Footer from "./components/Footer";
import ProgressBar from "./components/ProgressBar";
import Scans from "./components/Scans";
import Settings from "./components/Settings";
import ClearScansBtn from "./components/ClearScansBtn";

function App() {
	return (
		<div>
			<ProgressBar />
			<Scans />
			<ClearScansBtn />
			<Settings />
			<Footer />
		</div>
	);
}

export default App;
