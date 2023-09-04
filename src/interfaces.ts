import { KeyDetails, Point, ShareStore } from "@tkey-mpc/common-types";
import ThresholdKey from "@tkey-mpc/core";
import type { AGGREGATE_VERIFIER_TYPE, LoginWindowResponse, SubVerifierDetails, TorusVerifierResponse, UX_MODE_TYPE } from "@toruslabs/customauth";
import { CustomChainConfig, SafeEventEmitterProvider } from "@web3auth/base";
import BN from "bn.js";

import { FactorKeyTypeShareDescription, ShareType, USER_PATH, WEB3AUTH_NETWORK } from "./constants";

export interface IStorage {
  getItem(key: string): string;
  setItem(key: string, value: string): void;
}

export interface BaseLoginParams {
  // offset in seconds
  serverTimeOffset?: number;
}

export interface SubVerifierDetailsParams extends BaseLoginParams {
  subVerifierDetails: SubVerifierDetails;
}

export interface AggregateVerifierLoginParams extends BaseLoginParams {
  aggregateVerifierIdentifier?: string;
  aggregateVerifierType?: AGGREGATE_VERIFIER_TYPE;
  subVerifierDetailsArray?: SubVerifierDetails[];
}

export type LoginParams = SubVerifierDetailsParams | AggregateVerifierLoginParams;
export type UserInfo = TorusVerifierResponse & LoginWindowResponse;

// TODO extend interface and type documentation wherever necessary. @Yash
export interface ICoreKit {
  /** The tKey instance, if initialized. */
  tKey: ThresholdKey | undefined;

  // TODO document errors across all interface methods! maybe even define error
  // codes and document which are thrown. in particular here, error is thrown if
  // not factor key is given (either as function parameter or through local
  // storage)
  // TODO login with id token @Yash
  /**
   * Login to tKey and initialize all relevant components.
   * @param loginParams - TKey login parameters.
   * @returns A Web3 provider if we are not in redirect mode.
   */
  login(loginParams: LoginParams, factorKey?: BN): Promise<SafeEventEmitterProvider | null>;

  /**
   * Handle redirect result after login.
   * @param factorKey - An optional factor key to use at initialization.
   * @returns A Web3 provider.
   */
  handleRedirectResult(factorKey?: BN): Promise<SafeEventEmitterProvider>;

  /**
   * Indicates whether there is an existing session that can be resumed.
   */
  isResumable(): boolean;

  /**
   * Resumes an existing session.
   * @returns A Web3 Provider.
   */
  resumeSession(): Promise<SafeEventEmitterProvider>;

  /**
   * User logout.
   */
  logout(): Promise<void>;

  /**
   * Creates a new factor for authentication.
   * @param factorKey - The factor key.
   * @param shareType - The share type.
   * @param shareDescription - The share description.
   * @param additionalMetadata - Additional metadata.
   * @returns A promise that resolves to the factor key.
   */
  createFactor(
    factorKey: BN,
    shareType?: ShareType,
    shareDescription?: FactorKeyTypeShareDescription,
    additionalMetadata?: Record<string, string>
  ): Promise<void>;

  // TODO throw error if we would go below threshold! @Himanshu, @CW
  /**
   * Deletes the factor identified by the given public key, including all
   * associated metadata.
   * @param factorPub - The public key of the factor to delete.
   */
  deleteFactor(factorPub: Point): Promise<void>;

  /**
   * Generates a new factor key.
   * @returns The freshly generated factor key and the corresponding public key.
   */
  generateFactorKey(): { private: BN; pub: Point };

  /**
   * Get user information.
   */
  getUserInfo(): UserInfo;

  /**
   * Get key information.
   */
  getKeyDetails(): KeyDetails & { tssIndex: number };

  /**
   * Commit the changes made to the user's account when in manual sync mode.
   */
  commitChanges(): Promise<void>;

  // TODO Himanshu: remove function here? instead use tkey function if we need it for demo.
  /**
   * WARNING: Use with caution.
   *
   * Resets the user's account. All funds will be lost.
   */
  CRITICAL_resetAccount(): Promise<void>;

  // TODO add function for "import tss key share"
}

export type WEB3AUTH_NETWORK_TYPE = (typeof WEB3AUTH_NETWORK)[keyof typeof WEB3AUTH_NETWORK];

export type USER_PATH_TYPE = (typeof USER_PATH)[keyof typeof USER_PATH];

export interface Web3AuthOptions {
  web3AuthClientId: string;

  chainConfig?: CustomChainConfig;

  /**
   * @defaultValue `false`
   */
  manualSync?: boolean;

  /**
   * @defaultValue `${window.location.origin}/serviceworker`
   */
  baseUrl?: string;

  /**
   *
   * @defaultValue `'sapphire_mainner'`
   */
  web3AuthNetwork?: WEB3AUTH_NETWORK_TYPE;

  /**
   *
   * @defaultValue `'local'`
   */
  storageKey?: "session" | "local";

  /**
   * @defaultValue 86400
   */
  sessionTime?: number;

  /**
   * @defaultValue `'POPUP'`
   */
  uxMode?: UX_MODE_TYPE;

  /**
   * @defaultValue `false`
   * enables logging of the internal packages.
   */
  enableLogging?: boolean;
}

export interface Web3AuthState {
  oAuthKey?: string;
  signatures?: string[];
  userInfo?: UserInfo;
  tssNonce?: number;
  tssShare?: BN;
  tssShareIndex?: number;
  tssPubKey?: Buffer;
  factorKey?: BN;
  tssNodeEndpoints?: string[];
}

export type FactorKeyCloudMetadata = {
  share: ShareStore;
  tssShare: BN;
  tssIndex: number;
};

export interface SessionData {
  oAuthKey: string;
  factorKey: string;
  tssNonce: number;
  tssShare: string;
  tssShareIndex: number;
  tssPubKey: string;
  signatures: string[];
  userInfo: UserInfo;
}

export interface TkeyLocalStoreData {
  factorKey: string;
}
