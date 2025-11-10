import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { Ticket } from '../../types';
import { GoogleGenAI, Chat } from "@google/genai";

interface AIChatFlyoutProps {
    isOpen: boolean;
    onClose: () => void;
    data: Ticket[];
}

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const AIChatFlyout: React.FC<AIChatFlyoutProps> = ({ isOpen, onClose, data }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize or reset chat when data changes or panel opens
    useEffect(() => {
        if (isOpen) {
            const dataSample = JSON.stringify(data.slice(0, 50)); // smaller sample for context

            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: [
                    {
                        role: 'user',
                        parts: [{ text: `Here is a sample of the data you will be analyzing, in JSON format. All your answers must be based solely on this data. Data: ${dataSample}` }],
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'Entendido. Estoy listo para analizar los datos y responder tus preguntas.' }],
                    },
                ],
                config: {
                    systemInstruction: 'Eres un analista de datos experto que asiste a un usuario. Tus respuestas deben ser claras, concisas, en español y basarse estrictamente en los datos proporcionados. No inventes información.',
                },
            });
            setChat(newChat);
            setMessages([{
                role: 'model',
                content: '¡Hola! Soy tu asistente de IA. ¿Qué te gustaría saber sobre tus datos?'
            }]);
        }
    }, [isOpen, data]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: input });
            const modelMessage: ChatMessage = { role: 'model', content: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage: ChatMessage = { role: 'model', content: 'Lo siento, ocurrió un error al procesar tu pregunta. Por favor, inténtalo de nuevo.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <div className={`fixed bottom-6 right-8 w-full max-w-md bg-card rounded-xl shadow-2xl border border-gray-200 z-50 transform transition-all duration-300 ease-out
            ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
        >
            <div className="flex flex-col h-[60vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-primary rounded-t-xl">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-white" />
                        Asistente IA
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full text-white hover:bg-black/20">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-2 rounded-2xl ${
                                msg.role === 'user' 
                                ? 'bg-primary text-white rounded-br-none' 
                                : 'bg-gray-200 text-text-primary rounded-bl-none'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                             <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-200 text-text-primary rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                                </div>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white rounded-b-xl">
                     <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                            placeholder="Escribe tu pregunta..."
                            className="w-full p-3 pr-12 bg-white border border-gray-300 rounded-full focus:ring-primary focus:border-primary disabled:bg-gray-100"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSendMessage} 
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-white hover:bg-accent disabled:bg-gray-300"
                            aria-label="Enviar pregunta"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatFlyout;