import { useCallback } from 'react';
import { userApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function useAccountProfile() {
  const { clearSession, updateUser } = useAuth();

  const saveProfile = useCallback(
    async (payload) => {
      const user = await userApi.updateMe(payload);
      updateUser(user);
      return user;
    },
    [updateUser],
  );

  const saveSettings = useCallback(
    async (payload) => {
      const user = await userApi.updateMe(payload);
      updateUser(user);
      return user;
    },
    [updateUser],
  );

  const uploadProfilePhoto = useCallback(
    async (file) => {
      const user = await userApi.uploadPhoto(file);
      updateUser(user);
      return user;
    },
    [updateUser],
  );

  const changeEmail = useCallback(
    async (payload) => {
      const result = await userApi.changeEmail(payload);
      updateUser(result.user);
      return result.message;
    },
    [updateUser],
  );

  const changePassword = useCallback(
    async (payload) => {
      const result = await userApi.changePassword(payload);
      clearSession();
      return result.message;
    },
    [clearSession],
  );

  return {
    changeEmail,
    changePassword,
    saveProfile,
    saveSettings,
    uploadProfilePhoto,
  };
}
