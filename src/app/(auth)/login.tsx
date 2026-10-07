import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { authApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Button, ErrorMessage, TextField } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useAuth } from '@/store/auth';
import { typography } from '@/theme';
import { loginSchema, normalizePhone, isEmail, type LoginForm } from '@/utils/validation';

export default function LoginScreen() {
  const c = useColors();
  const t = useT();
  const setSession = useAuth((s) => s.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '' } });

  const onSubmit = handleSubmit(async ({ identifier, password }) => {
    setFormError(null);
    try {
      const id = isEmail(identifier) ? identifier.trim().toLowerCase() : normalizePhone(identifier);
      // on success the root layout's route guard moves the user to their role's screens
      await setSession(await authApi.login(id, password));
    } catch (e) {
      setFormError(errorMessage(e));
    }
  });

  return (
    <AuthScreen title="Welcome back" subtitle="Log in to track your ride and manage your tickets.">
      <Controller
        control={control}
        name="identifier"
        render={({ field }) => (
          <TextField
            label="Email or mobile number"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="none"
            autoComplete="username"
            keyboardType="email-address"
            textContentType="username"
            error={errors.identifier?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            label="Password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={onSubmit}
            error={errors.password?.message}
          />
        )}
      />
      {formError ? <ErrorMessage message={formError} /> : null}
      <Button title="Log in" onPress={onSubmit} loading={isSubmitting} />
      <Text style={{ ...typography.body, color: c.textSecondary, textAlign: 'center' }}>
        {t('New to RideTrack?')}{' '}
        <Link href="/register" style={{ color: c.primary, fontWeight: '700' }}>
          {t('Create an account')}
        </Link>
      </Text>
    </AuthScreen>
  );
}
