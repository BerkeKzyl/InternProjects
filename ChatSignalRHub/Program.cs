using ChatSignalRHub.Hubs;

var builder = WebApplication.CreateBuilder(args);

// SignalR servisini ekle
builder.Services.AddSignalR();

// CORS politikası ekle (ask-web ve admin-panel için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontends", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002") // ask-web ve admin-panel
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // SignalR için gerekli
    });
});

var app = builder.Build();

// Development ortamında detaylı hata sayfaları
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// CORS'u aktif et
app.UseCors("AllowFrontends");

// SignalR Hub endpoint'ini map et
app.MapHub<ChatHub>("/chathub");

// Ana sayfa endpoint'i (test için)
app.MapGet("/", () => "SignalR Chat Hub çalışıyor! 🚀");

Console.WriteLine("SignalR Hub başlatılıyor...");
Console.WriteLine("Hub URL: http://localhost:5000/chathub");
Console.WriteLine("Test URL: http://localhost:5000");

app.Run();
