'use client';

import FileBrowser from '@/components/files/fileBrowser';
import AppShell from '@/components/layout/appShell';
import { use } from 'react';

interface FilesPageProps {
  params: Promise<{
    folderId?: string[];
  }>;
}

export default function FilesPage({ params }: FilesPageProps) {
  const { folderId } = use(params);

  return (
    <AppShell>
      <FileBrowser folderId={folderId?.[0]} />
    </AppShell>
  );
}
