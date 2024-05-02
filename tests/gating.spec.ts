/* eslint-disable mocha/handle-done-callback */
import test from "node:test";

import { UX_MODE_TYPE } from "@toruslabs/customauth";
import * as TssLib from "@toruslabs/tss-lib-node";

import { COREKIT_STATUS, WEB3AUTH_NETWORK, WEB3AUTH_NETWORK_TYPE, Web3AuthMPCCoreKit } from "../src";
import { criticalResetAccount, mockLogin } from "./setup";

type TestVariable = {
  description: string;
  web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
  web3ClientID: string;
  uxMode: UX_MODE_TYPE | "nodejs";
  manualSync?: boolean;
  email: string;
  expectedErrorThrown: boolean;
};

const defaultTestEmail = "testEmail1";
const variable: TestVariable[] = [
  {
    description: "should not be gated when on devnet",
    web3AuthNetwork: WEB3AUTH_NETWORK.DEVNET,
    uxMode: "nodejs",
    email: defaultTestEmail,
    web3ClientID: "torus-key-test",
    expectedErrorThrown: false,
  },
  {
    description: "should be gated and pass when on mainnet with client id on enterprise plan",
    web3AuthNetwork: WEB3AUTH_NETWORK.MAINNET,
    uxMode: "nodejs",
    email: defaultTestEmail,
    web3ClientID: "BJ57yveG_XBLqZUpjtJCnJMrord0AaXpd_9OSy4HzkxpnpPn6Co73h-vR6GEI1VogtW4yMHq13GNPKmVpliFXY0",
    expectedErrorThrown: false,
  },
  {
    description: "should be gated and throw an error when on mainnet with client id on growth plan",
    web3AuthNetwork: WEB3AUTH_NETWORK.MAINNET,
    uxMode: "nodejs",
    email: defaultTestEmail,
    web3ClientID: "BCriFlI9ihm81N-bc7x6N-xbqwBLuxfRDMmSH87spKH27QTNOPj1W9s2K3-mp9NzXuaRiqxvAGHyuGlXG5wLD1g",
    expectedErrorThrown: true,
  },
];

variable.forEach((testVariable) => {
  const { web3AuthNetwork, uxMode, manualSync, email, web3ClientID: web3AuthClientId, expectedErrorThrown } = testVariable;
  const coreKitInstance = new Web3AuthMPCCoreKit({
    web3AuthClientId,
    web3AuthNetwork,
    baseUrl: "http://localhost:3000",
    uxMode,
    tssLib: TssLib,
    storageKey: "memory",
    manualSync,
  });

  const testNameSuffix = testVariable.description;
  test(`#Gating test :  ${testNameSuffix}`, async (t) => {
    t.before(async function () {
      if (coreKitInstance.status === COREKIT_STATUS.INITIALIZED) await criticalResetAccount(coreKitInstance);
    });

    t.after(async function () {
      // after all test tear down
    });

    await t.test("#Login ", async function () {
      // mocklogin
      const { idToken, parsedToken } = await mockLogin(email);

      try {
        await coreKitInstance.init({ handleRedirectResult: false });
      } catch (error) {
        if (!expectedErrorThrown) {
          // Unexpected error
          throw error;
        }
      }
      try {
        await coreKitInstance.loginWithJWT({
          verifier: "torus-test-health",
          verifierId: parsedToken.email,
          idToken,
        });
      } catch (error) {
        if (expectedErrorThrown) {
          // If we expect an error, check the error message to see if it is the expected error
          if (
            !((error as Error).message as string).includes(
              "The MPC Core Kit is not initialized. Please ensure you call the 'init()' method to initialize the kit properly before attempting any operations."
            )
          ) {
            throw error;
          }
        }
      }
    });
  });
});
