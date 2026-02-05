using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WebUI.Models;

namespace WebUI.Controllers
{
    [Authorize(Roles = "admin")]
    public class AdminController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            // Example data removed; return empty model
            return View(new AdminDashboardViewModel());
        }

    }
}
