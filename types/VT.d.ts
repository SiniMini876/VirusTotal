interface VTPostResponse {
    data: {
        type: string;
        id: string;
    };
    type: 'url' | 'file';
}

interface VTGetAnalysis {
    data: {
        attributes: {
            date: number;
            results: {
                [key: string]: {
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
            status: string;
            id: string;
            type: 'analysis';
        };
    };
}

interface VTGetURLAnalysis {
    data: {
        attributes: {
            categories: object;
            favicon: {
                dhash: string;
                raw_md5: string;
            };
            first_submission_date: number;
            html_meta: {
                [str: string]: [tag_value: string];
            };
            last_analysis_date: number;
            last_analysis_results: {
                [str: string]: {
                    category: string;
                    engine_name: string;
                    method: string;
                    result: string;
                };
            };
            last_analysis_stats: {
                harmless: number;
                malicious: number;
                suspicious: number;
                timeout: number;
                undetected: number;
            };
            last_final_url: string;
            last_http_response_code: number;
            last_http_response_content_length: number;
            last_http_response_content_sha256: string;
            last_http_response_cookies: {
                string: string;
                [key: string]: unknown;
            };
            last_http_response_headers: {
                string: string;
                [key: string]: unknown;
            };
            last_modification_date: number;
            last_submission_date: number;
            outgoing_links: [string];
            redirection_chain: [string];
            reputation: number;
            tags: [string];
            targeted_brand: {
                [str: string]: string;
            };
            times_submitted: number;
            title: string;
            total_votes: {
                harmless: number;
                malicious: number;
            };
            trackers: {
                [str: string]: [
                    {
                        id: string;
                        timestamp: number;
                        url: string;
                    },
                ];
            };
            url: string;
        };
        id: string;
        links: {
            self: string;
        };
        type: 'url';
    };
}
