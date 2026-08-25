'use client';

import { HeartPulse, UserPlus, Upload, ShieldCheck } from 'lucide-react';
import SearchProfiles from '@/components/SearchProfiles';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="bg-brand-red text-white py-16 px-4 md:py-24 rounded-b-[40px] shadow-lg relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-b-[40px] overflow-hidden"></div>
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <HeartPulse size={48} className="text-white animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Scan2Save
          </h1>
          <p className="text-xl md:text-2xl text-red-100 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Every second counts. Instantly access life-saving emergency medical profiles with a single scan.
          </p>

          <SearchProfiles />
        </div>
      </section>

      {/* Navigation Sections */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 space-y-8">
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Individual Registration Card */}
          <Link href="/register" className="group bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:border-brand-red transition-all hover:shadow-2xl hover:-translate-y-1 block">
            <div className="w-16 h-16 bg-red-50 text-brand-red rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserPlus size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Individual Registration</h3>
            <p className="text-gray-600 mb-6 line-clamp-2">
              Create your emergency medical profile. Upload an old prescription and our AI will automatically extract your medical data.
            </p>
            <span className="font-bold text-brand-red group-hover:underline flex items-center gap-2">
              Create Profile &rarr;
            </span>
          </Link>

          {/* Bulk Upload Card */}
          <Link href="/bulk-upload" className="group bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:border-blue-500 transition-all hover:shadow-2xl hover:-translate-y-1 block">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Organization Bulk Upload</h3>
            <p className="text-gray-600 mb-6 line-clamp-2">
              For faculty and admins. Download our CSV template and instantly generate hundreds of emergency profiles in one go.
            </p>
            <span className="font-bold text-blue-600 group-hover:underline flex items-center gap-2">
              Upload CSV &rarr;
            </span>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="bg-gray-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 justify-between mt-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full">
              <ShieldCheck size={32} className="text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Secure & Private</h4>
              <p className="text-gray-400 text-sm">Your medical data is securely stored and only accessible via your unique QR code.</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
