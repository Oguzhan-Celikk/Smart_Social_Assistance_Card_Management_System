using Microsoft.AspNetCore.Authorization;  // eklendi
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DbContexts;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]  // Sadece admin rolü olanlar erişebilir
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        [HttpGet("citizens")]
        public async Task<IActionResult> GetCitizens()
        {
            var citizens = await _context.Citizens.ToListAsync();
            return Ok(citizens);
        }

        [HttpGet("cards")]
        public async Task<IActionResult> GetCards()
        {
            var cards = await _context.Cards.ToListAsync();
            return Ok(cards);
        }

        [HttpGet("cardtypes")]
        public async Task<IActionResult> GetCardTypes()
        {
            var cardTypes = await _context.CardTypes.ToListAsync();
            return Ok(cardTypes);
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            var transactions = await _context.Transactions.ToListAsync();
            return Ok(transactions);
        }

        [HttpGet("transactionrules")]
        public async Task<IActionResult> GetTransactionRules()
        {
            var rules = await _context.TransactionRules.ToListAsync();
            return Ok(rules);
        }

        [HttpGet("alerts")]
        public async Task<IActionResult> GetAlerts()
        {
            var alerts = await _context.Alerts.ToListAsync();
            return Ok(alerts);
        }

        [HttpGet("balancehistories")]
        public async Task<IActionResult> GetBalanceHistories()
        {
            var histories = await _context.BalanceHistories.ToListAsync();
            return Ok(histories);
        }

        [HttpGet("monthlycredits")]
        public async Task<IActionResult> GetMonthlyCredits()
        {
            var credits = await _context.MonthlyCredits.ToListAsync();
            return Ok(credits);
        }

        [HttpGet("monthlyviolations")]
        public async Task<IActionResult> GetMonthlyViolations()
        {
            var violations = await _context.MonthlyViolations.ToListAsync();
            return Ok(violations);
        }

        [HttpGet("segments")]
        public async Task<IActionResult> GetSegments()
        {
            var segments = await _context.Segments.ToListAsync();
            return Ok(segments);
        }

        [HttpGet("vendors")]
        public async Task<IActionResult> GetVendors()
        {
            var vendors = await _context.Vendors.ToListAsync();
            return Ok(vendors);
        }

        // Giriş yapan admin'in bağlı olduğu citizen kaydını döndürür
        [HttpGet("citizen")] 
        public async Task<IActionResult> GetMyCitizen()
        {
            // JWT içinde AuthController tarafından eklenen claim: "Citizen_ID"
            var citizenIdClaim = User.FindFirst("Citizen_ID")?.Value;
            if (string.IsNullOrEmpty(citizenIdClaim))
                return NotFound("Citizen claim bulunamadı.");

            if (!int.TryParse(citizenIdClaim, out var citizenId))
                return BadRequest("Citizen_ID claim formatı hatalı.");

            var citizen = await _context.Citizens.AsNoTracking().FirstOrDefaultAsync(c => c.Citizen_ID == citizenId);
            if (citizen == null)
                return NotFound("Citizen kaydı bulunamadı.");

            return Ok(citizen);
        }

        [HttpGet("flags")]
        public async Task<IActionResult> GetFlags()
        {
            var flags = await _context.Flags.ToListAsync();
            return Ok(flags);
        }

        [HttpGet("monthlycardspending")]
        public async Task<IActionResult> GetMonthlyCardSpending()
        {
            var cardspendings = await _context.MonthlyCardSpendings.ToListAsync();
            return Ok(cardspendings);
        }

        [HttpGet("monthlyvendorspending")]
        public async Task<IActionResult> GetMonthlyVendorSpending()
        {
            var vendorspendings = await _context.MonthlyVendorSpendings.ToListAsync();
            return Ok(vendorspendings);
        }
        

    }
}
