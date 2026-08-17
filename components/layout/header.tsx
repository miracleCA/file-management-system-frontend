'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/context/slices/authSlice';
import { useDispatch } from 'react-redux';

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="font-semibold">File Manager</div>

      <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100">
        <LogOut size={16} />
        Sign out
      </button>
    </header>
  );
}
