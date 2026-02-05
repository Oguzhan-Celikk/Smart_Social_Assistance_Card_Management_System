using System;
using System.Collections.Generic;

namespace WebUI.Models
{
    public class AdminDashboardViewModel
    {
        public int TotalCitizens { get; set; }
        public int TotalCards { get; set; }
        public int TotalTransactions { get; set; }
        public int TotalAlerts { get; set; }
        public List<RecentTransaction> RecentTransactions { get; set; } = new();
        public List<RecentAlert> RecentAlerts { get; set; } = new();
    }

    public class RecentTransaction
    {
        public DateTime TransactionDate { get; set; }
        public string CardNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class RecentAlert
    {
        public string AlertType { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime AlertDate { get; set; }
        public bool IsSent { get; set; }
    }
}
