using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebUI.Models;

namespace WebUI.Controllers
{
    [Authorize(Roles = "user")]
    public class UserController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            // Example data removed; return empty model
            return View(new UserDashboardViewModel());
        }

    }
}
