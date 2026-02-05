namespace WebApplication1.Models;

public class Cards
{
    public int Card_ID { get; set; }
    public int Citizen_ID { get; set; }
    public string CardNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal CurrentBalance { get; set; }
    public decimal MonthlyLimit { get; set; }
    public string Status_ { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastUsedDate { get; set; }
    public int CardType_ID { get; set; }
    
    public CardTypes CardType { get; set; }
}
