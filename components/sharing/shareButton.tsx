'use client';

import { Check, Copy, Share2 } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

interface ShareButtonProps {
  fileId: string;
}

export default function ShareButton({ fileId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    try {
      setLoading(true);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Unable to create share link', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleShare} disabled={loading} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
      {copied ? (
        <>
          <Check size={15} />
          Copied
        </>
      ) : (
        <>
          {loading ? <Share2 size={15} /> : <Copy size={15} />}

          {loading ? 'Creating...' : 'Share'}
        </>
      )}
    </button>
  );
}
