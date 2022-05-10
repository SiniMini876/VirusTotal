export async function postURL(url: string) {
    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'x-apikey':
                '0884cf2c2e6d77db8a6bf524d38b6aff88ccee7b61cde1621799d63da1958c6e',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ url }),
    };

    const response = await fetch(
        'https://www.virustotal.com/api/v3/urls',
        options,
    );
    const data = (await response.json()) as VTPostResponse;
    data.type = 'url';
    return data
        ? data
        : ({
              data: {
                  id: '',
                  type: '',
              },
              type: 'url',
          } as VTPostResponse);
}
