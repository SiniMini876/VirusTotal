export async function getAnalysis(id: string, apikey: string) {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'x-apikey': apikey,
        },
    };

    const modifiedId = encodeURIComponent(id);
    try {
        const response = await fetch(
            `https://www.virustotal.com/api/v3/analyses/${modifiedId}`,
            options,
        );
        const data = (await response.json()) as VTGetAnalysis;
        return data ? data : ({} as VTGetAnalysis);
    } catch (err) {
        return {} as VTGetAnalysis;
    }
}
