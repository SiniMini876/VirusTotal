export async function getURLWidget(id: string, apikey: string) {
	const options = {
		method: "GET",
		headers: {
			Accept: "application/json",
			"x-apikey": apikey,
		},
	};

	try {
		const response = await fetch(
			`https://www.virustotal.com/api/v3/widget/url?query=${id}`,
			options
		);
		const data = (await response.json()) as VTResponseURLWidget;
		return data ? data : ({} as VTResponseURLWidget);
	} catch (err) {
		return {} as VTResponseURLWidget;
	}
}
