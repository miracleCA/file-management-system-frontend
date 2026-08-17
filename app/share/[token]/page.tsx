'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import apiAxios from '@/api';

interface SharedFileResponse {
  downloadUrl: string;
  filename: string;
  expiresAt: string;
}

export default function SharedFilePage() {
  const params = useParams();
  const token = params.token as string;
  const [file, setFile] = useState<SharedFileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid share link.');
      setLoading(false);
      return;
    }

    const loadSharedFile = async () => {
      try {
        const response = await apiAxios.get<SharedFileResponse>(`/share/${token}`);

        setFile(response.data);
      } catch (error: any) {
        const message = error?.response?.data?.message ?? 'This share link is invalid or has expired.';

        setError(Array.isArray(message) ? message.join(', ') : message);
      } finally {
        setLoading(false);
      }
    };

    loadSharedFile();
  }, [token]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading shared file...</div>

          <p className="mt-2 text-sm text-gray-500">Please wait.</p>
        </div>
      </main>
    );
  }

  if (error || !file) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">🔗</div>

          <h1 className="text-xl font-semibold">Share link unavailable</h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">{error || 'This file is no longer available.'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mb-4 text-5xl">📄</div>

          <h1 className="text-xl font-semibold">Shared file</h1>

          <p className="mt-2 break-all text-sm text-gray-500">{file.filename}</p>
        </div>

        <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" download={file.filename} className="block w-full rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-gray-800">
          Download file
        </a>

        <p className="mt-4 text-center text-xs text-gray-400">This link expires {new Date(file.expiresAt).toLocaleString()}.</p>
      </div>
    </main>
  );
}
