namespace WebApplication1.Models;

public class Segments
{
    public int Segment_ID { get; set; }
    public int Citizen_ID { get; set; }
    public string SegmentName { get; set; } = string.Empty;
    public int BasedOnMonth { get; set; }
    public int BasedOnYear { get; set; }
    public DateTime CreatedAt { get; set; }
}