import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { errorMessage } from '@/api/client';
import { authApi } from '@/api/endpoints';
import { AuthScreen, startSession } from '@/components/auth/AuthScreen';
import { Button, ErrorMessage, TextField } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { typography } from '@/theme';
import { driverLoginSchema, type DriverLoginForm } from '@/utils/validation';

/** Driver sign-in on the bus phone: the driver code an admin issued, not an email (RideTrack-API `/driver/auth/login`). */
export default function DriverLoginScreen() {
  const c = useColors();
  const t = useT();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DriverLoginForm>({ resolver: zodResolver(driverLoginSchema), defaultValues: { driverCode: '', password: '' } });

  const onSubmit = handleSubmit(async ({ driverCode, password }) => {
    setFormError(null);
    try {
      // on success the root layout's route guard opens the driver panel
      await startSession(await authApi.driverLogin(driverCode, password));
    } catch (e) {
      setFormError(errorMessage(e));
    }
  });

  return (
    <AuthScreen title="Driver sign-in" subtitle="Sign in on the bus phone to run your bus. Use the driver code from your administrator.">
      <Controller
        control={control}
        name="driverCode"
        render={({ field }) => (
          <TextField
            label="Driver code"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            placeholder="e.g. DRV-4K7Q2M"
            error={errors.driverCode?.message}
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
      <Button title="Sign in" onPress={onSubmit} loading={isSubmitting} />
      <Text style={{ ...typography.body, color: c.textSecondary, textAlign: 'center' }}>
        {t('Not a driver?')}{' '}
        <Link href="/login" style={{ color: c.primary, fontWeight: '700' }}>
          {t('Passenger and staff login')}
        </Link>
      </Text>
    </AuthScreen>
  );
}
