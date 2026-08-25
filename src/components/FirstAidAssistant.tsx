'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';

export default function FirstAidAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [firstAidResponse, setFirstAidResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      setFirstAidResponse('');
      
      const apiKey = process.env.NEXT_PUBLIC_SARVAM_API_KEY;
      if (!apiKey) {
        throw new Error('Sarvam API key is not configured.');
      }

      const wsUrl = `wss://api.sarvam.ai/speech-to-text-realtime/ws?language_code=en-IN&stream_type=fast`;
      const ws = new WebSocket(wsUrl, ['api-subscription-key', apiKey]);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000
        });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          const float32Array = e.inputBuffer.getChannelData(0);
          const int16Array = new Int16Array(float32Array.length);
          for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          const buffer = new Uint8Array(int16Array.buffer);
          // Convert to base64
          let binary = '';
          const bytes = new Uint8Array(buffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Audio = window.btoa(binary);
          
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              event: 'audio_input',
              audio: base64Audio
            }));
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.event === 'transcript.partial') {
          setTranscript(message.text);
        } else if (message.event === 'transcript.final') {
          setTranscript(message.text);
          stopRecordingAndProcess(message.text);
        } else if (message.event === 'error') {
          console.error('Sarvam STT Error:', message.message);
          setError(message.message);
          stopRecording();
        }
      };

      ws.onclose = () => {
        stopRecording();
      };

    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
  };

  const stopRecordingAndProcess = async (finalTranscript: string) => {
    stopRecording();
    
    if (!finalTranscript.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/first-aid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: finalTranscript })
      });

      if (!response.ok) {
        throw new Error('Failed to get first-aid response');
      }

      const data = await response.json();
      if (!data.audioBase64) {
        throw new Error('No audio returned from the assistant');
      }
      
      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
      
      setFirstAidResponse('Response generated. Listening to audio...');
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Volume2 className="mr-2 text-brand-red" />
        AI First-Aid Assistant
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Click the button and describe the patient's condition to get instant first-aid instructions.
      </p>
      
      <div className="flex flex-col items-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all ${
            isRecording ? 'bg-red-600 animate-pulse scale-110' : 'bg-brand-red hover:bg-red-700'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? <Square size={32} /> : <Mic size={32} />}
        </button>
        
        <p className="mt-4 text-sm font-medium text-gray-500">
          {isRecording ? 'Listening... click to submit' : 'Click to speak'}
        </p>

        {isProcessing && (
          <div className="mt-4 flex items-center text-brand-red">
            <Loader2 className="animate-spin mr-2" />
            Analyzing condition...
          </div>
        )}

        {transcript && (
          <div className="mt-4 w-full bg-gray-50 p-3 rounded border text-sm italic text-gray-700">
            "{transcript}"
          </div>
        )}

        {firstAidResponse && (
          <div className="mt-4 w-full bg-green-50 p-4 rounded border border-green-200 text-sm text-green-800">
            {firstAidResponse}
          </div>
        )}

        {error && (
          <div className="mt-4 w-full bg-red-50 p-3 rounded border border-red-200 text-sm text-red-600">
            Error: {error}
          </div>
        )}
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
