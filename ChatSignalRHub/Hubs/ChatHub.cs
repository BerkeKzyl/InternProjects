using Microsoft.AspNetCore.SignalR;

namespace ChatSignalRHub.Hubs
{
    public class ChatHub : Hub
    {

        public async Task UserTyping(string senderName, string targetName, string roomId)
        {
            Console.WriteLine($"kullanıcı yazıyor - User: {senderName}");
            
            
            await Clients.Group(roomId).SendAsync("ReceiveTyping", senderName, targetName, roomId);
            
            
        }


        public async Task JoinRoom(string roomId)
        {
            Console.WriteLine($"Kullanıcı {Context.ConnectionId} - {roomId} odasına katıldı");
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await Clients.Caller.SendAsync("JoinedRoom", roomId);
        }




        public async Task SendMessage(string user, string message, string roomId)
        {
            Console.WriteLine($"Mesaj alındı - User: {user}, Message: {message}");

            var messageId = Guid.NewGuid().ToString();
            var timestamp = DateTime.Now;
            try {
                if (user.StartsWith("admin_"))
                {
                    Console.WriteLine("Admin mesajı - müşterilere gönderiliyor");
                    await Clients.Group(roomId).SendAsync("ReceiveMessage", user, message, messageId, timestamp, roomId);


                }
                else
                {
                    Console.WriteLine("Müşteri mesajı - admin'lere gönderiliyor");
                    await Clients.Group(roomId).SendAsync("ReceiveMessage", user, message, messageId, timestamp, roomId);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Mesaj gönderilirken hata oluştu: {ex.Message}");
                await Clients.Caller.SendAsync("ReceiveError", "Mesaj gönderilirken bir hata oluştu.");
            }
        }


        // Client bağlandığında
        public override async Task OnConnectedAsync()
        {
            // URL'den kullanıcı adını al
            var userName = Context.GetHttpContext()?.Request.Query["user"].ToString();
            
            Console.WriteLine($"Client bağlandı: {Context.ConnectionId}, User: {userName}");
            

            
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