import { blobToBase64 } from './blobToBase64';

export async function postFile32MB(
    downloadedItem: chrome.downloads.DownloadItem,
    apikey: string,
) {
    const filerespose = await fetch(downloadedItem.finalUrl);
    const blob = await filerespose.blob();
    const base64Blob = (await blobToBase64(blob)) as string;
    console.log(filerespose.text);
    if (filerespose.status === 401 || 404) {
        chrome.notifications.create({
            title: 'Virus Total: Error',
            message: `There was an error downloading the file.\n${filerespose}`,
            iconUrl: 'vt-200px.jpeg',
            type: 'basic',
        });
        return {
            data: {
                id: '',
                type: '',
            },
            type: 'file',
        } as VTPostResponse;
    }

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
