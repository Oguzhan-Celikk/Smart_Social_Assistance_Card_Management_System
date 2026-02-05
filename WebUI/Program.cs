using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

// MVC desteklenmesi
builder.Services.AddControllersWithViews();

// IHttpClientFactory için servis ekle
builder.Services.AddHttpClient();

// Cookie tabanlı Authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login";          // Login sayfası
        options.AccessDeniedPath = "/Login";   // Yetkisiz erişimlerde yönlendirme
        options.ExpireTimeSpan = TimeSpan.FromMinutes(10);  // İstersen süresini kısaltabilirsin
        options.SlidingExpiration = false;

        options.Cookie.IsEssential = true;
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.None; // Geliştirme için https yoksa None yap
        options.Cookie.MaxAge = null;  // Tarayıcı kapandığında cookie silinsin
    });

// Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
    options.AddPolicy("UserOnly", policy => policy.RequireRole("user"));
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Login}/{action=Index}/{id?}");

app.Run();