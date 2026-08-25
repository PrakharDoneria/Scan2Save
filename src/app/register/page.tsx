'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Hash, Droplet, Phone, Plus, Trash2, AlertTriangle, Syringe, HeartPulse } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PrescriptionUpload from '@/components/PrescriptionUpload';
import Link from 'next/link';

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

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const { error } = await supabase
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
        ]);

      if (error) throw error;
      
      // Navigate straight to the print page on success
      router.push(`/print/${formData.roll_no}`);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-brand-red text-white py-8 px-4 shadow-md">
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

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
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
                <>Generate & View ID Card</>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
