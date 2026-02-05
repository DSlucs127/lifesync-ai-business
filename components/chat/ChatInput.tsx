import React, { useRef, useEffect } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';
import { Button } from '../Button';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isListening: boolean;
  hasAttachments: boolean;
  onToggleListening: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e?: React.FormEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isLoading,
  isListening,
  hasAttachments,
  onToggleListening,
  onFileSelect,
  onSend
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to allow shrinking
      textareaRef.current.style.height = 'auto';
      // Set new height based on scrollHeight
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-3 border-t border-bdr bg-surface">
      <form onSubmit={onSend} className="flex items-end gap-2">
        
        {/* File Input */}
        <input 
            type="file" 
            ref={fileInputRef}
            onChange={onFileSelect}
            className="hidden" 
            accept="image/*,application/pdf,.csv,.xlsx" 
        />
        
        {/* Botões de ação (Anexo e Microfone) fixos na parte inferior */}
        <div className="flex gap-1 pb-1">
            <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-txt-secondary hover:text-primary hover:bg-surface-hover rounded-full transition-colors"
                title="Anexar arquivo"
                aria-label="Anexar arquivo"
            >
                <Paperclip className="w-5 h-5" />
            </button>

            <button 
                type="button"
                onClick={onToggleListening}
                className={`p-2 rounded-full transition-colors ${
                    isListening 
                    ? 'text-red-500 bg-red-50 animate-pulse' 
                    : 'text-txt-secondary hover:text-primary hover:bg-surface-hover'
                }`}
                title="Digitar por voz"
                aria-label="Digitar por voz"
            >
                <Mic className="w-5 h-5" />
            </button>
        </div>

        <div className="flex-1 relative">
            <textarea
                ref={textareaRef}
                rows={1}
                className="w-full rounded-2xl border border-bdr bg-surface-subtle shadow-sm focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary px-4 py-3 text-base md:text-sm transition-all resize-none overflow-y-auto min-h-[44px] max-h-[120px] text-txt-primary placeholder:text-txt-secondary"
                placeholder={isListening ? "Ouvindo..." : "Digite sua mensagem..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ lineHeight: '1.5' }}
            />
        </div>
        
        <div className="pb-1">
            <Button 
                type="submit" 
                disabled={isLoading || (!input.trim() && !hasAttachments)} 
                size="sm" 
                className="rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-md bg-primary hover:opacity-90"
                aria-label="Enviar mensagem"
            >
                <Send className="w-4 h-4 text-white" />
            </Button>
        </div>
      </form>
    </div>
  );
};