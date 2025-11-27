import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Search, Brain, Volume2, Sparkles } from 'lucide-react';
import { ChatMessage, MessageRole } from '../types';
import { streamChatResponse, generateSpeech } from '../services/geminiService';

const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: MessageRole.MODEL, text: 'Greetings, Ratonaut Commander. I am your rodent biomechanics specialist. How is the hamster\'s wheel performance today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'complex' | 'search' | 'maps'>('fast');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: MessageRole.USER, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: MessageRole.MODEL, text: '', isThinking: mode === 'complex' }]);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Inject system context for Hamster/Rodent focus if not present
      const contextPrompt = "You are a helpful AI expert in hamster care, rodent biomechanics, and small pet health. The user is using an app called RATONAUT to monitor their hamster's wheel speed and activity. Provide advice tailored to hamsters/mice/gerbils.";
      
      let fullResponse = '';
      
      await streamChatResponse(
        [{role: 'user', parts: [{ text: contextPrompt }]}, ...history], // Prepend context
        userMsg.text, 
        mode, 
        (chunk, grounding) => {
          if (grounding) {
            setMessages(prev => prev.map(m => {
                if (m.id === modelMsgId) {
                    const newUrls = [];
                    if (grounding.groundingChunks) {
                         grounding.groundingChunks.forEach((c: any) => {
                             if (c.web?.uri) newUrls.push({ title: c.web.title, uri: c.web.uri });
                             if (c.maps?.uri) newUrls.push({ title: c.maps.title || "Map Location", uri: c.maps.uri });
                         });
                    }
                    return { ...m, groundingUrls: [...(m.groundingUrls || []), ...newUrls] };
                }
                return m;
            }));
          } else {
            fullResponse += chunk;
            setMessages(prev => prev.map(m => 
              m.id === modelMsgId ? { ...m, text: fullResponse, isThinking: false } : m
            ));
          }
        }
      );
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === modelMsgId ? { ...m, text: "Connection to the habitat data stream failed. Please retry.", isThinking: false } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const playTTS = async (text: string) => {
      try {
          const buffer = await generateSpeech(text);
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await ctx.decodeAudioData(buffer);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.start(0);
      } catch (e) {
          console.error("TTS Failed", e);
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F7FA] pb-20">
      {/* Header */}
      <div className="p-6 border-b border-[#E0E4EA] bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-lg font-bold text-[#1C1C1C] flex items-center gap-2">
          <Sparkles className="text-[#59C3C3]" size={20} />
          Rodent Coach
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === MessageRole.USER 
                ? 'bg-[#1C1C1C] text-white rounded-br-none' 
                : 'bg-white text-[#1C1C1C] border border-[#E0E4EA] rounded-bl-none'
            }`}>
              {msg.isThinking ? (
                <div className="flex items-center gap-2 text-[#59C3C3] animate-pulse">
                   <Brain size={16} /> Processing Habitats...
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                  
                  {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-[10px] uppercase text-[#6E747A] mb-2 font-bold">Sources</p>
                          <div className="flex flex-wrap gap-2">
                              {msg.groundingUrls.map((url, idx) => (
                                  <a key={idx} href={url.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-[#F5F7FA] px-2 py-1 rounded-md text-[#4F8FBF] hover:bg-blue-50 truncate max-w-full">
                                      <Search size={10} /> {url.title}
                                  </a>
                              ))}
                          </div>
                      </div>
                  )}

                  {msg.role === MessageRole.MODEL && (
                      <button onClick={() => playTTS(msg.text)} className="mt-3 text-[#6E747A] hover:text-[#59C3C3] transition-colors">
                          <Volume2 size={16} />
                      </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-[#E0E4EA]">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
             <button onClick={() => setMode('fast')} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${mode === 'fast' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'border-[#E0E4EA] text-[#6E747A] bg-[#F5F7FA]'}`}>
                Fast Tips
            </button>
            <button onClick={() => setMode('complex')} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${mode === 'complex' ? 'bg-[#59C3C3] text-white border-[#59C3C3]' : 'border-[#E0E4EA] text-[#6E747A] bg-[#F5F7FA]'}`}>
                Deep Analysis
            </button>
             <button onClick={() => setMode('search')} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${mode === 'search' ? 'bg-[#4F8FBF] text-white border-[#4F8FBF]' : 'border-[#E0E4EA] text-[#6E747A] bg-[#F5F7FA]'}`}>
                Vet Search
            </button>
             <button onClick={() => setMode('maps')} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${mode === 'maps' ? 'bg-[#3AAFA9] text-white border-[#3AAFA9]' : 'border-[#E0E4EA] text-[#6E747A] bg-[#F5F7FA]'}`}>
                Pet Stores
            </button>
        </div>

        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about diet, wheel size, or behavior..."
            className="flex-1 bg-[#F5F7FA] border border-[#E0E4EA] rounded-2xl px-5 py-4 text-[#1C1C1C] focus:outline-none focus:border-[#59C3C3] focus:ring-1 focus:ring-[#59C3C3] transition-all placeholder:text-gray-400"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-[#59C3C3] text-white p-4 rounded-2xl disabled:opacity-50 hover:bg-[#48b0b0] transition-colors shadow-sm"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;