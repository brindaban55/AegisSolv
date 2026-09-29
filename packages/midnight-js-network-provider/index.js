export function indexerNetworkProvider(indexerUrl, indexerWsUrl) {
  return {
    indexer: indexerUrl,
    indexerWS: indexerWsUrl || (indexerUrl ? indexerUrl.replace(/^http/, 'ws') : ''),
  };
}

export function createNetworkProvider(networkId, options = {}) {
  return {
    networkId,
    ...options,
  };
}
