using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using WebApplication1.DbContexts;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.National_ID == request.National_ID && u.Password == request.Password);

            if (user == null)
                return Unauthorized("Hatalı kimlik veya şifre");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.User_ID.ToString()),
                new Claim("Citizen_ID", user.Citizen_ID.ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToLower())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token), role = user.Role });
        }
    }

    public class LoginRequest
    {
        public string National_ID { get; set; }
        public string Password { get; set; }
    }
}