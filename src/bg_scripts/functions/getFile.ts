export async function getFile(sha256: string, apikey: string) {
	const options = {
		method: "GET",
		headers: {
			Accept: "application/json",
			"x-apikey": apikey,
		},
	};
	try {
		const response = await fetch(
			`https://www.virustotal.com/api/v3/files/${sha256}`,
			options
		);
		const data = (await response.json()) as VTResponseFile;
		return data ? data : ({} as VTResponseFile);
	} catch (err) {
		return {} as VTResponseFile;
	}
}
