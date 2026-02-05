using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1.DbContexts;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Authorize(Roles = "user")]  // Sadece "user" rolündeki kullanıcılar erişir
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Kullanıcının kendi temel bilgilerini getirir (Users tablosundan)
        [HttpGet("profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.User_ID == userId);

            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            return Ok(user);
        }

        // Kullanıcının bağlı olduğu citizen bilgileri
        [HttpGet("citizen")]
        public async Task<IActionResult> GetMyCitizenInfo()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            // User tablosundaki Citizen_ID'yi al
            var citizenId = await _context.Users
                .Where(u => u.User_ID == userId)
                .Select(u => u.Citizen_ID)
                .FirstOrDefaultAsync();

            if (citizenId == 0)
                return NotFound("Citizen bilgisi bulunamadı.");

            var citizen = await _context.Citizens
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Citizen_ID == citizenId);

            if (citizen == null)
                return NotFound("Citizen bilgisi bulunamadı.");

            // Normalize gender to a single uppercase character (M/F) to handle char(1) and padded values
            var g = (citizen.Gender ?? string.Empty).Trim();
            if (!string.IsNullOrEmpty(g))
            {
                // If it's longer text, map common Turkish/English words
                var gl = g.ToLowerInvariant();
                if (gl.StartsWith("erk")) g = "M";
                else if (gl.StartsWith("kad")) g = "F";
                else if (gl.StartsWith("m")) g = "M";
                else if (gl.StartsWith("f")) g = "F";
                else if (gl.StartsWith("e")) g = "M"; // erkek
                else if (gl.StartsWith("k")) g = "F"; // kadın
                else g = g.Substring(0, 1).ToUpperInvariant();
            }

            var shaped = new
            {
                citizen.Citizen_ID,
                citizen.FullName,
                citizen.National_ID,
                Gender = g,
                citizen.BirthDate,
                citizen.City,
                citizen.PhoneNumber,
                citizen.Email,
                citizen.IsActive,
                citizen.CreatedAt
            };

            return Ok(shaped);
        }

        // Kullanıcının kart bilgileri
        [HttpGet("cards")]
        public async Task<IActionResult> GetMyCards()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var citizenId = await _context.Users
                .Where(u => u.User_ID == userId)
                .Select(u => u.Citizen_ID)
                .FirstOrDefaultAsync();

            if (citizenId == 0)
                return NotFound("Citizen bilgisi bulunamadı.");

            var cards = await _context.Cards
                .Where(c => c.Citizen_ID == citizenId)
                .AsNoTracking()
                .ToListAsync();

            return Ok(cards);
        }

        // Kullanıcının yaptığı işlemler (Transactions)
        [HttpGet("transactions")]
        public async Task<IActionResult> GetMyTransactions()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var citizenId = await _context.Users
                .Where(u => u.User_ID == userId)
                .Select(u => u.Citizen_ID)
                .FirstOrDefaultAsync();

            if (citizenId == 0)
                return NotFound("Citizen bilgisi bulunamadı.");

            // Önce kullanıcının kartlarını alıyoruz
            var cardIds = await _context.Cards
                .Where(c => c.Citizen_ID == citizenId)
                .Select(c => c.Card_ID)
                .ToListAsync();

            var transactions = await _context.Transactions
                .Where(t => cardIds.Contains(t.Card_ID))
                .AsNoTracking()
                .ToListAsync();

            return Ok(transactions);
        }
    }
}
