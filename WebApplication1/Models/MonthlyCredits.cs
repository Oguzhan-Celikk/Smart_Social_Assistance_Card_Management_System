namespace WebApplication1.Models;

public class MonthlyCredits
{
    public int Credit_ID { get; set; }
    public int Card_ID { get; set; }
    public int Citizen_ID { get; set; }
    public decimal LimitAmount { get; set; }
    public decimal BonusAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public int EffectiveMonth { get; set; }
    public int EffectiveYear { get; set; }
    public bool IsRegular { get; set; }
    public DateTime CreatedAt { get; set; }
}