'use client';

import React, { useState } from 'react';
import { FileText, Upload, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PrescriptionUploadProps {
  onExtracted: (data: any) => void;
}

export default function PrescriptionUpload({ onExtracted }: PrescriptionUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setStatus('Uploading document...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload and get Job ID
      const uploadRes = await fetch('/api/prescription/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload document');
      }

      const uploadData = await uploadRes.json();
      if (uploadData.error) throw new Error(uploadData.error);
      
      const jobId = uploadData.job_id;
      setStatus('Analyzing document (this may take up to a minute)...');

      // 2. Poll for Status
      let isComplete = false;
      while (!isComplete) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds
        
        const statusRes = await fetch('/api/prescription/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: jobId }),
        });

        if (!statusRes.ok) {
          throw new Error('Failed to check status');
        }

        const statusData = await statusRes.json();
        
        if (statusData.error) throw new Error(statusData.error);

        if (statusData.status === 'completed') {
          isComplete = true;
          onExtracted(statusData.data);
          setSuccess(true);
          setStatus('Medical data successfully extracted!');
        } else if (statusData.status === 'failed' || statusData.status === 'rejected') {
          throw new Error('Document processing failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
      setStatus(null);
    } finally {
      setIsUploading(false);
      // reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-2">
            <FileText className="text-blue-600" /> Auto-fill via Prescription
          </h3>
          <p className="text-blue-700 text-sm">
            Upload an old medical record, ID, or prescription (PDF, JPG, PNG). Our AI (Sarvam Vision) will instantly read it and extract your blood group, allergies, conditions, and habits!
          </p>
        </div>
        
        <div className="flex-shrink-0 w-full md:w-auto">
          <label className="relative flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 border-2 border-blue-200 font-bold py-3 px-6 rounded-xl transition cursor-pointer shadow-sm w-full">
            {isUploading ? (
              <><Loader2 size={20} className="animate-spin" /> Processing...</>
            ) : (
              <><Upload size={20} /> Upload Document</>
            )}
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {status && !error && !success && (
        <div className="mt-4 flex items-center gap-2 text-blue-800 text-sm animate-pulse bg-blue-100/50 p-3 rounded-lg">
          <Loader2 size={16} className="animate-spin" /> {status}
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-center gap-2 text-green-700 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
          <CheckCircle2 size={16} /> {status} The form below has been populated!
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertTriangle size={16} /> {error}
        </div>
      )}
    </div>
  );
}
