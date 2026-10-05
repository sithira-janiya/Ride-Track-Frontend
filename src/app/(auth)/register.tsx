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
import { useAuth } from '@/store/auth';
import { typography } from '@/theme';
import { registerSchema, splitIdentifier, type RegisterForm } from '@/utils/validation';

export default function RegisterScreen() {
  const c = useColors();
  const setSession = useAuth((s) => s.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', identifier: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ name, identifier, password }) => {
    setFormError(null);
    try {
      await setSession(await authApi.register({ name: name.trim(), password, ...splitIdentifier(identifier) }));
    } catch (e) {
      setFormError(errorMessage(e));
    }
  });

  return (
    <AuthScreen title="Create your account" subtitle="Register with your email or mobile number.">
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextField
            label="Full name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoComplete="name"
            textContentType="name"
            error={errors.name?.message}
          />
        )}
      />
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
            keyboardType="email-address"
            autoComplete="username"
            error={errors.identifier?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            label="Password (8+ characters, with a letter and a number)"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <TextField
            label="Confirm password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            onSubmitEditing={onSubmit}
            error={errors.confirmPassword?.message}
          />
        )}
      />
      {formError ? <ErrorMessage message={formError} /> : null}
      <Button title="Create account" onPress={onSubmit} loading={isSubmitting} />
      <Text style={{ ...typography.body, color: c.textSecondary, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: c.primary, fontWeight: '700' }}>
          Log in
        </Link>
      </Text>
    </AuthScreen>
  );
}
