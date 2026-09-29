import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getCreditScore(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getAnnualIncome(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getDebtToIncomeRatioBps(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getCollateralRatioBps(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getApplicantSecretSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  verifyCreditPassport(context: __compactRuntime.CircuitContext<PS>,
                       expectedCommitment_0: Uint8Array,
                       currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  verifyCustomPolicy(context: __compactRuntime.CircuitContext<PS>,
                     expectedCommitment_0: Uint8Array,
                     reqMinScore_0: bigint,
                     reqMinIncome_0: bigint,
                     reqMaxDtiBps_0: bigint,
                     reqMinCollateralBps_0: bigint,
                     customPolicyId_0: bigint,
                     currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  updatePolicy(context: __compactRuntime.CircuitContext<PS>,
               newMinScore_0: bigint,
               newMinIncome_0: bigint,
               newMaxDtiBps_0: bigint,
               newMinCollateralBps_0: bigint,
               newPolicyId_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  verifyCreditPassport(context: __compactRuntime.CircuitContext<PS>,
                       expectedCommitment_0: Uint8Array,
                       currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  verifyCustomPolicy(context: __compactRuntime.CircuitContext<PS>,
                     expectedCommitment_0: Uint8Array,
                     reqMinScore_0: bigint,
                     reqMinIncome_0: bigint,
                     reqMaxDtiBps_0: bigint,
                     reqMinCollateralBps_0: bigint,
                     customPolicyId_0: bigint,
                     currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  updatePolicy(context: __compactRuntime.CircuitContext<PS>,
               newMinScore_0: bigint,
               newMinIncome_0: bigint,
               newMaxDtiBps_0: bigint,
               newMinCollateralBps_0: bigint,
               newPolicyId_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  verifyCreditPassport(context: __compactRuntime.CircuitContext<PS>,
                       expectedCommitment_0: Uint8Array,
                       currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  verifyCustomPolicy(context: __compactRuntime.CircuitContext<PS>,
                     expectedCommitment_0: Uint8Array,
                     reqMinScore_0: bigint,
                     reqMinIncome_0: bigint,
                     reqMaxDtiBps_0: bigint,
                     reqMinCollateralBps_0: bigint,
                     customPolicyId_0: bigint,
                     currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  updatePolicy(context: __compactRuntime.CircuitContext<PS>,
               newMinScore_0: bigint,
               newMinIncome_0: bigint,
               newMaxDtiBps_0: bigint,
               newMinCollateralBps_0: bigint,
               newPolicyId_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  readonly minCreditScore: bigint;
  readonly minAnnualIncome: bigint;
  readonly maxDebtToIncomeRatioBps: bigint;
  readonly minCollateralRatioBps: bigint;
  readonly verificationCount: bigint;
  readonly lastVerifiedTimestamp: bigint;
  readonly lastVerifiedRiskTier: bigint;
  readonly lastVerificationResult: boolean;
  readonly activePolicyId: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
