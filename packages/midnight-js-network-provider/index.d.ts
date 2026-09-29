export interface NetworkProvider {
  indexer: string;
  indexerWS?: string;
  node?: string;
  proofServer?: string;
  networkId?: string;
}

export declare function indexerNetworkProvider(indexerUrl: string, indexerWsUrl?: string): any;
export declare function createNetworkProvider(networkId: string, options?: any): NetworkProvider;
