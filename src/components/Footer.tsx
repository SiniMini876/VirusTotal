import "../css/Footer.css";
import React from "react";

function Footer() {
	return (
		<footer className="copyright">
			Made by&nbsp;&nbsp;
			<a
				href="https://www.github.com/SiniMini876"
				target="_blank"
				rel="noreferrer"
			>
				SiniMini876
			</a>
			&nbsp; with &nbsp;
			<a
				href="https://www.virustotal.com"
				target="_blank"
				rel="noreferrer"
			>
				Virus Total API
			</a>
		</footer>
	);
}

export default Footer;
