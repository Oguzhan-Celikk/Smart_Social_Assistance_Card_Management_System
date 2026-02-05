namespace WebApplication1.Models;

public class TransactionRules
{
    public int Rule_ID { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public string Description_ { get; set; } = string.Empty;
    public string RuleType { get; set; } = string.Empty;
    public string RuleValue { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string RuleExpression { get; set; } = string.Empty;
    public int? AppliesToCardType_ID { get; set; }
}