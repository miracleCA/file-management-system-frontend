import Link from 'next/link';
import { Files } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="hidden w-60 border-r bg-white p-4 md:block">
      <nav>
        <Link href="/files" className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium">
          <Files size={18} />
          My Files
        </Link>
      </nav>
    </aside>
  );
}
