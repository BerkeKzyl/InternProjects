'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, FormEvent, useEffect, useRef } from 'react';
import { Paperclip, Mic, CornerDownLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { ChatInput } from "@/components/ui/chat-input";
import { useSignalR } from "@/components/hooks/use-signalr";

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get('name') || 'Kullanıcı';

  
  // SignalR bağlantısı
  const { 
    messages: signalRMessages, 
    connectionRef,
    typingUsers,
    isConnected, 
    isConnecting,
    sendMessage: sendSignalRMessage,
    addLocalMessage // Yerel mesaj ekleme fonksiyonu
  } = useSignalR({
    hubUrl: "http://localhost:5180/chathub", // Hub URL'i
    userName: name
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeMessageAdded, setWelcomeMessageAdded] = useState(false);

  // Bağlantı kurulduğunda hoş geldin mesajı ekle
  useEffect(() => {
    if (isConnected && !welcomeMessageAdded) {
      addLocalMessage({
        id: `welcome-${Date.now()}`,
        content: `En bilgili arkadaşımı hemen sana yönlendiriyorum, sen o sırada sorununu yazmaya başlayabilirsin.`,
        sender: "support",
        timestamp: new Date()
      });
      setWelcomeMessageAdded(true);
    }
  }, [isConnected, welcomeMessageAdded]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    const messageContent = input.trim();
    
    setInput(""); // Input'u hemen temizle
    setIsLoading(true);

    try {
      // SignalR ile mesaj gönder
      await sendSignalRMessage(messageContent);
      console.log('Mesaj gönderildi:', messageContent);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const typingRef = useRef(false);
  const timeoutRef = useRef(null);

const handleTyping = () => {

  console.log(' handleTyping tetiklendi!');
  
if (!typingRef.current){
  console.log(' Typing gönderiliyor...');

const targetName = "müşteri hizmetleri";
const senderName = name;

connectionRef.current?.invoke("UserTyping", senderName, targetName);
typingRef.current = true;

console.log(' Hub invoke edildi!');

if (timeoutRef.current) {
  clearTimeout(timeoutRef.current);
}

timeoutRef.current = setTimeout(() => {
  typingRef.current = false;
}, 3000);

}
};
    


  const handleMicrophoneClick = () => {
    // Voice recording functionality
  };

  const handleEndChat = async () => {
    if (confirm('Talebi sonlandırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await sendSignalRMessage(`${name} sohbeti sonlandırdı.`);
        
        setTimeout(() => {

          router.push('/');
        }, 500);
      } catch (error) {
        console.error('Sonlandırma mesajı gönderilemedi:', error);

        router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gray-900 rounded-lg p-6 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">Hoş Geldin, {name}!</h1>
              <p className="text-gray-400">Canlı destek sistemi - Size yardımcı olmaya hazırız.</p>
            </div>
            <Button
              onClick={handleEndChat}
              variant="outline"
              size="sm"
              className="bg-red-600/10 border-red-600 text-red-400 hover:bg-red-600/20 hover:text-red-300 flex items-center gap-2"
            >
              <X className="size-4" />
              Talebi Sonlandır
            </Button>
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="h-[500px] border border-gray-700 bg-gray-900 rounded-lg flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChatMessageList>
              {signalRMessages.map((message) => (
                <ChatBubble
                  key={message.id}
                  variant={message.sender === "user" ? "sent" : "received"}
                >
                  <ChatBubbleAvatar
                    className="h-8 w-8 shrink-0"
                    src={
                      message.sender === "user"
                        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                    }
                    fallback={message.sender === "user" ? name.charAt(0).toUpperCase() : "AI"}
                  />
                  <ChatBubbleMessage
                    variant={message.sender === "user" ? "sent" : "received"}
                  >
                    {message.content}
                  </ChatBubbleMessage>
                </ChatBubble>
              ))}

              {isLoading && (
                <ChatBubble variant="received">
                  <ChatBubbleAvatar
                    className="h-8 w-8 shrink-0"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                    fallback="AI"
                  />
                  <ChatBubbleMessage isLoading />
                </ChatBubble>
              )}
            </ChatMessageList>
          </div>

          <div className="p-4 border-t border-gray-700">
         {typingUsers && <span className="text-gray-500">{typingUsers} yazıyor..</span>}
            <form
              onSubmit={handleSubmit}
              className="relative rounded-lg border border-gray-600 bg-gray-800 focus-within:ring-1 focus-within:ring-cyan-400 p-1"
            >
              <ChatInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mesajınızı yazın..."
                onKeyDown={handleTyping}
                className="min-h-12 resize-none rounded-lg bg-gray-800 border-0 p-3 shadow-none focus-visible:ring-0 text-white placeholder:text-gray-400"
              />
              <div className="flex items-center p-3 pt-0 justify-between">
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                   // onClick={handleAttachFile}
                    className="text-gray-400 hover:text-white"
                  >
                    <Paperclip className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={handleMicrophoneClick}
                    className="text-gray-400 hover:text-white"
                  >
                    <Mic className="size-4" />
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  size="sm" 
                  className="ml-auto gap-1.5 bg-cyan-600 hover:bg-cyan-700"
                  disabled={!input.trim() || isLoading}
                >
                  Gönder
                  <CornerDownLeft className="size-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-4 bg-gray-900 rounded-lg p-4">
          <div className="text-sm text-gray-400">
            <p className="mb-2">📞 <strong>Destek Hattı:</strong> 0850 123 45 67</p>
            <p className="mb-2">📧 <strong>E-posta:</strong> destek@lcwaikiki.com</p>
            <p>🕒 <strong>Çalışma Saatleri:</strong> 09:00 - 18:00 (Pazartesi-Cuma)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Yükleniyor...</div>}>
      <ChatContent />
    </Suspense>
  );
} 