'use client';

import { Mic, MicOff, Volume2, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMutation } from '@tanstack/react-query';

export default function VoiceTrading() {
  const { address } = useAccount();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceCommand(text);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const processCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/voice/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, address }),
      });
      if (!response.ok) throw new Error('Failed to process command');
      return response.json();
    },
    onSuccess: (data) => {
      setResponse(data.response);
      // Speak response
      if ('speechSynthesis' in window) {
        // Stop any ongoing speech first
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
      }
    },
  });

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const processVoiceCommand = async (command: string) => {
    processCommandMutation.mutate(command);
  };

  const toggleListening = () => {
    if (!recognition) {
      alert('Voice recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Control */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-8 border border-purple-500/30">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Volume2 className="w-6 h-6 text-purple-400" />
            Voice-Activated Trading
          </h2>
          <p className="text-gray-400 mb-6">Control your portfolio with your voice</p>

          {/* Microphone Button */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleListening}
              disabled={!address}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-700'
              } ${!address ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? (
                <MicOff className="w-16 h-16 text-white" />
              ) : (
                <Mic className="w-16 h-16 text-white" />
              )}
            </button>

            {/* Stop Speaking Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="w-32 h-32 rounded-full bg-orange-600 hover:bg-orange-700 flex flex-col items-center justify-center transition-all animate-pulse"
              >
                <Volume2 className="w-12 h-12 text-white mb-2" />
                <span className="text-sm font-semibold">STOP</span>
              </button>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-400">
            {!address
              ? 'Connect wallet to use voice commands'
              : isSpeaking
              ? '🔊 AI is speaking... Click STOP to interrupt'
              : isListening
              ? '🎤 Listening... Speak now'
              : 'Click microphone to start'}
          </p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="mt-6 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">You said:</p>
            <p className="text-lg font-semibold">{transcript}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="mt-4 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
            <p className="text-sm text-blue-400 mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Response:
            </p>
            <p className="text-white">{response}</p>
          </div>
        )}

        {/* Loading */}
        {processCommandMutation.isPending && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-sm text-gray-400 mt-2">Processing command...</p>
          </div>
        )}
      </div>

      {/* Example Commands */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Try These Commands:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { cmd: 'What is my risk score?', icon: '🛡️' },
            { cmd: 'Show my portfolio balance', icon: '💰' },
            { cmd: 'Explain impermanent loss', icon: '📚' },
            { cmd: 'Find arbitrage opportunities', icon: '🔍' },
            { cmd: 'What is DeFi?', icon: '❓' },
            { cmd: 'Should I rebalance?', icon: '⚖️' },
          ].map((item) => (
            <button
              key={item.cmd}
              onClick={() => {
                setTranscript(item.cmd);
                processVoiceCommand(item.cmd);
              }}
              disabled={!address}
              className="bg-gray-900 hover:bg-gray-850 disabled:opacity-50 rounded-lg p-3 text-left transition-colors"
            >
              <span className="text-2xl mr-2">{item.icon}</span>
              <span className="text-sm">{item.cmd}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Browser Support Notice */}
      {typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-yellow-400">
            ⚠️ Voice recognition requires Chrome or Edge browser
          </p>
        </div>
      )}
    </div>
  );
}
