export async function postURL(url: string, apikey: string) {
	const options = {
		method: "POST",
		headers: {
			Accept: "application/json",
			"x-apikey": apikey,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({ url }),
	};
	try {
		const response = await fetch(
			"https://www.virustotal.com/api/v3/urls",
			options
		);
		const data = (await response.json()) as VTPostResponse;
		data.type = "url";
		return data
			? data
			: ({
				data: {
					id: "",
					type: "",
				},
				type: "url",
			} as VTPostResponse);
	} catch (err) {
		return {
			data: {
				id: "",
				type: "",
			},
			error: err,
			type: "url",
		} as VTPostResponse;
	}
}
