namespace WebApplication1.Models;

public class MonthlyVendorSpending
{
    public int VendorSpending_ID { get; set; }
    public string ReportMonth { get; set; }
    public int Card_ID { get; set; }
    public int Vendor_ID { get; set; }
    public string CardNumber { get; set; }
    public string VendorName { get; set; }
    public decimal SpendingAmount { get; set; }
}