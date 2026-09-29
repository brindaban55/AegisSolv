import type { DAppConnectorAPI, DAppConnectorWalletAPI, InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { indexerNetworkProvider } from '@midnight-ntwrk/midnight-js-network-provider';
import { type SupportedNetwork, getNetworkConfig } from './networkConfig';

export type WalletProviderType = '1am' | 'lace' | 'injected' | 'demo';

export interface WalletAccountState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  dustBalance: string | null;
  provider: WalletProviderType | null;
  error: string | null;
}

export interface DiscoveredWallet {
  id: string;
  name: string;
  icon?: string;
  apiVersion?: string;
}

export interface ConnectedWalletSession {
  address: string;
  connectedApi: ConnectedAPI | DAppConnectorWalletAPI | any;
  networkProvider: any;
}

/**
 * Discover all Midnight wallets injected into window.midnight via official DAppConnectorAPI
 */
export function discoverMidnightWallets(): DiscoveredWallet[] {
  if (typeof window === 'undefined') return [];
  const midnight: (DAppConnectorAPI & Record<string, InitialAPI>) | undefined = window.midnight as any;
  if (!midnight || typeof midnight !== 'object') return [];

  const found: DiscoveredWallet[] = [];
  for (const key of Object.keys(midnight)) {
    const item = (midnight as Record<string, any>)[key];
    if (item && typeof item === 'object') {
      found.push({
        id: key,
        name: item.name || key,
        icon: item.icon,
        apiVersion: item.apiVersion,
      });
    }
  }
  return found;
}

/**
 * Resilient multi-method address extraction cascade supporting
 * modern v4 APIs and legacy v3 APIs without throwing "api.state is not a function"
 */
export async function extractAddressFromApi(api: any): Promise<string> {
  if (!api) return '';

  // 1. Modern v4 Unshielded Address
  try {
    if (typeof api.getUnshieldedAddress === 'function') {
      const res = await api.getUnshieldedAddress();
      if (res?.unshieldedAddress) return res.unshieldedAddress;
      if (typeof res === 'string') return res;
    }
  } catch (e) {
    // Continue to next probe
  }

  // 2. Modern v4 Shielded Addresses
  try {
    if (typeof api.getShieldedAddresses === 'function') {
      const res = await api.getShieldedAddresses();
      if (Array.isArray(res) && res.length > 0) return res[0];
      if (res?.shieldedAddress) return res.shieldedAddress;
    }
  } catch (e) {
    // Continue
  }

  // 3. Modern v4 Fee / Dust Address
  try {
    if (typeof api.getDustAddress === 'function') {
      const res = await api.getDustAddress();
      if (res?.dustAddress) return res.dustAddress;
      if (typeof res === 'string') return res;
    }
  } catch (e) {
    // Continue
  }

  // 4. Legacy v3 Fallback (.state())
  try {
    if (typeof api.state === 'function') {
      const res = await api.state();
      if (res?.address) return res.address;
    }
  } catch (e) {
    // Continue
  }

  if (api.address && typeof api.address === 'string') {
    return api.address;
  }

  return '';
}

/**
 * Connect to user's selected wallet extension on Midnight Preview or Preprod
 * using official @midnight-ntwrk/dapp-connector-api and @midnight-ntwrk/midnight-js-network-provider
 */
export async function connectWalletProvider(
  providerType: WalletProviderType,
  networkId: SupportedNetwork = 'preview'
): Promise<ConnectedWalletSession> {
  const netConfig = getNetworkConfig(networkId);
  const netProvider = indexerNetworkProvider(netConfig.indexerUrl, netConfig.indexerWsUrl);

  if (providerType === 'demo') {
    // Instant Read-Only Public Explorer Mode (zero extension / zero docker required)
    const demoAddr = netConfig.demoAddress;
    return {
      address: demoAddr,
      connectedApi: {
        isReadOnly: true,
        getUnshieldedAddress: async () => ({
          unshieldedAddress: demoAddr,
        }),
      },
      networkProvider: netProvider,
    };
  }

  const midnight = window.midnight as (DAppConnectorAPI & Record<string, InitialAPI>) | undefined;
  if (!midnight) {
    throw new Error('No Midnight-compatible wallet extension detected. Please install 1AM Wallet or Lace.');
  }

  let walletConnector: InitialAPI | any = null;

  if (providerType === '1am') {
    walletConnector = (midnight as any)['1am'] || (midnight as any)['mn1am'] || (midnight as any)[Object.keys(midnight)[0]];
  } else if (providerType === 'lace') {
    walletConnector = (midnight as any)['mnLace'] || (midnight as any)['lace'] || (midnight as any)[Object.keys(midnight)[0]];
  } else {
    // Injected: pick first available
    const keys = Object.keys(midnight);
    if (keys.length > 0) walletConnector = (midnight as any)[keys[0]];
  }

  if (!walletConnector) {
    throw new Error(`Wallet provider "${providerType}" not found in browser extension registry.`);
  }

  // Request connection popup from wallet with requested networkId
  const connectedApi: ConnectedAPI = typeof walletConnector.connect === 'function'
    ? await walletConnector.connect(networkId)
    : (typeof (walletConnector as any).enable === 'function' ? await (walletConnector as any).enable() : walletConnector);

  const address = await extractAddressFromApi(connectedApi);
  if (!address) {
    throw new Error('Wallet connected, but could not resolve account address.');
  }

  // Strict Network Verification: Address must match current active network prefix
  if (!address.startsWith(netConfig.addressPrefix)) {
    const detectedNet = address.startsWith('mn_addr_preview') ? 'Midnight Preview' : (address.startsWith('mn_addr_preprod') ? 'Midnight Preprod' : 'Unknown Network');
    throw new Error(`Network Mismatch: Your wallet is currently on ${detectedNet} (${address.slice(0, 15)}...), but AegisSolv is active on ${netConfig.networkName}. Please switch your 1AM or Lace wallet extension to ${netConfig.networkName} and try again.`);
  }

  return { address, connectedApi, networkProvider: netProvider };
}
