interface VTPostResponse {
    data: {
        type: string;
        id: string;
    };
    type: 'url' | 'file';
}

interface VTtest {
    url: string;
    type: 'url' | 'file';
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
    sha256: string | '';
}

type Status = 'completed' | 'queued' | 'in-progress';
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

interface GETRelationShip {
    data: VTFile | VTURL;
    meta: {
        count: number;
    };
    links: {
        self: string;
    };
}
interface VTResponseURL {
    data: VTURL;
}
interface VTResponseFile {
    data: VTFile;
}

interface VTFile {
    attributes: {
        capabilities_tags: string[];
        creation_date: number;
        crowdsourced_ids_results: [
            {
                alert_context: [
                    {
                        dest_ip: string;
                        dest_port: number;
                        hostname: string;
                        protocol: string;
                        src_ip: string;
                        src_port: number;
                        url: string;
                    },
                ];
                alert_severity: string;
                rule_category: string;
                rule_id: string;
                rule_msg: string;
                rule_source: string;
            },
        ];
        crowdsourced_ids_stats: {
            info: number;
            high: number;
            low: number;
            medium: number;
        };
        crowdsourced_yara_results: [
            {
                description: string;
                match_in_subfile: boolean;
                rule_name: string;
                ruleset_id: string;
                ruleset_name: string;
                source: string;
            },
        ];
        downloadable: boolean;
        first_submission_date: number;
        last_analysis_date: number;
        last_analysis_results: {
            [engine_name: string]: {
                category: string;
                engine_name: string;
                engine_update: string;
                engine_version: string;
                method: string;
                result: string;
            };
        };
        last_analysis_stats: {
            'confirmed-timeout': number;
            failure: number;
            harmless: number;
            malicious: number;
            suspicious: number;
            timeout: number;
            'type-unsupported': number;
            undetected: number;
        };
        last_modification_date: number;
        last_submission_date: number;
        md5: string;
        meaningful_name: string;
        names: string[];
        reputation: number;
        sandbox_verdicts: {
            [sandbox_name: string]: {
                category: string;
                confidence: number;
                malware_classification: [string];
                malware_names: [string];
                sandbox_name: string;
            };
        };
        sha1: string;
        sha256: string;
        sigma_analysis_stats: {
            critical: number;
            high: number;
            low: number;
            medium: number;
        };
        sigma_analysis_summary: {
            [ruleset_name: string]: {
                critical: number;
                high: number;
                low: number;
                medium: number;
            };
        };
        size: number;
        tags: string[];
        times_submitted: number;
        total_votes: {
            harmless: number;
            malicious: number;
        };
        type_description: string;
        type_extension: string;
        type_tag: string;
        unique_sources: number;
        vhash: string;
    };
    id: string;
    links: {
        self: string;
    };
    type: 'file';
}

interface VTURL {
    attributes: {
        categories: object;
        favicon: {
            dhash: string;
            raw_md5: string;
        };
        first_submission_date: number;
        html_meta: {
            [tag_name: string]: [tag_value: string];
        };
        last_analysis_date: number;
        last_analysis_results: {
            [name: string]: {
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
            [key: string]: string;
        };
        last_http_response_headers: {
            string: string;
            [key: string]: string;
        };
        last_modification_date: number;
        last_submission_date: number;
        outgoing_links: [string];
        redirection_chain: [string];
        reputation: number;
        tags: string[];
        targeted_brand: {
            [engine_name: string]: string;
        };
        times_submitted: number;
        title: string;
        total_votes: {
            harmless: number;
            malicious: number;
        };
        trackers: {
            [tracker_name: string]: {
                id: string;
                timestamp: number;
                url: string;
            }[];
        };
        url: string;
    };
    id: string;
    links: {
        self: string;
    };
    type: 'url';
}

interface Settings {
    downloads: boolean;
    apikey: string;
    imageChcek: boolean
}
