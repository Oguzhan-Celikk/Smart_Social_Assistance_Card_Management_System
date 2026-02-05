using System;
using System.Collections.Generic;

namespace WebUI.Models
{
    public class UserDashboardViewModel
    {
        public string FullName { get; set; } = "Kullanıcı";
        public string NationalId { get; set; } = string.Empty;
        public string Gender { get; set; } = "M";
        public DateTime? BirthDate { get; set; }
        public string City { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public decimal TotalBalance { get; set; }
        public int ActiveCards { get; set; }

        public List<UserCard> Cards { get; set; } = new();
        public List<UserTransaction> Transactions { get; set; } = new();
    }

    public class UserCard
    {
        public int CardId { get; set; }
        public string CardNumber { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal CurrentBalance { get; set; }
        public decimal MonthlyLimit { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime? LastUsedDate { get; set; }
    }

    public class UserTransaction
    {
        public DateTime TransactionDate { get; set; }
        public string CardNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string TransactionType { get; set; } = "Payment";
        public string City { get; set; } = "None";
        public decimal PreviousBalance { get; set; }
        public decimal NewBalance { get; set; }
        public string Status { get; set; } = "Completed";
        public bool IsFraudSuspected { get; set; }
    }
}
