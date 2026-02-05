namespace WebApplication1.Models;

public class Flags
{
    public int Flag_ID { get; set; }
    public int Transaction_ID { get; set; }
    public int Rule_ID { get; set; }
    public int Card_ID { get; set; }
    public DateTime ViolationDate { get; set; }
    public string ViolationDetail { get; set; } = string.Empty;
    public bool Resolved { get; set; }
    public string Severity { get; set; } = string.Empty;
}