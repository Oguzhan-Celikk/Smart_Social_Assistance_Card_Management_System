namespace WebApplication1.Models;

public class BalanceHistory
{
    public int History_ID { get; set; }
    public int Card_ID { get; set; }
    public int Citizen_ID { get; set; } 
    public string CardNumber { get; set; } = string.Empty;
    public decimal OldBalance { get; set; }
    public DateTime LoggedAt { get; set; }
    public string LogMonth { get; set; } = string.Empty;
    public decimal NewBalance { get; set; }
}