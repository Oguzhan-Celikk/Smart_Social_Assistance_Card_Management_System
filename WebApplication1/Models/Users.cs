namespace WebApplication1.Models;

public class Users
{
    public int User_ID { get; set; }
    public int Citizen_ID { get; set; }
    public string National_ID { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}