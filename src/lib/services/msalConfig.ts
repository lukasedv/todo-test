import type { Configuration, PopupRequest } from '@azure/msal-browser';

const MSAL_CLIENT_ID = import.meta.env.VITE_MSAL_CLIENT_ID ?? '';
const MSAL_AUTHORITY = import.meta.env.VITE_MSAL_AUTHORITY ?? 'https://login.microsoftonline.com/common';
const MSAL_REDIRECT_URI = import.meta.env.VITE_MSAL_REDIRECT_URI ?? `${window.location.origin}/auth/callback`;

export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: MSAL_AUTHORITY,
    redirectUri: MSAL_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['Mail.Read', 'Mail.ReadBasic', 'User.Read'],
};

export const graphScopes = {
  mail: ['Mail.Read'],
  user: ['User.Read'],
  tasks: ['Tasks.Read'],
};
