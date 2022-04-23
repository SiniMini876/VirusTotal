interface VTPostResponse {
    data: {
        type: string;
        id: string;
    };
    type: 'url' | 'file';
}

interface VTtest {
    url: string;
    date: number;
    id: string;
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
        id: string;
        type: 'analysis';
    };
}
