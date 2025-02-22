import { useEffect, useState } from "react";
import {
  COREKIT_STATUS,
  makeEthereumSigner,
  AggregateVerifierLoginParams,
} from "@guru_test/mpc-core-kit";

import Web3 from "web3";
import { CHAIN_NAMESPACES, CustomChainConfig, IProvider } from "@web3auth/base";
import { EthereumSigningProvider } from "@web3auth/ethereum-mpc-provider";
import { KeyType } from "@tkey/common-types";

import bowser from "bowser";

import "./App.css";
import { LoginCard } from "./components/LoginCard";
import HomePage from "./page/Home";
import { useCoreKit } from "./composibles/useCoreKit";
import { ec } from "elliptic";
import crypto from "crypto";
import base32 from "hi-base32";
import { useNavigate } from "react-router-dom";
import Loader from "./components/Loader";
export const getEcCrypto = () => {
  return new ec("secp256k1");
};

export const generateSecretKey = (): string => {
  const randomBytes = crypto.randomBytes(20);
  return base32.encode(randomBytes).toString().replace(/=/g, "");
};

const PASSKEYS_ALLOWED_MAP = [bowser.OS_MAP.iOS, bowser.OS_MAP.MacOS, bowser.OS_MAP.Android, bowser.OS_MAP.Windows];

const getWindowsVersion = (osVersion: string) => {
  const windowsVersionRegex = /NT (\d+\.\d+)/;
  const match = osVersion.match(windowsVersionRegex);
  if (match) return parseInt(match[1], 10);
  return 0;
};

const checkIfOSIsSupported = (osName: string, osVersion: string) => {
  if (!PASSKEYS_ALLOWED_MAP.includes(osName)) return false;
  if (osName === bowser.OS_MAP.MacOS) return true;
  switch (osName) {
    case bowser.OS_MAP.iOS: {
      const version = parseInt(osVersion.split(".")[0], 10);
      return version >= 16;
    }
    case bowser.OS_MAP.Android: {
      const version = parseInt(osVersion.split(".")[0], 10);
      return version >= 9;
    }
    case bowser.OS_MAP.Windows: {
      const version = getWindowsVersion(osVersion);
      return version >= 10;
    }
    default:
      return false;
  }
};

export function shouldSupportPasskey(): { isBrowserSupported: boolean; isOsSupported: boolean; supportedBrowser?: Record<string, string> } {
  const browser = bowser.getParser(navigator.userAgent);
  const osDetails = browser.parseOS();
  if (!osDetails) return { isBrowserSupported: false, isOsSupported: false };
  const osName = osDetails.name || "";
  const result = checkIfOSIsSupported(osName, osDetails.version || "");
  if (!result) return { isBrowserSupported: false, isOsSupported: false };
  const browserData: Record<string, Record<string, string>> = {
    iOS: {
      safari: ">=16",
      chrome: ">=108",
    },
    macOS: {
      safari: ">=16",
      chrome: ">=108",
      firefox: ">=122",
    },
    Android: {
      chrome: ">=108",
    },
    Windows: {
      edge: ">=108",
      chrome: ">=108",
    },
  };
  const isBrowserSupported = browser.satisfies({ ...browserData }) || false;
  return { isBrowserSupported, isOsSupported: true, supportedBrowser: browserData[osName] };
}
const uiConsole = (...args: any[]): void => {
  const el = document.querySelector("#console>p");
  if (el) {
    el.innerHTML = JSON.stringify(args || {}, null, 2);
  }
  console.log(...args);
};


export const DEFAULT_CHAIN_CONFIG: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x66eee", // Arbitrum Sepolia chain ID
  rpcTarget: "https://sepolia-rollup.arbitrum.io/rpc",
  displayName: "Arbitrum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.arbiscan.io", // Arbitrum Sepolia block explorer URL
  ticker: "ETH",
  tickerName: "Ethereum",
  decimals: 18,
};

