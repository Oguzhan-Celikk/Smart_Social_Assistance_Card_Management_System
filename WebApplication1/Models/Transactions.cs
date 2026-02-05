namespace WebApplication1.Models;

public class Transactions
{
    public int Transaction_ID { get; set; }
    public int Card_ID { get; set; }
    public int Vendor_ID { get; set; }
    public DateTime TransactionDate { get; set; }
    public decimal Amount { get; set; }
    public string City { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public decimal PreviousBalance { get; set; }
    public decimal NewBalance { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsFraudSuspected { get; set; }
    public string? IPAddress { get; set; } = string.Empty;
    public string? DeviceInfo { get; set; } = string.Empty;
    public string RuleViolations { get; set; } = string.Empty;
}