'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { HeartPulse, Link as LinkIcon, AlertTriangle, Syringe, Phone, User, Droplet, Hash, Printer, Plus, Trash2, Download as DownloadIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SearchProfiles from '@/components/SearchProfiles';
import BulkUpload from '@/components/BulkUpload';
import PrescriptionUpload from '@/components/PrescriptionUpload';
import html2canvas from 'html2canvas';

type EmergencyContact = {
  name: string;
  number: string;
};

type FormData = {
  name: string;
  roll_no: string;
  blood_group: string;
  allergies: string;
  medical_conditions: string;
  habits: string;
  emergency_contacts: EmergencyContact[];
};

const initialFormData: FormData = {
  name: '',
  roll_no: '',
  blood_group: '',
  allergies: '',
  medical_conditions: '',
  habits: '',
  emergency_contacts: [{ name: '', number: '' }],
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...formData.emergency_contacts];
    newContacts[index][field] = value;
    setFormData({ ...formData, emergency_contacts: newContacts });
  };

  const addContact = () => {
    setFormData({ 
      ...formData, 
      emergency_contacts: [...formData.emergency_contacts, { name: '', number: '' }] 
    });
  };

  const removeContact = (index: number) => {
    if (formData.emergency_contacts.length > 1) {
      const newContacts = [...formData.emergency_contacts];
      newContacts.splice(index, 1);
      setFormData({ ...formData, emergency_contacts: newContacts });
    }
  };

  const handlePrescriptionExtracted = (extractedData: any) => {
    setFormData(prev => ({
      ...prev,
      blood_group: extractedData.blood_group || prev.blood_group,
      allergies: extractedData.allergies || prev.allergies,
      medical_conditions: extractedData.medical_conditions || prev.medical_conditions,
      habits: extractedData.habits || prev.habits,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate contacts
    const validContacts = formData.emergency_contacts.filter(c => c.name.trim() !== '' && c.number.trim() !== '');
    if (validContacts.length === 0) {
      setError("Please provide at least one valid emergency contact.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert([
          {
            roll_no: formData.roll_no,
            name: formData.name,
            blood_group: formData.blood_group,
            allergies: formData.allergies || 'None known',
            medical_conditions: formData.medical_conditions || 'None declared',
            habits: formData.habits || 'None known',
            emergency_contacts: validContacts,
          },
        ])
        .select();

      if (error) throw error;
      
      setGeneratedId(formData.roll_no);
      
      // Scroll to preview
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadCard = () => {
    if (generatedId) {
      window.open(`/print/${generatedId}`, '_blank');
    }
  };

  const handleTestLink = () => {
    if (generatedId) {
      window.open(`/e/${generatedId}`, '_blank');
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const emergencyUrl = `${baseUrl}/e/${generatedId}`;

  return (
    <main className="min-h-screen pb-20 no-print">
      {/* Hero Section */}
      <section className="bg-brand-red text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <HeartPulse size={48} className="animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Scan2Save</h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Your ID Card Can Save Your Life</h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8 leading-relaxed">
            70% of student and workplace ID cards lack critical medical data. Scan2Save turns any standard badge into an instant first-responder lifesaver.
          </p>

          <SearchProfiles />
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 space-y-8">
        {/* Form Section */}
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          
          <PrescriptionUpload onExtracted={handlePrescriptionExtracted} />

          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="text-brand-red" /> Register Medical ID
          </h3>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-brand-red-dark border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="shrink-0 mt-0.5" size={20} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Hash size={16} /> Roll / Employee ID *
                </label>
                <input
                  type="text"
                  name="roll_no"
                  required
                  value={formData.roll_no}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition outline-none"
                  placeholder="e.g. EMP-12345"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Droplet size={16} className="text-brand-red" /> Blood Group *
                </label>
                <select
                  name="blood_group"
                  required
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition outline-none bg-white"
                >
                  <option value="" disabled>Select Blood Group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-2"><Phone size={16} /> Emergency Contacts *</span>
                <button type="button" onClick={addContact} className="text-xs flex items-center gap-1 text-brand-red hover:underline">
                  <Plus size={14} /> Add Contact
                </button>
              </label>
              
              {formData.emergency_contacts.map((contact, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      required
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red outline-none"
                      placeholder="Contact Name"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      title="10-digit phone number"
                      value={contact.number}
                      onChange={(e) => handleContactChange(index, 'number', e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red outline-none"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  {formData.emergency_contacts.length > 1 && (
                    <button type="button" onClick={() => removeContact(index)} className="p-3 mt-1 text-gray-400 hover:text-brand-red transition">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-brand-amber" /> Known Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red outline-none"
                  placeholder="e.g., Penicillin, Peanuts"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Syringe size={16} /> Medical Conditions
                </label>
                <textarea
                  name="medical_conditions"
                  value={formData.medical_conditions}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red outline-none"
                  placeholder="e.g., Type 1 Diabetes, Asthma"
                  rows={2}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-gray-500" /> Habits
                </label>
                <textarea
                  name="habits"
                  value={formData.habits}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red outline-none"
                  placeholder="e.g., Smoking, Alcohol consumption"
                  rows={2}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-4 rounded-xl transition shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>Generate Emergency ID Card</>
              )}
            </button>
          </form>
        </section>

        {/* Bulk Upload Section */}
        <section>
          <BulkUpload />
        </section>
      </div>

      {/* Generated ID Preview Section */}
      {generatedId && (
        <section ref={previewRef} className="max-w-4xl mx-auto px-4 mt-16 pb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800">Your Emergency ID is Ready</h3>
            <p className="text-gray-600">Print this and keep it with your standard ID card.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            {/* The Badge (Printable) */}
            <div className="print-only-wrapper bg-white">
              <div 
                id="id-card-element"
                className="w-[85.6mm] h-[53.98mm] bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden flex flex-col relative print:shadow-none print:border-black"
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
                      <h4 className="font-bold text-gray-900 text-lg leading-tight truncate">{formData.name}</h4>
                      <p className="text-gray-500 text-xs">{formData.roll_no}</p>
                    </div>
                    
                    <div className="mt-2">
                      <div className="inline-block bg-red-100 text-brand-red-dark border border-red-200 px-3 py-1 rounded-md text-center">
                        <span className="block text-[10px] font-bold uppercase tracking-wide">Blood Group</span>
                        <span className="block text-2xl font-extrabold leading-none">{formData.blood_group}</span>
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

            {/* Actions */}
            <div className="flex flex-col gap-4 min-w-[200px]">
              <button 
                onClick={handleDownloadCard}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
              >
                <Printer size={20} /> Print / Save ID Card
              </button>
              
              <button 
                onClick={handleTestLink}
                className="bg-white border-2 border-brand-red text-brand-red hover:bg-red-50 font-medium py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <LinkIcon size={20} /> Test Emergency Link
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Global CSS for printing injected via style tag */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { visibility: hidden; }
          .print-only-wrapper, .print-only-wrapper * { visibility: visible; }
          .print-only-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 2cm;
          }
        }
      `}} />
    </main>
  );
}
