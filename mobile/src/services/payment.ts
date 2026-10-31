import * as WebBrowser from 'expo-web-browser';
import { api, PaymentRefType } from './api';

const RETURN_URL = 'vedrit://payment';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function openPayment(url: string, type: PaymentRefType, reference: string): Promise<boolean> {
  try {
    await WebBrowser.openAuthSessionAsync(url, RETURN_URL);
  } catch {
    await WebBrowser.openBrowserAsync(url);
  }
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const status = await api.paymentStatus(type, reference);
      if (status.paymentStatus === 'PAID') return true;
    } catch {}
    await wait(1500);
  }
  return false;
}
