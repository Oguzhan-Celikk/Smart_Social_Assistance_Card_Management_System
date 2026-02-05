namespace WebApplication1.Models;

public class Vendors
{
    public int Vendor_ID { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address_ { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}