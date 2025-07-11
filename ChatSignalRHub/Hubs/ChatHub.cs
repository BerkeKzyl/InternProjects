using Microsoft.AspNetCore.SignalR;

namespace ChatSignalRHub.Hubs
{
    public class ChatHub : Hub
    {

        public async Task UserTyping(string senderName, string targetName)
        {
            Console.WriteLine($"kullanıcı yazıyor - User: {senderName}");
            
            
            await Clients.All.SendAsync("ReceiveTyping", senderName, targetName);
            
            
        }











        public async Task SendMessage(string user, string message)
        {
            Console.WriteLine($"Mesaj alındı - User: {user}, Message: {message}");
            
            var messageId = Guid.NewGuid().ToString();
            var timestamp = DateTime.Now;
            
            if (user.StartsWith("admin_"))
            {
                Console.WriteLine("Admin mesajı - müşterilere gönderiliyor");
                await Clients.All.SendAsync("ReceiveMessage", user, message, messageId, timestamp);


            }
            else
            {
          
                Console.WriteLine("Müşteri mesajı - admin'lere gönderiliyor");
                await Clients.All.SendAsync("ReceiveMessage", user, message, messageId, timestamp);

            }
        }
        
        // Client bağlandığında
        public override async Task OnConnectedAsync()
        {
            // URL'den kullanıcı adını al
            var userName = Context.GetHttpContext()?.Request.Query["user"].ToString();
            
            Console.WriteLine($"Client bağlandı: {Context.ConnectionId}, User: {userName}");
            
            // Eğer kullanıcı adı varsa hoş geldin mesajı gönder
            if (!string.IsNullOrEmpty(userName))
            {
                await Clients.Client(Context.ConnectionId).SendAsync(
                    "ReceiveMessage", 
                    "Sistem", 
                    $"Merhaba {userName}, sana nasıl yardımcı olabilirim?",
                    Guid.NewGuid().ToString(), 
                    DateTime.Now
                );
            }
            
            await base.OnConnectedAsync();
        }
        
        // Client bağlantısı kesildiğinde  
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine($"Client bağlantısı kesildi: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}