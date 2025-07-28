'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, FormEvent, useEffect, useRef } from 'react';
import { Paperclip, Mic, CornerDownLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartoonButton } from "@/components/ui/cartoon-button";
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


  // Oda yönetimi state'leri
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [roomId, setRoomId] = useState<string | null>(null);

  // Oda listesi
  const rooms = [
    { id: "genel", name: "Genel Destek", color: "bg-blue-400", icon: "💬" },
    { id: "teknik", name: "Teknik Yardım", color: "bg-green-400", icon: "🔧" },
    { id: "odeme", name: "Ödeme Sorunları", color: "bg-orange-400", icon: "💳" },
    { id: "kargo", name: "Kargo Takip", color: "bg-purple-400", icon: "📦" },
  ];

  // Oda seçimi handler
  const handleRoomClick = (roomId: string) => {
    setSelectedRoomId(roomId);
    console.log('Seçilen oda:', roomId); 
  };

  // SignalR bağlantısı
  const { 
    messages: signalRMessages, 
    connectionRef,
    typingUsers,
    isConnected, 
    isConnecting,
    sendMessage: sendSignalRMessage,
    addLocalMessage 
  } = useSignalR({
    hubUrl: "http://localhost:5180/chathub", // Hub URL'i
    userName: name
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeMessageAdded, setWelcomeMessageAdded] = useState(false);

  // Bağlantı kurulduğunda hoş geldin mesajı ekle
  useEffect(() => {
    if (isConnected && !welcomeMessageAdded && selectedRoomId) {
      const selectedRoom = rooms.find(r => r.id === selectedRoomId);
      addLocalMessage({
        id: `welcome-${Date.now()}`,
        content: `${selectedRoom?.name} odasına hoş geldiniz! Size nasıl yardımcı olabilirim?`,
        sender: "support",
        timestamp: new Date(),
        isOwn: false
      });
      setWelcomeMessageAdded(true);
    }
  }, [isConnected, welcomeMessageAdded, selectedRoomId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    const messageContent = input.trim();
    
    setInput(""); // Input'u hemen temizle
    setIsLoading(true);

    try {
      // SignalR ile mesaj gönder
      await sendSignalRMessage(messageContent, name, roomId??"");
      console.log('Mesaj gönderildi:', messageContent);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const typingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = () => {
    console.log(' handleTyping tetiklendi!');
    
    if (!typingRef.current){
      console.log(' Typing gönderiliyor...');

      const targetName = selectedRoomId??"";
      const senderName = name;

      connectionRef.current?.invoke("UserTyping", senderName, targetName, roomId);
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
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Canlı Destek Sistemi</h1>
              <div className="ml-4 flex items-center">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="ml-2 text-sm text-gray-400">
                  {isConnecting ? 'Bağlanıyor...' : isConnected ? 'Bağlı' : 'Bağlantı Yok'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-gray-300">{name}</span>
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          
          {/* Sol Panel - Destek Odaları */}
          <div className="w-80 bg-gray-900 rounded-lg shadow-sm border border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white mb-2">🏠 Destek Odaları</h3>
              <p className="text-gray-400 text-sm">Size uygun destek odasını seçin</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="w-full">
                  <CartoonButton
                  
                    
                    label={`${room.icon} ${room.name}`}
                    color={selectedRoomId === room.id ? "bg-cyan-500" : room.color}
                    disabled={false}
                    onClick={() =>
                       {
                        handleRoomClick(room.id)
                        setRoomId(room.id)
                        console.log('Oda seçildi:', room.id);
                        console.log('Oda seçildi1:', roomId);
                        connectionRef.current?.invoke("JoinRoom", room.id);
                        setSelectedRoomId(room.id);
                        console.log('Oda seçildi:', room.id); 

                    }



                    }
                  />
                  <div className="mt-1 text-center">
                    <p className="text-gray-500 text-xs">
                      👥 {Math.floor(Math.random() * 20) + 5} kişi
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Alt bilgi */}
            <div className="p-4 border-t border-gray-700">
              <div className="text-xs text-gray-500 space-y-1">
                <p>📞 <strong>Destek:</strong> 0850 123 45 67</p>
                <p>🕒 <strong>Saatler:</strong> 09:00 - 18:00</p>
              </div>
            </div>
          </div>

          {/* Sağ Panel - Chat Alanı */}
          <div className="flex-1 bg-gray-900 rounded-lg shadow-sm border border-gray-700 flex flex-col">
            {selectedRoomId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{rooms.find(r => r.id === selectedRoomId)?.icon}</span>
                      <div>
                        <h3 className="font-medium text-white">{rooms.find(r => r.id === selectedRoomId)?.name}</h3>
                        <p className="text-sm text-gray-400">Sorununuzu çözmek için buradayız.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  <ChatMessageList>
                    {signalRMessages.map((message) => (
                      <ChatBubble
                        key={message.id}
                        variant={message.isOwn ? "sent" : "received"}
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
                        <ChatBubbleMessage variant={message.isOwn ? "sent" : "received"}>
                           <p className="text-sm">
                              <span className="font-bold text-base">
                                  {message.sender}:
                              </span> {message.content}
                            </p>
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

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-700">
                  {typingUsers && <p className="text-gray-500 text-sm mb-2">{typingUsers} yazıyor...</p>}
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
                        onClick={handleSubmit}
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Destek Odasını Seçin
                  </h3>
                  <p className="text-gray-400">
                    Sol taraftan bir destek odası seçerek sohbete başlayın
                  </p>
                </div>
              </div>
            )}
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