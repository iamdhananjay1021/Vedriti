import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useAuth } from '../context/AuthContext';

const AVATAR_SIZE = 512;

export const useAvatarPicker = () => {
  const { user, uploadAvatar, removeAvatar } = useAuth();
  const [busy, setBusy] = useState(false);

  const pick = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled || !result.assets?.[0]) return;
      setBusy(true);
      const context = ImageManipulator.manipulate(result.assets[0].uri);
      context.resize({ width: AVATAR_SIZE });
      const image = await context.renderAsync();
      const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
      const blob = await (await fetch(saved.uri)).blob();
      await uploadAvatar(blob);
    } catch (e) {
      Alert.alert('Could not update photo', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }, [uploadAvatar]);

  const remove = useCallback(async () => {
    setBusy(true);
    try {
      await removeAvatar();
    } catch (e) {
      Alert.alert('Could not remove photo', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }, [removeAvatar]);

  const openMenu = useCallback(() => {
    Alert.alert('Profile photo', undefined, [
      { text: 'Choose from gallery', onPress: pick },
      ...(user?.avatarUrl ? [{ text: 'Remove photo', style: 'destructive' as const, onPress: remove }] : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }, [pick, remove, user?.avatarUrl]);

  return { busy, openMenu };
};
