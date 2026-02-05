namespace WebApplication1.Models;

public class Citizens
{
    public int Citizen_ID { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string National_ID { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string City { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public ICollection<Alerts> Alerts { get; set; } = new List<Alerts>();
}