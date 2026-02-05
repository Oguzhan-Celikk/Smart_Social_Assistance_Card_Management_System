namespace WebApplication1.Models;

public class CardTypes
{
    public int CardType_ID { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal DefaultMonthlyLimit { get; set; }
    public string AllowedCategories { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public List<Cards> Cards { get; set; } = new List<Cards>();
}