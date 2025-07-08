import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
}

interface UseSignalRProps {
  hubUrl: string;
  userName: string;
}

export function useSignalR({ hubUrl, userName }: UseSignalRProps) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    console.log('useEffect çalıştı - connection kuruluyor...');
    
    // Eski connection varsa önce temizle
    if (connectionRef.current) {
      console.log('Eski connection temizleniyor...');
      connectionRef.current.stop();
      connectionRef.current = null;
    }

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${hubUrl}?user=${encodeURIComponent(userName)}`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
  
    console.log('Connection objesi oluşturuldu:', newConnection);
    
    setIsConnecting(true);

    newConnection.start()
      .then(() => {
        console.log('SignalR bağlantısı başarılı!');
        setIsConnected(true);
        setIsConnecting(false);
        setConnection(newConnection);
        connectionRef.current = newConnection;

        // Hub'dan gelen mesajları dinle
        newConnection.on("ReceiveMessage", (user, message, messageId, timestamp) => {
          console.log('Yeni mesaj geldi:', { user, message, messageId, timestamp });
          
          const newMessage: Message = {
            id: messageId,
            content: message,
            sender: user === userName ? "user" : "support", // Kendi mesajı mı yoksa destek ekibinden mi?
            timestamp: new Date(timestamp)
          };
          
          setMessages(prevMessages => {
            // Aynı ID'li mesaj varsa ekleme
            const exists = prevMessages.find(msg => msg.id === messageId);
            if (exists) {
              console.log('Mesaj zaten mevcut, eklenmedi:', messageId);
              return prevMessages;
            }
            
            return [...prevMessages, newMessage];
          });
        });
      })
      .catch((error) => {
        console.error('Bağlantı hatası:', error);
        setIsConnecting(false);
        setIsConnected(false);
      });

    // Cleanup function
    return () => {
      console.log('Connection cleanup çalıştı');
      if (newConnection) {
        newConnection.off("ReceiveMessage"); // Event listener'ı kaldır
        newConnection.stop();
      }
      if (connectionRef.current) {
        connectionRef.current.off("ReceiveMessage"); // Event listener'ı kaldır
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [hubUrl, userName]);

  // Mesaj gönderme fonksiyonu
  const sendMessage = async (message: string, customUserName?: string) => {
    console.log('sendMessage çağrıldı:', message);
    
    if (!connectionRef.current || !isConnected) {
      console.error('Bağlantı yok! Mesaj gönderilemedi.');
      return;
    }

    try {
      // Hub'daki "SendMessage" metodunu çağır (userName, message)
      const senderName = customUserName || userName;
      await connectionRef.current.invoke("SendMessage", senderName, message);
      console.log('Mesaj hub\'a gönderildi!');
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  };

  // Yerel mesaj ekleme fonksiyonu
  const addLocalMessage = (message: Message) => {
    setMessages(prevMessages => {
      // Aynı ID'li mesaj varsa ekleme
      const exists = prevMessages.find(msg => msg.id === message.id);
      if (exists) {
        console.log('Mesaj zaten mevcut, eklenmedi:', message.id);
        return prevMessages;
      }
      
      return [...prevMessages, message];
    });
  };

  return {
    messages,
    isConnected,
    isConnecting,
    sendMessage,
    addLocalMessage,
    disconnect: () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    }
  };
}