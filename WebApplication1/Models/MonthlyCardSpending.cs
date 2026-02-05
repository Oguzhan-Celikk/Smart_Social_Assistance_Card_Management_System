namespace WebApplication1.Models;

public class MonthlyCardSpending
{
    public int CardSpending_ID { get; set; }
    public string ReportMonth { get; set; }
    public int Card_ID { get; set; }
    public string CardNumber { get; set; }
    public decimal SpendingAmount { get; set; }
    public string? Note { get; set; } 
}