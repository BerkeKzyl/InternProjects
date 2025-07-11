'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon, 
  BellIcon,
  PaperAirplaneIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAdminSignalR } from '../components/hooks/use-admin-signalr';

export default function AdminPanel() {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set()); // Okunmuş mesaj ID'leri
  
  // SignalR bağlantısı
  const { 
    messages, 
    isConnected, 
    isConnecting,
    activeCustomers,
    sendReplyToCustomer,
    customerName,
    getMessagesForCustomer,
    connectionRef,
    typingUsers,

    removeCustomer
  } = useAdminSignalR({
    hubUrl: "http://localhost:5180/chathub",
    adminName: "Destek Ekibi"
  });

  // İlk müşteriyi otomatik seç
  useEffect(() => {
    if (activeCustomers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(activeCustomers[0]);
    }
  }, [activeCustomers, selectedCustomer]);

  // Seçilen müşterinin mesajlarını okunmuş olarak işaretle
  useEffect(() => {
    if (selectedCustomer) {
      const customerMessages = getMessagesForCustomer(selectedCustomer);
      const messageIds = customerMessages.map(msg => msg.id);
      setReadMessages(prevRead => {
        const newRead = new Set(prevRead);
        messageIds.forEach(id => newRead.add(id));
        return newRead;
      });
    }
  }, [selectedCustomer, messages]);

  const handleSendReply = async () => {
    if (replyMessage.trim() && selectedCustomer) {
      await sendReplyToCustomer(selectedCustomer, replyMessage);
      setReplyMessage('');
    }
  };


  const typingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  

  const handleTyping = () => {
    console.log(' ADMIN handleTyping tetiklendi!');
    // File attachment functionality
if (!typingRef.current){
  console.log(' ADMIN Typing gönderiliyor...');

  const targetName = selectedCustomer;
  const senderName = "müşteri hizmetleri";

  connectionRef.current?.invoke("UserTyping", senderName, targetName);
  console.log(' ADMIN Hub invoke edildi!'); 
  
  typingRef.current = true;

  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  timeoutRef.current = setTimeout(() => {
  typingRef.current = false;
  }, 3000);


  }
  };
    


  const handleSuspiciousReport = async (customerName: string) => {
    console.log(' Şüpheli talep butonu tıklandı - Müşteri:', customerName);
    console.log(' SignalR bağlantı durumu:', isConnected);
    console.log(' Mevcut fonksiyonlar:', { sendReplyToCustomer, isConnected });
    
    if (confirm(`"${customerName}" adlı müşteriyi şüpheli talep olarak işaretleyip sohbeti sonlandırmak istediğinizden emin misiniz?`)) {
      console.log('✅ Kullanıcı onayladı, işlem başlatılıyor...');
      
      try {
        
 
        await sendReplyToCustomer(customerName, ` Bu sohbet yönetici tarafından şüpheli talep olarak işaretlenip sonlandırılmıştır.`);
        
        console.log('✅ Mesaj başarıyla gönderildi');
        
        // 2 saniye bekle ki müşteri mesajı görsün, sonra sohbeti kapat
        setTimeout(() => {
          // Müşteriyi seçili listeden çıkar
          if (selectedCustomer === customerName) {
            setSelectedCustomer(null);
            console.log('👤 Seçili müşteri temizlendi');
          }
          
          removeCustomer(customerName);
          
          console.log(`🏁 Şüpheli talep: ${customerName} - Sohbet tamamen sonlandırıldı`);
        }, 2000);
        
        // Başarı mesajı
        alert(`"${customerName}" şüpheli talep olarak işaretlendi. 2 saniye sonra sohbet kapatılacak.`);
        
      } catch (error) {
        console.error('❌ Şüpheli talep işlemi sırasında hata:', error);
        alert('Sohbet sonlandırılırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } else {
      console.log('❌ Kullanıcı işlemi iptal etti');
    }
  };

  // Yeni mesaj geldiğinde bildirim göster
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Sadece müşteri mesajları için bildirim göster ve seçili müşteri değilse
      if (lastMessage.sender === 'customer' && lastMessage.customerName !== selectedCustomer) {
        // Browser notification
        if (Notification.permission === 'granted') {
          const notification = new Notification(`🔔 Yeni Talep: ${lastMessage.customerName}`, {
            body: lastMessage.content.substring(0, 80) + (lastMessage.content.length > 80 ? '...' : ''),
            icon: '/favicon.ico',
            tag: 'new-message', // Aynı tag ile eski bildirimleri değiştir
            requireInteraction: true // Kullanıcı kapatana kadar duracak
          });
          
          // Bildirime tıklandığında o müşteriyi seç
          notification.onclick = () => {
            window.focus();
            setSelectedCustomer(lastMessage.customerName);
            notification.close();
          };
        } else if (Notification.permission !== 'denied') {
          // İzin iste
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              const notification = new Notification(`🔔 Yeni Talep: ${lastMessage.customerName}`, {
                body: lastMessage.content.substring(0, 80) + (lastMessage.content.length > 80 ? '...' : ''),
                icon: '/favicon.ico',
                tag: 'new-message',
                requireInteraction: true
              });
              
              notification.onclick = () => {
                window.focus();
                setSelectedCustomer(lastMessage.customerName);
                notification.close();
              };
            }
          });
        }
      }
    }
  }, [messages, selectedCustomer]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedCustomerMessages = selectedCustomer ? getMessagesForCustomer(selectedCustomer) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel - Canlı Destek</h1>
              <div className="ml-4 flex items-center">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="ml-2 text-sm text-gray-600">
                  {isConnecting ? 'Bağlanıyor...' : isConnected ? 'Bağlı' : 'Bağlantı Yok'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <BellIcon className="w-6 h-6 text-gray-500" />
                {activeCustomers.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeCustomers.length}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">D</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Destek Ekibi</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Sol Panel - Aktif Müşteriler */}
          <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Aktif Chat'ler</h3>
                <div className="flex items-center">
                  <UserGroupIcon className="w-5 h-5 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">{activeCustomers.length}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {activeCustomers.length === 0 ? (
                <div className="p-6 text-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Henüz aktif chat yok</p>
                  <p className="text-gray-400 text-xs mt-1">Müşteriler yazmaya başladığında burada görünecek</p>
                </div>
              ) : (
                <div className="p-2">
                  {activeCustomers.map((customer) => {
                    const customerMessages = getMessagesForCustomer(customer);
                    const lastMessage = customerMessages[customerMessages.length - 1];
                    const unreadCount = customerMessages.filter(msg => 
                      msg.sender === 'customer' && !readMessages.has(msg.id)
                    ).length;
                    
                    return (
                      <div
                        key={customer}
                        onClick={() => setSelectedCustomer(customer)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                          selectedCustomer === customer
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {customer}
                              </h4>
                              {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            {lastMessage && (
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-gray-600 truncate">
                                  {lastMessage.content.length > 30 
                                    ? lastMessage.content.substring(0, 30) + '...' 
                                    : lastMessage.content}
                                </p>
                                <span className="text-xs text-gray-500 ml-2">
                                  {formatTime(lastMessage.timestamp)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sağ Panel - Chat Alanı */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {selectedCustomer ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedCustomer}</h3>
                        <p className="text-sm text-gray-500">Müşteri ile konuşuyorsunuz</p>
                      </div>
                    </div>
                    
                    {/* Şüpheli Talep Butonu */}
                    <button
                      onClick={() => selectedCustomer && handleSuspiciousReport(selectedCustomer)}
                      disabled={!selectedCustomer}
                      className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>Şüpheli Talep</span>
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedCustomerMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'admin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                
                <div className="p-4 border-t border-gray-200 text-sm text-gray-500 py-3">
                {typingUsers && <p>{typingUsers} yazıyor...</p>}
                  <div className="flex space-x-2 ">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                      onKeyDown={(e) => handleTyping()}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-700 placeholder:font-medium text-gray-900 font-medium"
                      disabled={!isConnected}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || !isConnected}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                      <span>Gönder</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Müşteri Seçin
                  </h3>
                  <p className="text-gray-600">
                    Sol taraftan bir müşteri seçerek chat'e başlayın
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
