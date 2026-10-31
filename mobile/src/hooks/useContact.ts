import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { useAppData } from '../context/AppDataContext';

const digitsOnly = (value?: string) => (value || '').replace(/\D/g, '');

const withCountryCode = (value?: string) => {
  const digits = digitsOnly(value);
  if (!digits) return '';
  return digits.length === 10 ? `91${digits}` : digits;
};

export const useContact = () => {
  const { settings } = useAppData();
  const phone = settings?.supportPhone || '';
  const whatsapp = settings?.whatsappNumber || phone;
  const email = settings?.supportEmail || 'support@vedrit.in';
  const panditName = settings?.panditName || 'Pandit Ji';

  const call = useCallback(() => {
    if (!digitsOnly(phone)) {
      Alert.alert('Contact', `Please email us at ${email}`);
      return;
    }
    Linking.openURL(`tel:+${withCountryCode(phone)}`).catch(() => Alert.alert('Call Pandit Ji', phone));
  }, [phone, email]);

  const chat = useCallback(
    (message: string) => {
      const number = withCountryCode(whatsapp);
      if (!number) {
        Alert.alert('Contact', `Please email us at ${email}`);
        return;
      }
      Linking.openURL(`https://wa.me/${number}?text=${encodeURIComponent(message)}`).catch(() =>
        Alert.alert('WhatsApp', `Message Pandit Ji at ${whatsapp}`)
      );
    },
    [whatsapp, email]
  );

  const mail = useCallback(() => {
    Linking.openURL(`mailto:${email}`).catch(() => Alert.alert('Email', email));
  }, [email]);

  return { phone, whatsapp, email, panditName, call, chat, mail };
};
