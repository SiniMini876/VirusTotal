export async function getRelationShip(id: string, apikey: string) {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'x-apikey': apikey,
        },
    };

    const response = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${id}/item`,
        options,
    );
    return response.json() as Promise<GETRelationShip>;
}
