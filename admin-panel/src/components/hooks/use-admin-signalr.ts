import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

interface Message {
  id: string;
  content: string;
  sender: string;
  customerName: string; // Hangi müşteriden geldiği
  timestamp: Date;
}

interface UseAdminSignalRProps {
  hubUrl: string;
  adminName: string;
}

export function useAdminSignalR({ hubUrl, adminName }: UseAdminSignalRProps) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string | null>(null);
  const [activeCustomers, setActiveCustomers] = useState<string[]>([]);

  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    console.log('Admin SignalR bağlantısı kuruluyor...');
    
    // Eski connection varsa önce temizle
    if (connectionRef.current) {
      console.log('Eski admin connection temizleniyor...');
      connectionRef.current.stop();
      connectionRef.current = null;
    }

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${hubUrl}?user=admin_${encodeURIComponent(adminName)}`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
  
    console.log('Admin connection objesi oluşturuldu:', newConnection);
    
    setIsConnecting(true);

    newConnection.start()
      .then(() => {
        console.log('Admin SignalR bağlantısı başarılı!');
        setIsConnected(true);
        setIsConnecting(false);
        setConnection(newConnection);
        connectionRef.current = newConnection;

        // Hub'dan gelen müşteri mesajlarını dinle
        newConnection.on("ReceiveMessage", (user, message, messageId, timestamp, roomId) => {
          console.log('Admin - Yeni mesaj geldi:', { user, message, messageId, timestamp });
          
          // Eğer mesaj admin'den değilse (müşteri mesajı), listeye ekle
          if (!user.startsWith('admin_')) {
            const newMessage: Message = {
              id: messageId,
              content: message,
              sender: "customer", // Müşteriden gelen mesaj
              customerName: user,
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

            // Yeni müşteriyi aktif listeye ekle
            setActiveCustomers(prevCustomers => {
              if (!prevCustomers.includes(user)) {
                return [...prevCustomers, user];
              }
              return prevCustomers;
            });
          }
        });

        newConnection.on("ReceiveTyping", (senderName, targetName) => {
          console.log('Admin - kullanıcı yazıyor:', { senderName, targetName });
          setTypingUsers(senderName);

          setTimeout(() => {
            setTypingUsers(null);
          }, 3000);
        });
      })
      .catch((error) => {
        console.error('Admin bağlantı hatası:', error);
        setIsConnecting(false);
        setIsConnected(false);
      });

    // Cleanup function
    return () => {
      console.log('Admin connection cleanup çalıştı');
      if (newConnection) {
        newConnection.off("ReceiveMessage");
        newConnection.off("ReceiveTyping");
        newConnection.stop();
      }
      if (connectionRef.current) {
        connectionRef.current.off("ReceiveMessage");
        connectionRef.current.off("ReceiveTyping");
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [hubUrl, adminName]);

  // Admin mesajı gönderme fonksiyonu
  const sendReplyToCustomer = async (customerName: string, message: string, roomId: string) => {
    console.log('Admin cevap gönderiyor:', { customerName, message });
    
    if (!connectionRef.current || !isConnected) {
      console.error('Bağlantı yok! Admin mesajı gönderilemedi.');
      return;
    }

    try {
      // Hub'daki "SendMessage" metodunu çağır (admin adı ile)
      await connectionRef.current.invoke("SendMessage", `admin_${adminName}`, message, roomId);
      console.log('Admin mesajı hub\'a gönderildi!');
      
      // Kendi mesajını da listeye ekle
      const adminMessage: Message = {
        id: `admin_${Date.now()}`,
        content: message,
        sender: "admin",
        customerName: customerName,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, adminMessage]);
    } catch (error) {
      console.error('Admin mesaj gönderme hatası:', error);
    }
  };

  // Belirli müşteriye ait mesajları getir
  const getMessagesForCustomer = (customerName: string) => {
    return messages.filter(msg => msg.customerName === customerName);
  };

  // Müşteriyi aktif listeden çıkar (şüpheli talep vs.)
  const removeCustomer = (customerName: string) => {
    console.log('🗑️ Müşteri aktif listeden çıkarılıyor:', customerName);
    setActiveCustomers(prev => prev.filter(customer => customer !== customerName));
    
    // O müşteriye ait mesajları da temizle (opsiyonel)
    setMessages(prev => prev.filter(msg => msg.customerName !== customerName));
  };

  return {
    messages,
    isConnected,
    connectionRef,
    isConnecting,
    activeCustomers,
    typingUsers, // Typing bilgisini de return et
    sendReplyToCustomer,
    getMessagesForCustomer,
    removeCustomer,
    disconnect: () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    }
  };
} 