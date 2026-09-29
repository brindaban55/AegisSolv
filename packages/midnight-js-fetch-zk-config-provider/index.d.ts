export declare class FetchZkConfigProvider {
  basePath: string;
  constructor(basePath?: string);
  getZkConfig(circuitId: string): Promise<ArrayBuffer | Uint8Array>;
}

export declare function fetchZkConfigProvider(basePath?: string): FetchZkConfigProvider;
