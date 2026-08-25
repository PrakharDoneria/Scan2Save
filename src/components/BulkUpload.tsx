'use client';

import React, { useState } from 'react';
import { Upload, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';

export default function BulkUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const csvContent = 'name,roll_no,blood_group,allergies,medical_conditions,habits,emergency_contact_name,emergency_contact_number\nJohn Doe,CS-2024-001,O+,Peanuts,None,None,Jane Doe,9876543210';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'scan2save_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const profiles = results.data.map((row: any) => ({
            name: row.name,
            roll_no: row.roll_no,
            blood_group: row.blood_group,
            allergies: row.allergies || 'None known',
            medical_conditions: row.medical_conditions || 'None declared',
            habits: row.habits || 'None known',
            emergency_contacts: [
              {
                name: row.emergency_contact_name || 'Emergency Contact',
                number: row.emergency_contact_number || ''
              }
            ]
          }));

          const { data, error } = await supabase
            .from('profiles')
            .upsert(profiles)
            .select();

          if (error) throw error;

          setResult({
            success: profiles.length,
            failed: 0 // Simplification: either all fail or all succeed in a single batch
          });
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to bulk upload profiles');
        } finally {
          setIsUploading(false);
          // Reset file input
          e.target.value = '';
        }
      },
      error: (error) => {
        setError(`CSV Parse Error: ${error.message}`);
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Upload className="text-brand-red" /> Bulk Registration (Faculty)
      </h3>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 space-y-4">
          <p className="text-gray-600">
            Upload a CSV file to register multiple students at once. Please ensure your CSV matches the required template.
          </p>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-brand-red font-medium hover:underline"
          >
            <Download size={18} /> Download CSV Template
          </button>
        </div>

        <div className="flex-1 w-full relative">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <Loader2 className="animate-spin text-gray-400" size={32} />
              ) : (
                <Upload className="text-gray-400 mb-2" size={32} />
              )}
              <p className="text-sm text-gray-500 font-semibold">
                {isUploading ? 'Uploading...' : 'Click to upload CSV'}
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".csv" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-brand-red-dark border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold">Upload Successful!</p>
            <p className="text-sm">{result.success} profiles have been created or updated.</p>
          </div>
        </div>
      )}
    </div>
  );
}
