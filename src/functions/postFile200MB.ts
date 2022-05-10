import { blobToBase64 } from './blobToBase64';

export async function postFile200MB(
    downloadedItem: chrome.downloads.DownloadItem,
    apikey: string,
) {
    const filerespose = await fetch(downloadedItem.finalUrl);
    const blob = await filerespose.blob();
    const base64Blob = (await blobToBase64(blob)) as string;

    const options_uploadurl = {
        method: 'GET',
        headers: { Accept: 'application/json', 'x-apikey': apikey },
    };

    const uploadURL_data = await fetch(
        'https://www.virustotal.com/api/v3/files/upload_url',
        options_uploadurl,
    );
    const upload_URL = await uploadURL_data.json();

    if (upload_URL.data) {
        const options = {
            method: 'POST',
            headers: {
                'x-apikey': apikey,
                'Content-Type':
                    'multipart/form-data; boundary=---011000010111000001101001',
            },
            body: `-----011000010111000001101001\r\nContent-Disposition: form-data; data:${blob.type};name="file"; filename="file"\r\n\r\n${base64Blob}\r\n-----011000010111000001101001--\r\n\r\n`,
        };

        const response = await fetch(
            'https://www.virustotal.com/api/v3/files',
            options,
        );
        const data = (await response.json()) as VTPostResponse;
        data.type = 'file';
        return data
            ? data
            : ({
                  data: {
                      id: '',
                      type: '',
                  },
                  type: 'file',
              } as VTPostResponse);
    }

    return {
        data: {
            id: '',
            type: '',
        },
        type: 'file',
    } as VTPostResponse;
}
