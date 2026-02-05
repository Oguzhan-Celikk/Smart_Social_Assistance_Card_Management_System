namespace WebApplication1.Models;

public class MonthlyViolations
{
    public int Citizen_ID { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public int ViolationCount { get; set; }
    public DateTime LastUpdated { get; set; }
    public int Card_ID { get; set; }
}