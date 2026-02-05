namespace WebApplication1.Models;

public class Alerts
{
    public int Alert_ID { get; set; } 
    public int Citizen_ID { get; set; }
    public DateTime AlertDate { get; set; }
    public string AlertType { get; set; } 
    public string Message { get; set; }
    public bool IsSent { get; set; }

    public Citizens Citizen { get; set; }
}