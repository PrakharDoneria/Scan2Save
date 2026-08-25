'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/profile';
import { HeartPulse, Printer, ShieldAlert } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

export default function PrintPage() {
  const params = useParams();
  const roll_no = params.roll_no as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('roll_no', roll_no)
          .single();
        
        if (error) {
          console.error(error);
        } else {
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (roll_no) fetchProfile();
  }, [roll_no]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <ShieldAlert size={80} className="text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          No medical emergency profile exists for ID "{roll_no}".
        </p>
        <Link 
          href="/" 
          className="bg-brand-red text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-red-dark transition"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const emergencyUrl = `${baseUrl}/e/${profile.roll_no}`;

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      
      <div className="mb-6 flex gap-4 no-print">
        <button 
          onClick={() => window.print()}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition flex items-center gap-2 shadow-md"
        >
          <Printer size={20} /> Print Card
        </button>
        <Link 
          href="/"
          className="bg-white border-2 border-brand-red text-brand-red hover:bg-red-50 font-bold py-3 px-8 rounded-xl transition shadow-sm"
        >
          Back Home
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6 no-print">
          <p className="text-gray-500 text-sm">Please make sure "Background graphics" is enabled in your print dialog.</p>
        </div>

        {/* The Badge (Printable) */}
        <div 
          className="w-[85.6mm] h-[53.98mm] bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden flex flex-col relative print:shadow-none print:border-black mx-auto"
          style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
        >
          {/* Badge Header */}
          <div className="bg-brand-red text-white py-2 px-3 flex items-center gap-2">
            <HeartPulse size={16} />
            <span className="font-bold text-xs tracking-wider">EMERGENCY MEDICAL ID</span>
          </div>
          
          <div className="flex-1 p-3 flex">
            {/* Left Side: Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-lg leading-tight truncate">{profile.name}</h4>
                <p className="text-gray-500 text-xs">{profile.roll_no}</p>
              </div>
              
              <div className="mt-2">
                <div className="inline-block bg-red-100 text-brand-red-dark border border-red-200 px-3 py-1 rounded-md text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wide">Blood Group</span>
                  <span className="block text-2xl font-extrabold leading-none">{profile.blood_group}</span>
                </div>
              </div>
            </div>
            
            {/* Right Side: QR Code */}
            <div className="ml-2 flex flex-col items-center justify-center border-l border-gray-100 pl-3">
              <QRCodeSVG 
                value={emergencyUrl} 
                size={70}
                level="Q"
                className="mb-1"
              />
              <span className="text-[8px] font-bold text-gray-400">SCAN IN EMERGENCY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for printing injected via style tag */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { 
            background: white; 
            margin: 0;
            padding: 0;
          }
          .no-print { display: none !important; }
        }
      `}} />
    </main>
  );
}
