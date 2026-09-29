/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK?: string;
  readonly VITE_INDEXER_URL?: string;
  readonly VITE_INDEXER_WS_URL?: string;
  readonly VITE_NODE_URL?: string;
  readonly VITE_PROOF_SERVER?: string;
  readonly VITE_EXPLORER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@midnight-ntwrk/dapp-connector-api' {
  export type {
    InitialAPI,
    ConnectedAPI,
    WalletConnectedAPI,
    HintUsage,
    Configuration,
    ExecutionStatus,
    TxStatus,
    HistoryEntry,
    DesiredOutput,
    DesiredInput,
    TokenType,
    SignDataOptions,
    Signature,
    ConnectionStatus,
    KeyMaterialProvider,
    ProvingProvider,
  } from '@midnight-ntwrk/dapp-connector-api/dist/api';

  export type DAppConnectorAPI = Record<string, import('@midnight-ntwrk/dapp-connector-api/dist/api').InitialAPI>;
  export type DAppConnectorWalletAPI = import('@midnight-ntwrk/dapp-connector-api/dist/api').ConnectedAPI;
}

declare module '@midnight-ntwrk/midnight-js-network-provider' {
  export interface NetworkProvider {
    indexer: string;
    indexerWS?: string;
    node?: string;
    proofServer?: string;
    networkId?: string;
  }
  export function indexerNetworkProvider(indexerUrl: string, indexerWsUrl?: string): any;
  export function createNetworkProvider(networkId: string, options?: any): NetworkProvider;
}

declare module '@midnight-ntwrk/midnight-js-fetch-zk-config-provider' {
  export class FetchZkConfigProvider {
    constructor(basePath: string);
    getZkConfig(circuitId: string): Promise<any>;
  }
  export function fetchZkConfigProvider(basePath: string): FetchZkConfigProvider;
}
