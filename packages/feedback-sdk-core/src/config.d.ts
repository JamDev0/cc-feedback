export interface FeedbackClientConfig {
    endpointUrl: string;
    sdkVersion: string;
    appVersion?: string;
    requestTimeoutMs?: number;
}
export declare const defaultConfig: Pick<FeedbackClientConfig, "requestTimeoutMs" | "sdkVersion">;
//# sourceMappingURL=config.d.ts.map