function App() {
  const { coreKitInstance, setCoreKitInstance, coreKitStatus, setCoreKitStatus, setProvider, setUserInfo, globalLoading, getShareDescriptions, provider, setWeb3 } = useCoreKit();

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  async function setupProvider(chainConfig?: CustomChainConfig) {
    if (coreKitInstance.keyType !== KeyType.secp256k1) {
      console.warn(`Ethereum requires keytype ${KeyType.secp256k1}, skipping provider setup`);
      return;
    }
    let localProvider = new EthereumSigningProvider({ config: { chainConfig: chainConfig || DEFAULT_CHAIN_CONFIG } });
    localProvider.setupProvider(makeEthereumSigner(coreKitInstance));
    setProvider(localProvider);
  }

  // decide whether to rehydrate session
  const init = async () => {
    // Example config to handle redirect result manually
    setIsLoading(true);
    if (coreKitInstance.status === COREKIT_STATUS.NOT_INITIALIZED) {
      await coreKitInstance.init({ rehydrate: true, handleRedirectResult: true });
      setCoreKitInstance(coreKitInstance);
      setIsLoading(false);
    }
    await setupProviderPostLogin();

    if (coreKitInstance.status === COREKIT_STATUS.REQUIRED_SHARE) {
      navigate("/recovery");
      uiConsole(
        "required more shares, please enter your backup/ device factor key, or reset account unrecoverable once reset, please use it with caution]"
      );
    }
    console.log("coreKitInstance.status", coreKitInstance.status);
    setCoreKitStatus(coreKitInstance.status);
  };

  const setupProviderPostLogin = async () => {
    if (coreKitInstance.status === COREKIT_STATUS.LOGGED_IN) {
      await setupProvider();
      setUserInformation();
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const checkForRecoveryInitiation = async () => {
      if (coreKitInstance.status === COREKIT_STATUS.REQUIRED_SHARE) {
        navigate("/recovery");
        uiConsole(
          "required more shares, please enter your backup/ device factor key, or reset account unrecoverable once reset, please use it with caution]"
        );
      }
    }
    checkForRecoveryInitiation();
    setupProviderPostLogin();
  }, [coreKitStatus])

  useEffect(() => {
    if (coreKitInstance.status === COREKIT_STATUS.NOT_INITIALIZED) {
      init();
    }
  }, [coreKitInstance]);

  useEffect(() => {
    if (provider) {
      const web3 = new Web3(provider as IProvider);
      setWeb3(web3);
    }
  }, [provider]);


  const login = async () => {
    try {
      setIsLoading(true);
      // Triggering Login using Service Provider ==> opens the popup
      if (!coreKitInstance) {
        throw new Error("initiated to login");
      }
      const verifierConfig = {
        subVerifierDetails: {
          typeOfLogin: "google",
          verifier: "w3-google-dev",
          // verifier: "w3-google-temp",
          clientId: "759944447575-6rm643ia1i9ngmnme3eq5viiep5rp6s0.apps.googleusercontent.com",
          jwtParams: {
            verifierIdField: "email",
          },
        },
      };
      // const verifierConfig = {
      //   aggregateVerifierIdentifier: "web-aggregate-core-kit",
      //   subVerifierDetailsArray: [
      //     {
      //       typeOfLogin: "google",
      //       verifier: "w3-google-temp",
      //       clientId: "759944447575-6rm643ia1i9ngmnme3eq5viiep5rp6s0.apps.googleusercontent.com",
      //     },
      //   ],
      // };

      await coreKitInstance.loginWithOAuth(verifierConfig as any);
      if (coreKitInstance.status === COREKIT_STATUS.LOGGED_IN) {
        await coreKitInstance.commitChanges(); // Needed for new accounts
      }
      setCoreKitStatus(coreKitInstance.status);
      setUserInformation();
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithAuth0EmailPasswordless = async (loginHint: string) => {
    try {
      setIsLoading(true);
      if (!coreKitInstance) {
        throw new Error("initiated to login");
      }

      // IMP START - Login
      // const verifierConfig = {
      //   subVerifierDetails: 
      //     {
      //       typeOfLogin: "jwt",
      //       verifier: "w3a-a0-email-passwordless",
      //       clientId: "QiEf8qZ9IoasbZsbHvjKZku4LdnRC1Ct",
      //       jwtParams: {
      //         // connection: "passwordless",
      //         domain: "https://web3auth.au.auth0.com",
      //         verifierIdField: "email",
      //       },
      //     },
      // };
      const verifierConfig = {
        subVerifierDetails: 
          {
            typeOfLogin: "email_passwordless",
            verifier: "w3a-email-passwordless-demo",
            clientId: "BHgArYmWwSeq21czpcarYh0EVq2WWOzflX-NTK-tY1-1pauPzHKRRLgpABkmYiIV_og9jAvoIxQ8L3Smrwe04Lw",
            jwtParams: {
              // connection: "password
              login_hint: loginHint.trim(),
            }
          },
      };

      await coreKitInstance.loginWithOAuth(verifierConfig as any);
      // IMP END - Login
      if (coreKitInstance.status === COREKIT_STATUS.LOGGED_IN) {
        await coreKitInstance.commitChanges(); // Needed for new accounts
      }
      setCoreKitStatus(coreKitInstance.status);
      setUserInformation();
    } catch (error: unknown) {
      uiConsole(error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserInformation = () => {
    const userInfo = coreKitInstance.getUserInfo();
    setUserInfo(userInfo);
    getShareDescriptions();
  }
  return (
    <div className="container bg-app-gray-100 dark:bg-app-gray-900">
      {/* {JSON.stringify(isLoading)} {coreKitInstance.status} */}
      {isLoading || globalLoading ? (
        <>
          <div className="h-full flex-grow flex flex-col items-center justify-center">
            <Loader size={"lg"} showLogo={true} />
          </div>
        </>
      ) : (
        <>
          {
            coreKitStatus === COREKIT_STATUS.LOGGED_IN ? (
              <HomePage />
            ) : (
              <>
                <LoginCard handleEmailPasswordLess={loginWithAuth0EmailPasswordless} handleSocialLogin={login} />
              </>
            )
          }
        </>
      )}
    </div>
  );
}

export default App;
