'use client';

import React from 'react';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import BulkUpload from '@/components/BulkUpload';

export default function BulkUploadPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-brand-red text-white py-8 px-4 shadow-md mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <HeartPulse size={28} />
            <h1 className="text-2xl font-bold tracking-tight">Scan2Save</h1>
          </Link>
          <Link href="/" className="text-sm font-medium hover:underline text-white/90">
            Cancel
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <BulkUpload />
      </div>
    </main>
  );
}
