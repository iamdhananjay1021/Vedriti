import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'vedrit.session.token';

let cachedToken: string | null = null;

export const session = {
  async load(): Promise<string | null> {
    try {
      cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      cachedToken = null;
    }
    return cachedToken;
  },
  get(): string | null {
    return cachedToken;
  },
  async set(token: string): Promise<void> {
    cachedToken = token;
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch {}
  },
  async clear(): Promise<void> {
    cachedToken = null;
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {}
  },
};
