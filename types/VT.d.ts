interface VTPostResponse {
    data: {
        type: string;
        id: string;
    };
    type: 'url' | 'file';
}

interface VTtest {
    url: string;
    links: {
        item: string;
        self: string;
    };
    date: number;
    id: string;
    meta: {
        [info: string]: {
            id: string;
            url: string;
        };
    };
    stats: {
        'confirmed-timeout'?: number;
        failure?: number;
        harmless: number;
        malicious: number;
        suspicious: number;
        timeout: number;
        'type-unsupported'?: number;
        undetected: number;
    };
}

export type Status = 'completed' | 'queued' | 'in-progress';
interface VTGetAnalysis {
    meta: {
        [info: string]: {
            id: string;
            url: string;
        };
    };
    data: {
        attributes: {
            date: number;
            results: {
                [at: string]: {
                    category: string;
                    engine_name: string;
                    engine_version: string;
                    engine_update: string;
                    method: string;
                    result: string;
                };
            };
            stats: {
                'confirmed-timeout': number;
                failure: number;
                harmless: number;
                malicious: number;
                suspicious: number;
                timeout: number;
                'type-unsupported': number;
                undetected: number;
            };
            status: Status;
        };
        links: {
            item: string;
            self: string;
        };
        id: string;
        type: 'analysis';
    };
}

interface Settings {
    downloads: boolean
}