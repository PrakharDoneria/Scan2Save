'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/profile';
import { AlertTriangle, Phone, MapPin, HeartPulse, ShieldAlert, Clock, Printer } from 'lucide-react';
import Link from 'next/link';
import FirstAidAssistant from '@/components/FirstAidAssistant';

export default function EmergencyProfilePage() {
  const params = useParams();
  const roll_no = params.roll_no as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

  const handleShareLocation = () => {
    if (!profile || !profile.emergency_contacts || profile.emergency_contacts.length === 0) return;
    
    setLocationStatus('loading');
    
    // We will share with the first emergency contact for now
    const primaryContact = profile.emergency_contacts[0];
    const cleanNumber = primaryContact.number.replace(/\D/g, '');
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          
          const text = `EMERGENCY! ${profile.name} (Roll: ${profile.roll_no}) needs immediate assistance. Blood Group: ${profile.blood_group}. Location: ${mapUrl}`;
          
          window.open(`https://wa.me/91${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
          setLocationStatus('success');
        },
        (error) => {
          console.error("Error getting location", error);
          const text = `EMERGENCY! ${profile.name} (Roll: ${profile.roll_no}) needs immediate assistance. Blood Group: ${profile.blood_group}. Location access unavailable.`;
          
          window.open(`https://wa.me/91${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
          setLocationStatus('error');
        },
        { timeout: 10000 }
      );
    } else {
      const text = `EMERGENCY! ${profile.name} (Roll: ${profile.roll_no}) needs immediate assistance. Blood Group: ${profile.blood_group}.`;
      window.open(`https://wa.me/91${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
      setLocationStatus('error');
    }
  };

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
          No medical emergency profile exists for ID "{roll_no}". The ID might be invalid or the profile was removed.
        </p>
        <Link 
          href="/" 
          className="bg-brand-red text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-red-dark transition"
        >
          Register New ID
        </Link>
      </div>
    );
  }

  const generatedDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown';

  return (
    <main className="min-h-screen bg-gray-100 pb-20 selection:bg-brand-red selection:text-white">
      {/* Top Urgency Banner */}
      <div className="bg-brand-red text-white py-3 px-4 flex justify-center items-center gap-2 animate-pulse sticky top-0 z-50 shadow-md">
        <AlertTriangle size={24} className="shrink-0" />
        <h1 className="font-black tracking-widest text-lg md:text-xl uppercase text-center">Critical Emergency Medical Data</h1>
        <AlertTriangle size={24} className="shrink-0" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Blood Group Hero */}
        <div className="bg-brand-red rounded-3xl shadow-2xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <HeartPulse size={250} />
          </div>
          <p className="text-red-200 font-bold tracking-widest uppercase mb-2 text-sm">Blood Group</p>
          <h2 className="text-7xl md:text-8xl font-black leading-none tracking-tighter">
            {profile.blood_group}
          </h2>
        </div>

        {/* Identity Row */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{profile.name}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-gray-500 gap-2">
            <span className="font-mono bg-gray-100 px-3 py-1 rounded text-sm font-semibold text-gray-700 inline-block w-max">
              ID: {profile.roll_no}
            </span>
            <span className="text-xs flex items-center gap-1">
              <Clock size={14} /> Registered: {generatedDate}
            </span>
          </div>
        </div>

        <FirstAidAssistant />

        {/* Medical Details Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#FFF4F2] border border-red-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-brand-red">
              <AlertTriangle size={20} />
              <h4 className="font-bold text-lg">Known Allergies</h4>
            </div>
            <p className="text-gray-800 font-medium whitespace-pre-wrap">
              {profile.allergies || 'None declared'}
            </p>
          </div>
          
          <div className="bg-[#F0FDF4] border border-green-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-green-700">
              <HeartPulse size={20} />
              <h4 className="font-bold text-lg">Medical Conditions</h4>
            </div>
            <p className="text-gray-800 font-medium whitespace-pre-wrap">
              {profile.medical_conditions || 'None declared'}
            </p>
          </div>
        </div>

        {/* Habits Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm mt-4">
          <div className="flex items-center gap-2 mb-3 text-gray-700">
            <AlertTriangle size={20} />
            <h4 className="font-bold text-lg">Habits</h4>
          </div>
          <p className="text-gray-800 font-medium whitespace-pre-wrap">
            {profile.habits || 'None declared'}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4">
          {profile.emergency_contacts && profile.emergency_contacts.map((contact, index) => (
            <a 
              key={index}
              href={`tel:${contact.number}`}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-5 px-6 rounded-2xl shadow-xl transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-xl"
            >
              <Phone size={28} className="animate-bounce" style={{ animationDuration: '2s' }} />
              Call {contact.name || 'Emergency Contact'}
            </a>
          ))}

          <button 
            onClick={handleShareLocation}
            disabled={locationStatus === 'loading'}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-5 px-6 rounded-2xl shadow-xl transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-xl disabled:opacity-80"
          >
            {locationStatus === 'loading' ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <MapPin size={28} />
            )}
            Share Live Location via WhatsApp
          </button>

          <Link
            href={`/print/${profile.roll_no}`}
            className="w-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 font-bold py-5 px-6 rounded-2xl shadow-sm transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-xl"
          >
            <Printer size={28} />
            Print ID Card
          </Link>
        </div>

      </div>
    </main>
  );
}
