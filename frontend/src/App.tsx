import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, type AppTab } from './components/Navbar';
import { WalletModal } from './components/WalletModal';
import { MobileDrawer } from './components/MobileDrawer';
import { LandingHero } from './components/LandingHero';
import { BorrowerProver, type FinancialWitnessInputs } from './components/BorrowerProver';
import { ZKPipeline, type ProvingPhase } from './components/ZKPipeline';
import { VerifierLedger } from './components/VerifierLedger';
import { LoanQuoteEngine } from './components/LoanQuoteEngine';
import { LenderDashboard } from './components/LenderDashboard';
import { DualStateAudit } from './components/DualStateAudit';
import { CircuitDocs } from './components/CircuitDocs';
import { invokeVerifyCreditPassport, type VerificationOutcome } from './services/circuitService';
import { useWallet } from './hooks/useWallet';
import { useContractState } from './hooks/useContractState';
import { type SupportedNetwork, getNetworkConfig, getExplorerContractUrl } from './lib/networkConfig';
import { ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const [activeNetwork, setActiveNetwork] = useState<SupportedNetwork>('preview');
  const currentNetConfig = getNetworkConfig(activeNetwork);

  const {
    isConnected,
    isConnecting,
    address,
    connect,
    disconnect,
    error,
    telemetry,
    networkRevocationNotice,
    clearRevocationNotice,
    connectedApi,
  } = useWallet(activeNetwork);

  const { blockHeight: onChainBlockHeight, isDeployed } = useContractState(activeNetwork);

  const [activeTab, setActiveTab] = useState<AppTab>('borrower');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Prover & Verifier State
  const [provingPhase, setProvingPhase] = useState<ProvingPhase>('idle');
  const [provingElapsed, setProvingElapsed] = useState(0);
  const [verificationOutcome, setVerificationOutcome] = useState<VerificationOutcome | null>(null);
  const [verificationCount, setVerificationCount] = useState(482);

  const handleGenerateProof = async (inputs: FinancialWitnessInputs) => {
    setProvingPhase('witness');
    setProvingElapsed(0);
    setVerificationOutcome(null);

    const startTime = Date.now();
    const timer = setInterval(() => {
      setProvingElapsed(Date.now() - startTime);
    }, 50);

    try {
      // Execute authentic Midnight.js circuit invocation with Compact contract, proof provider & on-chain submit
      const outcome = await invokeVerifyCreditPassport(
        inputs,
        activeNetwork,
        connectedApi,
        (phase) => setProvingPhase(phase)
      );

      clearInterval(timer);
      setProvingElapsed(Date.now() - startTime);
      setVerificationOutcome(outcome);
      setVerificationCount((c) => c + 1);

      // Scroll down smoothly to Verifier state
      setTimeout(() => {
        document.getElementById('verifier-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    } catch (err: any) {
      clearInterval(timer);
      setProvingPhase('idle');
      alert(err.message || 'Circuit execution failed');
    }
  };

  // Always reset window scroll on tab change to prevent blank-screen viewport misalignment
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  return (
    <div className="min-h-screen relative bg-[#080B11] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300 overflow-x-hidden">
      {/* Full-bleed rich background visuals */}
      <div className="app-cinematic-bg" />
      <div className="app-cinematic-overlay" />
      <div className="ambient-glow-cyan" />
      <div className="ambient-glow-navy" />
      <div className="bg-noise-texture" />

      {/* Main App Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar with sliding active indicator & Dual Network Switcher */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isConnected={isConnected}
          address={address}
          activeNetwork={activeNetwork}
          onSelectNetwork={setActiveNetwork}
          onOpenWalletModal={() => setIsWalletModalOpen(true)}
          onDisconnect={disconnect}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          latencyMs={telemetry.latencyMs}
        />

        {/* Dynamic Network Revocation Alert Banner */}
        {networkRevocationNotice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 text-xs font-mono"
          >
            <div className="max-w-[1440px] w-[95%] mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                  REVOCATION NOTICE
                </span>
                <span>{networkRevocationNotice}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-100 font-semibold text-[11px] transition-colors"
                >
                  Reconnect on {getNetworkConfig(activeNetwork).badgeLabel}
                </button>
                <button
                  onClick={clearRevocationNotice}
                  className="p-1 rounded text-amber-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content Body */}
        <main className="flex-1">
          <div key={activeTab} className="min-h-full">
              {activeTab === 'borrower' && (
                <div className="min-h-[calc(100vh-14rem)]">
                  {/* Hero Banner with 3D Holographic Shield */}
                  <LandingHero
                    onConnectWallet={() => setIsWalletModalOpen(true)}
                    onExploreDemo={() => {
                      document.getElementById('prover-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    isConnected={isConnected}
                  />

                  {/* Main Interactive Flow */}
                  <div id="prover-section" className="max-w-[1440px] w-[95%] mx-auto py-10 space-y-8">
                    {/* Step 1: Borrower Client Prover (Top) */}
                    <BorrowerProver
                      onGenerateProof={handleGenerateProof}
                      isProving={provingPhase === 'witness' || provingPhase === 'circuit' || provingPhase === 'settlement'}
                      isConnected={isConnected}
                      onConnectWallet={() => setIsWalletModalOpen(true)}
                    />

                    {/* ZK Proving Pipeline Animation (Center) */}
                    <ZKPipeline phase={provingPhase} elapsedMs={provingElapsed} />

                    {/* Step 2: Verifier & Public Ledger Audit (Bottom) */}
                    <div id="verifier-section">
                      <VerifierLedger
                        outcome={verificationOutcome}
                        verificationCount={verificationCount}
                        onNavigateToLoans={() => setActiveTab('loans')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'loans' && (
                <div className="max-w-[1440px] w-[95%] mx-auto py-10 space-y-8 min-h-[calc(100vh-14rem)]">
                  <LoanQuoteEngine
                    verifiedOutcome={verificationOutcome}
                    onNavigateToProver={() => setActiveTab('borrower')}
                  />
                </div>
              )}

              {activeTab === 'lender' && (
                <div className="min-h-[calc(100vh-14rem)]">
                  <LenderDashboard />
                </div>
              )}
              {activeTab === 'architecture' && (
                <div className="min-h-[calc(100vh-14rem)]">
                  <DualStateAudit />
                </div>
              )}
              {activeTab === 'docs' && (
                <div className="min-h-[calc(100vh-14rem)]">
                  <CircuitDocs activeNetwork={activeNetwork} />
                </div>
              )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/5 py-8 bg-[#080B11]/90 backdrop-blur-md">
          <div className="max-w-[1440px] w-[95%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold font-sans">AegisSolv</span>
              <span>•</span>
              <span>Confidential Solvency & Institutional Private Credit Underwriting Gate on Midnight</span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href={getExplorerContractUrl(currentNetConfig.deployedContractAddress, activeNetwork)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <span>Contract on {currentNetConfig.badgeLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={currentNetConfig.faucetUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <span>{currentNetConfig.badgeLabel} Faucet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://midnight.network"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <span>Midnight Network</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </footer>

        {/* Modals & Drawers */}
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          onSelectProvider={(type) => {
            connect(type);
            setIsWalletModalOpen(false);
          }}
          isConnecting={isConnecting}
          error={error}
          activeNetwork={activeNetwork}
        />

        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isConnected={isConnected}
          address={address}
          activeNetwork={activeNetwork}
          onSelectNetwork={setActiveNetwork}
          onConnectWallet={() => setIsWalletModalOpen(true)}
          onDisconnect={disconnect}
          latencyMs={telemetry.latencyMs}
        />
      </div>
    </div>
  );
};
