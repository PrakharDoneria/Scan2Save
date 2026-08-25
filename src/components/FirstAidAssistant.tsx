'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2, MessageSquare, Send } from 'lucide-react';

export default function FirstAidAssistant() {
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  
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
          const base64data = btoa(binary);

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              audio_payload: base64data
            }));
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      let currentTranscript = '';
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.transcript) {
          currentTranscript = data.transcript;
          setTranscript(data.transcript);
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error.');
        stopRecording();
      };
      
    } catch (err: any) {
      setError(err.message || 'Microphone access denied or error occurred.');
      setIsRecording(false);
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

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    processAssistantRequest(transcript);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setTranscript(textInput);
    processAssistantRequest(textInput);
    setTextInput('');
  };

  const processAssistantRequest = async (inputText: string) => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setError(null);
    setFirstAidResponse('');
    
    try {
      const response = await fetch('/api/first-aid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: inputText })
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
      
      setFirstAidResponse(data.text || 'Response generated. Audio playing...');
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center">
          <Volume2 className="mr-2 text-brand-red" />
          AI First-Aid Assistant
        </h3>
        
        {/* Toggle Mode */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setInputMode('voice')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'voice' ? 'bg-white shadow-sm text-brand-red' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mic size={14} /> Voice
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'text' ? 'bg-white shadow-sm text-brand-red' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare size={14} /> Text
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        {inputMode === 'voice' 
          ? "Click the microphone and describe the patient's condition to get instant voice-guided instructions."
          : "Type the patient's symptoms below to get instant first-aid instructions."}
      </p>
      
      <div className="flex flex-col items-center">
        {inputMode === 'voice' ? (
          <>
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
          </>
        ) : (
          <form onSubmit={handleTextSubmit} className="w-full relative">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. He is having trouble breathing and holding his chest"
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none bg-gray-50 text-gray-800"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !textInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        )}

        {isProcessing && (
          <div className="mt-6 flex items-center text-brand-red">
            <Loader2 className="animate-spin mr-2" />
            Analyzing condition...
          </div>
        )}

        {transcript && (
          <div className="mt-6 w-full bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm italic text-gray-700 shadow-inner">
            <span className="font-semibold not-italic block mb-1 text-gray-500 text-xs uppercase tracking-wider">Reported Condition:</span>
            "{transcript}"
          </div>
        )}

        {firstAidResponse && (
          <div className="mt-4 w-full bg-green-50 p-4 rounded-lg border border-green-200 text-sm text-green-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            {firstAidResponse}
          </div>
        )}

        {error && (
          <div className="mt-4 w-full bg-red-50 p-3 rounded-lg border border-red-200 text-sm text-red-600 flex items-center gap-2">
            <Loader2 className="shrink-0 hidden" />
            <span>Error: {error}</span>
          </div>
        )}
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
