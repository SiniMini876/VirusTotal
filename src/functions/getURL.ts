export async function getURL(id: string, apikey: string) {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'x-apikey': apikey,
        },
    };

    const response = await fetch(
        `https://www.virustotal.com/api/v3/urls/${id}`,
        options,
    );
    const data = (await response.json()) as VTResponseURL;
    return data ? data : ({} as VTResponseURL);
}
