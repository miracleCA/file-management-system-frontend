'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { enqueueSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/context/slices/authSlice';
import { useEffect } from 'react';
import { useLoginUser } from '@/api/auth';
import { RootState } from '@/context/store';
import { useRouter } from 'next/router';

const loginSchema = z.object({
  email: z.string().min(1, 'Please enter a valid email address or username'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  const { mutate, isPending, error } = useLoginUser();

  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    mutate(data, {
      onSuccess: (response) => {
        dispatch(setUser(response));
        enqueueSnackbar(response.data?.message ?? 'Login successful, Redirecting...', {
          variant: 'success',
        });
        router.replace('/files');
      },
      onError: (error: any) => {
        const errorMessage = typeof error?.response?.data?.message == 'string' ? error?.response?.data?.message : typeof error?.message === 'string' ? error?.message : 'Failed to Login succesfully';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label>Email</label>

        <input {...register('email')} type="email" placeholder="you@example.com" className="w-full rounded border p-3" />

        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label>Password</label>

        <input {...register('password')} type="password" className="w-full rounded border p-3" />

        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <button disabled={isPending} className="w-full rounded bg-black p-3 text-white disabled:opacity-50">
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
