using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;

namespace WebApplication1.DbContexts;

public class ApplicationDbContext : DbContext
{
    // Bu constructor doğru şekilde çağrılmalı
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options) // base sınıfa options'ı aktarıyoruz
    {
    }

    // Eğer OnConfiguring kullanılacaksa, genellikle geliştirme/test amaçlıdır.
    // Ancak modern yapılandırmada bu kısma genelde gerek kalmaz.
    // Ama istersen fallback için aşağıya ekliyorum:
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            // Fallback: Bu sadece appsettings.json'dan çekilmediyse çalışır
            optionsBuilder.UseSqlServer("Server=localhost;Database=SmartSocialAssistanceCardManagement;Trusted_Connection=True,TrustServerCertificate=True;");
        }
    }

    // Model oluşturma (opsiyonel Fluent API ayarları burada yapılabilir)
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Alerts>(entity =>
        {
            entity.ToTable("Alerts");
            entity.HasKey(e => e.Alert_ID);
            entity.HasOne(e => e.Citizen)
                .WithMany(c => c.Alerts)           // Citizens tarafında Alerts koleksiyonu varsa
                .HasForeignKey(e => e.Citizen_ID)  // Bu, gerçek foreign key sütunu
                .HasConstraintName("FK_Alerts_Citizens");  // Opsiyonel: FK ismi
        });
        modelBuilder.Entity<BalanceHistory>(entity =>
        {
            entity.ToTable("BalanceHistory");
            entity.HasKey(e => e.History_ID);
        });
        modelBuilder.Entity<Cards>(entity =>
        {
            entity.ToTable("Cards");
            entity.HasKey(e => e.Card_ID);
            entity.HasOne(e => e.CardType)                  // Cards -> CardTypes ilişkisi
                .WithMany(ct => ct.Cards)                  // CardTypes -> Cards ilişkisi
                .HasForeignKey(e => e.CardType_ID)         // Foreign key kolonunu açıkça belirt
                .HasConstraintName("FK_Cards_CardTypes");
        });
        modelBuilder.Entity<CardTypes>(entity =>
        {
            entity.ToTable("CardTypes");
            entity.HasKey(e => e.CardType_ID);
        });
        modelBuilder.Entity<Citizens>(entity =>
        {
            entity.ToTable("Citizens");
            entity.HasKey(e => e.Citizen_ID);
            // Ensure SQL mapping aligns with DB column type
            entity.Property(e => e.Gender).HasColumnType("char(1)");
        });
        modelBuilder.Entity<Flags>(entity =>
        {
            entity.ToTable("Flags");
            entity.HasKey(e => e.Flag_ID);
        });
        modelBuilder.Entity<MonthlyCredits>(entity =>
        {
            entity.ToTable("MonthlyCredits");
            entity.HasKey(e => e.Credit_ID);
        });
        modelBuilder.Entity<MonthlyViolations>(entity =>
        {
            entity.ToTable("MonthlyViolations");
            entity.HasKey(e => e.Citizen_ID);
        });
        modelBuilder.Entity<Segments>(entity =>
        {
            entity.ToTable("Segments");
            entity.HasKey(e => e.Segment_ID);
        });
        modelBuilder.Entity<TransactionRules>(entity =>
        {
            entity.ToTable("TransactionRules");
            entity.HasKey(e => e.Rule_ID);
        });
        modelBuilder.Entity<Transactions>(entity =>
        {
            entity.ToTable("Transactions");
            entity.HasKey(e => e.Transaction_ID);
        });
        modelBuilder.Entity<Users>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.User_ID);
        });
        modelBuilder.Entity<Vendors>(entity =>
        {
            entity.ToTable("Vendors");
            entity.HasKey(e => e.Vendor_ID);
        });
        modelBuilder.Entity<MonthlyCardSpending>(entity =>
        {
            entity.ToTable("MonthlyCardSpending");
            entity.HasKey(e => e.CardSpending_ID);
        });
        modelBuilder.Entity<MonthlyVendorSpending>(entity =>
        {
            entity.ToTable("MonthlyVendorSpending");
            entity.HasKey(e => e.VendorSpending_ID);
        });


        // Örnek: Tablo adını değiştirme
        //modelBuilder.Entity<Users>().ToTable("Users");


        // İlişki tanımlamaları, kısıtlamalar, unique alanlar vs. burada tanımlanabilir
        // Fluent API kullanacaksan burada devam edebilirsin.
    }

    // DbSet'ler - Tablolar
    public DbSet<Users> Users { get; set; }
    public DbSet<Citizens> Citizens { get; set; }
    public DbSet<Cards> Cards { get; set; }
    public DbSet<CardTypes> CardTypes { get; set; }
    public DbSet<Transactions> Transactions { get; set; }
    public DbSet<TransactionRules> TransactionRules { get; set; }
    public DbSet<Alerts> Alerts { get; set; }
    public DbSet<BalanceHistory> BalanceHistories { get; set; }
    public DbSet<MonthlyCredits> MonthlyCredits { get; set; }
    public DbSet<MonthlyViolations> MonthlyViolations { get; set; }
    public DbSet<Segments> Segments { get; set; }
    public DbSet<Vendors> Vendors { get; set; }
    public DbSet<Flags> Flags { get; set; }
    public DbSet<MonthlyCardSpending> MonthlyCardSpendings { get; set; }
    public DbSet<MonthlyVendorSpending> MonthlyVendorSpendings { get; set; }
}
