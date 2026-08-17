'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRegisterUser } from '@/api/auth';
import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { RootState } from '@/context/store';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/context/slices/authSlice';

const registerSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { mutate, isPending } = useRegisterUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    const { confirmPassword, ...rest } = data;
    if (confirmPassword !== data.password) {
      enqueueSnackbar('Passwords do not match', {
        variant: 'error',
      });
      return;
    }

    mutate(rest, {
      onSuccess: (response) => {
        dispatch(setUser(response));
        enqueueSnackbar(response.data ?? 'User account created successfully', {
          variant: 'success',
        });
        router.push('/');
      },
      onError: (error: any) => {
        const errorMessage = typeof error?.response?.data?.message == 'string' ? error?.response?.data?.message : typeof error?.message === 'string' ? error?.message : 'Failed to register user';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      },
    });
  };

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label>Email</label>

        <input {...register('email')} type="email" className="w-full rounded border p-3" />

        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label>Password</label>

        <input {...register('password')} type="password" className="w-full rounded border p-3" />

        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <label>Confirm password</label>

        <input {...register('confirmPassword')} type="password" className="w-full rounded border p-3" />

        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <button disabled={isPending} className="w-full rounded bg-black p-3 text-white">
        {isPending ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
