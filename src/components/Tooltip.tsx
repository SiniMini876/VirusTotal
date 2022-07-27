import React, { useState } from "react";
import "../css/Tooltip.css";

type Props = {
	children: any;
	content: VTtest;
};

function Tooltip(props: Props) {
	const [active, setActive] = useState(false);

	const showTip = () => {
		setActive(true);
	};

	const hideTip = () => {
		setActive(false);
	};

	const vtScanURL =
		props.content.type === "file"
			? `https://virustotal.com/gui/file/${props.content.sha256}`
			: `https://virustotal.com/gui/url/${props.content.sha256}`;
	return (
		<div
			className="Tooltip-Wrapper"
			onMouseEnter={showTip}
			onMouseLeave={hideTip}
		>
			{props.children}
			{active && (
				<div className={"Tooltip-Tip bottom"}>
					<a
						href={props.content.widget}
						className="stat"
						target="blank_"
					>
						Widget
					</a>
					<br />
					<a className="stat" href={vtScanURL} target="blank_">
						VT Analyses
					</a>
					<br />
					<div className="stat">Harmless</div>:{" "}
					{props.content.stats.harmless}
					<br />
					<div className="stat">Malicious</div>:{" "}
					{props.content.stats.malicious}
					<br />
					<div className="stat">Suspicious</div>:{" "}
					{props.content.stats.suspicious}
					<br />
					<div className="stat">Undetected</div>:{" "}
					{props.content.stats.undetected}
					<br />
					<div className="stat">SHA256</div>:{" "}
					<div style={{ fontSize: "10px", marginTop: "2px" }}>
						{props.content.sha256}
					</div>
				</div>
			)}
		</div>
	);
}

export default Tooltip;
