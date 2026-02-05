using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using System.Text.Json;
using System.Text;
using System.Net.Http;
using System.Threading.Tasks;

public class LoginController : Controller
{
    private readonly IHttpClientFactory _httpClientFactory;

    public LoginController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public IActionResult Index()
    {
        if (User.Identity != null && User.Identity.IsAuthenticated)
        {
            var roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();

            if (roles.Contains("admin"))
                return RedirectToAction("Index", "Admin");
            else if (roles.Contains("user"))
                return RedirectToAction("Index", "User");
            else
                return View(); // Yetkisiz rol varsa login sayfası göster
        }

        return View();
    }


    [HttpPost]
    public async Task<IActionResult> Index(string National_ID, string Password)
    {
        var client = _httpClientFactory.CreateClient();

        var loginData = new
        {
            National_ID = National_ID,
            Password = Password
        };

        var content = new StringContent(JsonSerializer.Serialize(loginData), Encoding.UTF8, "application/json");

        var response = await client.PostAsync("http://localhost:5032/api/auth/login", content);

        if (!response.IsSuccessStatusCode)
        {
            ModelState.AddModelError("", "Giriş başarısız: Kimlik veya şifre hatalı.");
            return View();
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseContent);
        var root = jsonDoc.RootElement;

    string token = root.GetProperty("token").GetString() ?? string.Empty;
    // Rolü case-insensitive olarak işle (API 'Admin'/'User' dönebilir, biz 'admin'/'user' bekliyoruz)
    string role = (root.GetProperty("role").GetString() ?? string.Empty).Trim().ToLowerInvariant();
        // Varsayılan gösterilecek isim (istek başarısız olursa National_ID kalır)
        string displayName = National_ID;

        try
        {
            // JWT içinden Citizen_ID al (Admin & User için ortak)
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var citizenId = jwtToken.Claims.FirstOrDefault(c => c.Type == "Citizen_ID")?.Value;

            if (!string.IsNullOrEmpty(citizenId))
            {
                var apiClient = _httpClientFactory.CreateClient();
                apiClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                if (role == "user")
                {
                    // Kullanıcı kendi citizen kaydını alabilir
                    var citizenResp = await apiClient.GetAsync("http://localhost:5032/api/user/citizen");
                    if (citizenResp.IsSuccessStatusCode)
                    {
                        var citizenJson = await citizenResp.Content.ReadAsStringAsync();
                        using var citizenDoc = JsonDocument.Parse(citizenJson);
                        if (citizenDoc.RootElement.TryGetProperty("fullName", out var fnProp) && fnProp.ValueKind == JsonValueKind.String)
                        {
                            var fn = fnProp.GetString();
                            if (!string.IsNullOrWhiteSpace(fn)) displayName = fn;
                        }
                        else if (citizenDoc.RootElement.TryGetProperty("FullName", out var fnProp2) && fnProp2.ValueKind == JsonValueKind.String)
                        {
                            var fn = fnProp2.GetString();
                            if (!string.IsNullOrWhiteSpace(fn)) displayName = fn;
                        }
                    }
                }
                else if (role == "admin")
                {
                    // Önce direkt kendi citizen kaydını almaya çalış (yeni endpoint)
                    var selfCitizenResp = await apiClient.GetAsync("http://localhost:5032/api/admin/citizen");
                    bool gotSelf = false;
                    if (selfCitizenResp.IsSuccessStatusCode)
                    {
                        var selfJson = await selfCitizenResp.Content.ReadAsStringAsync();
                        using var selfDoc = JsonDocument.Parse(selfJson);
                        if (selfDoc.RootElement.TryGetProperty("FullName", out var fnProp) && fnProp.ValueKind == JsonValueKind.String)
                        {
                            var fn = fnProp.GetString();
                            if (!string.IsNullOrWhiteSpace(fn)) { displayName = fn; gotSelf = true; }
                        }
                        else if (selfDoc.RootElement.TryGetProperty("fullName", out var fnProp2) && fnProp2.ValueKind == JsonValueKind.String)
                        {
                            var fn = fnProp2.GetString();
                            if (!string.IsNullOrWhiteSpace(fn)) { displayName = fn; gotSelf = true; }
                        }
                    }
                    // Fallback: tüm citizens listesinden bul
                    if (!gotSelf)
                    {
                        var citizensResp = await apiClient.GetAsync("http://localhost:5032/api/admin/citizens");
                        if (citizensResp.IsSuccessStatusCode)
                        {
                            var citizensJson = await citizensResp.Content.ReadAsStringAsync();
                            using var citizensDoc = JsonDocument.Parse(citizensJson);
                            if (citizensDoc.RootElement.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var item in citizensDoc.RootElement.EnumerateArray())
                                {
                                    bool match = false;
                                    if (item.TryGetProperty("National_ID", out var natProp) && natProp.GetString() == National_ID)
                                        match = true;
                                    else if (item.TryGetProperty("Citizen_ID", out var cIdProp) && cIdProp.GetInt32().ToString() == citizenId)
                                        match = true;

                                    if (match)
                                    {
                                        string? fn = null;
                                        if (item.TryGetProperty("FullName", out var fullNameProp) && fullNameProp.ValueKind == JsonValueKind.String)
                                            fn = fullNameProp.GetString();
                                        else if (item.TryGetProperty("fullName", out var fullNameProp2) && fullNameProp2.ValueKind == JsonValueKind.String)
                                            fn = fullNameProp2.GetString();
                                        if (!string.IsNullOrWhiteSpace(fn)) displayName = fn!;
                                        break;
                                    }
                                }
                            }
                        }
                        // Ek fallback: Hala değişmediyse Users tablosundan Citizen_ID eşleşmesi dener
                        if (displayName == National_ID)
                        {
                            try
                            {
                                var usersResp = await apiClient.GetAsync("http://localhost:5032/api/admin/users");
                                if (usersResp.IsSuccessStatusCode)
                                {
                                    var usersJson = await usersResp.Content.ReadAsStringAsync();
                                    using var usersDoc = JsonDocument.Parse(usersJson);
                                    int mappedCitizenId = 0;
                                    if (usersDoc.RootElement.ValueKind == JsonValueKind.Array)
                                    {
                                        foreach (var u in usersDoc.RootElement.EnumerateArray())
                                        {
                                            if (u.TryGetProperty("National_ID", out var uNat) && uNat.GetString() == National_ID)
                                            {
                                                if (u.TryGetProperty("Citizen_ID", out var uCit) && uCit.ValueKind == JsonValueKind.Number)
                                                    mappedCitizenId = uCit.GetInt32();
                                                break;
                                            }
                                        }
                                    }
                                    if (mappedCitizenId != 0)
                                    {
                                        var citizensResp2 = await apiClient.GetAsync("http://localhost:5032/api/admin/citizens");
                                        if (citizensResp2.IsSuccessStatusCode)
                                        {
                                            var citizensJson2 = await citizensResp2.Content.ReadAsStringAsync();
                                            using var citizensDoc2 = JsonDocument.Parse(citizensJson2);
                                            if (citizensDoc2.RootElement.ValueKind == JsonValueKind.Array)
                                            {
                                                foreach (var item in citizensDoc2.RootElement.EnumerateArray())
                                                {
                                                    if (item.TryGetProperty("Citizen_ID", out var cIdProp2) && cIdProp2.ValueKind == JsonValueKind.Number && cIdProp2.GetInt32() == mappedCitizenId)
                                                    {
                                                        string? fn = null;
                                                        if (item.TryGetProperty("FullName", out var fullNameProp) && fullNameProp.ValueKind == JsonValueKind.String)
                                                            fn = fullNameProp.GetString();
                                                        else if (item.TryGetProperty("fullName", out var fullNameProp2) && fullNameProp2.ValueKind == JsonValueKind.String)
                                                            fn = fullNameProp2.GetString();
                                                        if (!string.IsNullOrWhiteSpace(fn)) displayName = fn!;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            catch { /* sessiz fallback */ }
                        }
                    }
                }
            }
        }
        catch
        {
            // Sessizce yut – displayName National_ID olarak kalır.
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, displayName ?? string.Empty),
            new Claim(ClaimTypes.Role, role ?? string.Empty),
            new Claim("JWT", token ?? string.Empty)
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        if (role == "admin")
            return RedirectToAction("Index", "admin");
        else
            return RedirectToAction("Index", "user");
    }

    [HttpGet]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Index");
    }
}
