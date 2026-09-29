export class FetchZkConfigProvider {
  constructor(basePath = '/managed') {
    this.basePath = basePath;
  }
  async getZkConfig(circuitId) {
    try {
      const res = await fetch(`${this.basePath}/keys/${circuitId}.prover`);
      return await res.arrayBuffer();
    } catch {
      return new Uint8Array();
    }
  }
}

export function fetchZkConfigProvider(basePath) {
  return new FetchZkConfigProvider(basePath);
}
