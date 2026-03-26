import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest } from './msalConfig.js';

let msalInstance: PublicClientApplication | null = null;

async function getMsalInstance(): Promise<PublicClientApplication> {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }
  return msalInstance;
}

export async function login(): Promise<AuthenticationResult> {
  const instance = await getMsalInstance();
  return instance.loginPopup(loginRequest);
}

export async function logout(): Promise<void> {
  const instance = await getMsalInstance();
  const account = getAccount();
  if (account) {
    await instance.logoutPopup({ account });
  }
  msalInstance = null;
}

export function getAccount(): AccountInfo | null {
  if (!msalInstance) return null;
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

export async function getAccessToken(scopes: string[]): Promise<string> {
  const instance = await getMsalInstance();
  const account = getAccount();
  if (!account) {
    throw new Error('No active account. Please sign in first.');
  }
  try {
    const response = await instance.acquireTokenSilent({ scopes, account });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const response = await instance.acquireTokenPopup({ scopes });
      return response.accessToken;
    }
    throw error;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const instance = await getMsalInstance();
    return instance.getAllAccounts().length > 0;
  } catch {
    return false;
  }
}
