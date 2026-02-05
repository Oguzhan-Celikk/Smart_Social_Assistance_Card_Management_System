# Smart Social Assistance Card Management System

## 📋 Project Overview

The **Smart Social Assistance Card Management System** is a comprehensive .NET 9.0 solution designed to manage and monitor social assistance programs through a card-based system. The application consists of two main components: a RESTful API backend and an MVC-based web frontend, working together to provide secure access to citizens' assistance data, transaction monitoring, and administrative oversight.

## 🏗️ Architecture

### Project Structure

```
WebApplication1.sln
├── Database/                # Database Scripts
│   └── script.sql          # Complete database schema & sample data
│
├── WebApplication1/          # RESTful API Backend
│   ├── Controllers/          # API Controllers
│   ├── DbContexts/          # Entity Framework DB Context
│   ├── Models/              # Data Models/Entities
│   └── Program.cs           # API Configuration & Startup
│
└── WebUI/                   # MVC Web Frontend
    ├── Controllers/         # MVC Controllers
    ├── Models/             # View Models
    ├── Views/              # Razor Views
    ├── wwwroot/            # Static Files (CSS, JS, Images)
    └── Program.cs          # Web UI Configuration & Startup
```

## 🎯 Key Features

### Backend API (WebApplication1)
- **JWT-based Authentication**: Secure token-based authentication system
- **Role-based Authorization**: Separate endpoints for Admin and User roles
- **RESTful API Design**: Well-structured API endpoints following REST principles
- **Swagger/OpenAPI Documentation**: Interactive API documentation
- **Entity Framework Core**: Database-first approach with SQL Server
- **CORS Support**: Configured for cross-origin requests

### Frontend Web UI (WebUI)
- **MVC Architecture**: ASP.NET Core MVC with Razor views
- **Cookie-based Authentication**: Session management for web users
- **Role-specific Dashboards**: Separate views for Admin and User roles
- **Responsive Design**: Bootstrap-based responsive interface
- **HTTP Client Integration**: Consumes backend API services

## 🗄️ Database Schema

### Core Tables

#### **Users**
- User authentication and role management
- Links users to citizens through `Citizen_ID`
- Stores credentials (`National_ID`, `Password`) and `Role` (admin/user)

#### **Citizens**
- Central table containing citizen information
- Fields: `FullName`, `National_ID`, `Gender`, `BirthDate`, `City`, `PhoneNumber`, `Email`, `IsActive`, `CreatedAt`
- One-to-many relationship with Cards and Alerts

#### **Cards**
- Social assistance cards issued to citizens
- Tracks: `CardNumber`, `IssueDate`, `ExpiryDate`, `CurrentBalance`, `MonthlyLimit`, `Status_`, `LastUsedDate`
- Links to `CardTypes` and `Citizens`

#### **CardTypes**
- Defines different types of assistance cards
- Referenced by Cards table

#### **Transactions**
- Records all card transactions
- Tracks: `Amount`, `TransactionDate`, `City`, `TransactionType`, `PreviousBalance`, `NewBalance`, `Status`
- Fraud detection fields: `IsFraudSuspected`, `IPAddress`, `DeviceInfo`, `RuleViolations`
- Links to Cards and Vendors

#### **Vendors**
- Registered vendors accepting assistance cards
- Merchant/store information

### Supporting Tables

#### **Alerts**
- System-generated alerts for citizens
- Linked to specific citizens through `Citizen_ID`

#### **BalanceHistory**
- Historical balance tracking

#### **TransactionRules**
- Business rules for transaction validation

#### **MonthlyCredits**
- Monthly credit allocations

#### **MonthlyViolations**
- Tracks monthly rule violations per citizen

#### **MonthlyCardSpending**
- Aggregated spending statistics per card per month

#### **MonthlyVendorSpending**
- Aggregated spending statistics per vendor per month

#### **Segments**
- Citizen segmentation for targeted programs

#### **Flags**
- System flags for various monitoring purposes

## 🔐 Authentication & Authorization

### Backend API (JWT)
- **Token Generation**: Issued upon successful login via `/api/auth/login`
- **Token Contents**: 
  - `User_ID` (NameIdentifier claim)
  - `Citizen_ID` (custom claim)
  - `Role` (admin/user)
- **Token Lifetime**: 1 hour
- **Protected Endpoints**: 
  - `/api/admin/*` - Requires "admin" role
  - `/api/user/*` - Requires "user" role

### Frontend Web UI (Cookie)
- **Cookie-based Sessions**: Persistent login sessions
- **Session Timeout**: 10 minutes (configurable)
- **Role Policies**:
  - `AdminOnly`: Access to Admin dashboard and features
  - `UserOnly`: Access to User dashboard and features
- **Automatic Redirection**: Based on user role after login

## 📡 API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
```json
Request:
{
  "National_ID": "12345678901",
  "Password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "user"
}
```

### User Endpoints (`/api/user/`)
All endpoints require `user` role authorization.

- **GET** `/api/user/profile` - Get current user's profile information
- **GET** `/api/user/citizen` - Get citizen details linked to current user
- **GET** `/api/user/cards` - Get all cards belonging to current user
- **GET** `/api/user/transactions` - Get all transactions for current user's cards

### Admin Endpoints (`/api/admin/`)
All endpoints require `admin` role authorization.

- **GET** `/api/admin/users` - Get all users
- **GET** `/api/admin/citizens` - Get all citizens
- **GET** `/api/admin/citizen` - Get citizen details for logged-in admin
- **GET** `/api/admin/cards` - Get all cards
- **GET** `/api/admin/cardtypes` - Get all card types
- **GET** `/api/admin/transactions` - Get all transactions
- **GET** `/api/admin/transactionrules` - Get all transaction rules
- **GET** `/api/admin/alerts` - Get all alerts
- **GET** `/api/admin/balancehistories` - Get all balance histories
- **GET** `/api/admin/monthlycredits` - Get all monthly credits
- **GET** `/api/admin/monthlyviolations` - Get all monthly violations
- **GET** `/api/admin/segments` - Get all segments
- **GET** `/api/admin/vendors` - Get all vendors
- **GET** `/api/admin/flags` - Get all flags
- **GET** `/api/admin/monthlycardspending` - Get monthly card spending statistics
- **GET** `/api/admin/monthlyvendorspending` - Get monthly vendor spending statistics

## 🚀 Getting Started

### Prerequisites
- **.NET 9.0 SDK** or later
- **SQL Server** (LocalDB, Express, or full version)
- **SQL Server Management Studio (SSMS)** or **Azure Data Studio** (recommended)
- **Visual Studio 2022**, **Rider**, or **VS Code**
- **Git** (optional, for version control)

### Quick Start Guide

Follow these steps in order to set up the project:

1. **Set up the Database** (see [Database Setup](#database-setup) section below)
2. **Configure Connection Strings** (see [Database Configuration](#database-configuration) section)
3. **Configure JWT Settings** (see [JWT Configuration](#jwt-configuration) section)
4. **Run the Application** (see [Running the Application](#running-the-application) section)

### Database Configuration

1. **Connection String**: Update in `appsettings.json` (WebApplication1 project)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SmartSocialAssistanceCardManagement;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

2. **JWT Configuration**: Update in `appsettings.json`
```json
{
  "Jwt": {
    "Key": "your-super-secret-key-here-min-32-characters-required-for-security",
    "Issuer": "https://localhost:5237",
    "Audience": "https://localhost:5237"
  }
}
```
⚠️ **Important**: Generate a strong, unique key for production use
```

### Running the Application

#### Option 1: Using Visual Studio / Rider
1. Open `WebApplication1.sln`
2. Set multiple startup projects:
   - Right-click solution → "Properties" → "Multiple Startup Projects"
   - Set both `WebApplication1` and `WebUI` to "Start"
3. Press F5 to run

#### Option 2: Using Command Line
```bash
# Terminal 1 - Start API Backend
cd WebApplication1
dotnet run

# Terminal 2 - Start Web UI
cd WebUI
dotnet run
```

### Default URLs
- **API Backend**: `http://localhost:5032` or `https://localhost:5237`
- **API Swagger**: `http://localhost:5032/swagger`
- **Web UI**: `http://localhost:5000` or `https://localhost:5001`

### Database Setup

The project includes a complete database schema in the `Database/script.sql` file. Follow these steps to set up the database:

#### Option 1: Using SQL Server Management Studio (SSMS) - Recommended
1. Open SQL Server Management Studio (SSMS)
2. Connect to your SQL Server instance
3. Create a new database:
   ```sql
   CREATE DATABASE SmartSocialAssistanceCardManagement;
   GO
   ```
4. Open the `Database/script.sql` file in SSMS
5. Replace `/*DatabaseName*/` on line 1 with `SmartSocialAssistanceCardManagement`:
   ```sql
   USE [SmartSocialAssistanceCardManagement]
   GO
   ```
6. Execute the script (F5) to create all tables, views, stored procedures, and sample data

#### Option 2: Using Command Line (sqlcmd)
```bash
# Create the database
sqlcmd -S localhost -E -Q "CREATE DATABASE SmartSocialAssistanceCardManagement;"

# Run the script (after replacing /*DatabaseName*/ with the database name)
sqlcmd -S localhost -E -d SmartSocialAssistanceCardManagement -i Database/script.sql
```

#### Option 3: Using Azure Data Studio
1. Open Azure Data Studio
2. Connect to your SQL Server instance
3. Right-click on Databases → New Query
4. Create database: `CREATE DATABASE SmartSocialAssistanceCardManagement;`
5. Open `Database/script.sql`
6. Replace `/*DatabaseName*/` with `SmartSocialAssistanceCardManagement`
7. Run the script

#### Verify Database Setup
After running the script, verify that all tables were created:
```sql
USE SmartSocialAssistanceCardManagement;
GO
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
```

Expected tables:
- Citizens
- Users
- Cards
- CardTypes
- Transactions
- Vendors
- Alerts
- BalanceHistory
- TransactionRules
- MonthlyCredits
- MonthlyViolations
- MonthlyCardSpending
- MonthlyVendorSpending
- Segments
- Flags

#### Connection String
Make sure your `appsettings.json` connection string matches your SQL Server setup:
- **Windows Authentication**: `Server=localhost;Database=SmartSocialAssistanceCardManagement;Trusted_Connection=True;TrustServerCertificate=True;`
- **SQL Authentication**: `Server=localhost;Database=SmartSocialAssistanceCardManagement;User Id=your_username;Password=your_password;TrustServerCertificate=True;`

## 💻 Technology Stack

### Backend (WebApplication1)
- **Framework**: ASP.NET Core 9.0
- **ORM**: Entity Framework Core 9.0.8
- **Database**: SQL Server
- **Authentication**: JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer 9.0.8)
- **Documentation**: Swagger/OpenAPI (Swashbuckle 9.0.3)
- **Security**: BCrypt.Net-Next 4.0.3

### Frontend (WebUI)
- **Framework**: ASP.NET Core MVC 9.0
- **Authentication**: Cookie Authentication
- **HTTP Client**: IHttpClientFactory
- **JWT Handling**: System.IdentityModel.Tokens.Jwt 8.13.1
- **UI Framework**: Bootstrap (included in wwwroot)
- **JavaScript Libraries**: jQuery, jQuery Validation

## 📦 NuGet Packages

### WebApplication1 (API)
```xml
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.8" />
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.8"/>
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="9.0.8" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.8" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.8" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.8" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="9.0.3" />
```

### WebUI (Frontend)
```xml
<PackageReference Include="Microsoft.IdentityModel.Tokens" Version="8.13.1" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.13.1" />
<PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="9.0.0" />
```

## 🔒 Security Features

1. **Password Hashing**: BCrypt implementation for secure password storage
2. **JWT Token Validation**: 
   - Issuer validation
   - Audience validation
   - Lifetime validation
   - Signature validation
3. **HTTPS Redirection**: Enforced in production
4. **CORS Policy**: Configured but should be restricted in production
5. **HttpOnly Cookies**: Session cookies marked as HttpOnly
6. **Role-based Access Control**: Endpoints protected by role attributes
7. **Fraud Detection**: Transaction monitoring with fraud suspect flags

## 🎨 User Interface

### Login Page (`/Login`)
- Single entry point for both admin and user roles
- Automatic role-based redirection after successful login
- Displays user's full name from citizen records

### User Dashboard (`/User`)
- View personal profile and citizen information
- Check card details and balances
- Review transaction history
- Monitor alerts

### Admin Dashboard (`/Admin`)
- System-wide overview and analytics
- Access to all citizens, users, and cards
- Transaction monitoring and fraud detection
- Vendor management
- Rule and alert management
- Statistical reports (monthly spending, violations, etc.)

## 📊 Data Flow

1. **User Login**: 
   - User submits credentials to WebUI
   - WebUI forwards to API `/api/auth/login`
   - API validates credentials and returns JWT
   - WebUI creates cookie session with claims from JWT

2. **Data Retrieval**:
   - WebUI reads JWT claims (role, citizen_id)
   - Makes authorized API requests with JWT Bearer token
   - API validates token and role
   - Returns filtered data based on user role and identity

3. **Transaction Processing**:
   - Card transactions recorded with full audit trail
   - Rule violations checked and flagged
   - Balance updates tracked in history
   - Alerts generated for suspicious activities

## 🧪 Testing

### API Testing with Swagger
1. Navigate to `http://localhost:5032/swagger`
2. Authorize with JWT token:
   - Call `/api/auth/login` with valid credentials
   - Copy the returned token
   - Click "Authorize" button, enter `Bearer {token}`
   - Test protected endpoints

### Manual Testing
- Use Postman or similar tools to test API endpoints
- Test role-based access control
- Verify token expiration handling
- Test CRUD operations on all entities

## 🔧 Configuration

### Session Configuration (WebUI)
```csharp
options.ExpireTimeSpan = TimeSpan.FromMinutes(10);
options.SlidingExpiration = false;
options.Cookie.IsEssential = true;
options.Cookie.HttpOnly = true;
```

### CORS Configuration (API)
```csharp
policy.AllowAnyOrigin()
      .AllowAnyMethod()
      .AllowAnyHeader();
```
⚠️ **Warning**: This should be restricted in production to specific origins.

### JWT Configuration
- **Key**: Secure secret key (minimum 32 characters recommended)
- **Issuer/Audience**: Match your application URLs
- **Expiration**: 1 hour (configurable)
- **Important**: Replace the default key in appsettings.json with your own secure key before deployment

## 📈 Future Enhancements

### Potential Features
- [ ] Email notifications for alerts
- [ ] SMS integration for transaction confirmations
- [ ] Advanced fraud detection algorithms
- [ ] Real-time transaction monitoring dashboard
- [ ] Report generation (PDF, Excel)
- [ ] Mobile application support
- [ ] Multi-factor authentication (MFA)
- [ ] Audit logging system
- [ ] Data analytics and insights
- [ ] Geolocation-based fraud detection
- [ ] Automated monthly credit distribution
- [ ] Card renewal notifications
- [ ] Vendor application portal

### Technical Improvements
- [ ] Implement CQRS pattern
- [ ] Add Redis caching
- [ ] Containerize with Docker
- [ ] CI/CD pipeline setup
- [ ] Unit and integration tests
- [ ] API rate limiting
- [ ] Request/response logging
- [ ] Health checks and monitoring
- [ ] Database backup automation
- [ ] Performance optimization
- [ ] Localization/Internationalization

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Fails
- Verify SQL Server is running
- Check connection string in `appsettings.json`
- Ensure database exists or run migrations
- Check Windows Authentication or SQL credentials

#### JWT Token Invalid
- Verify token hasn't expired (1 hour default)
- Check JWT configuration matches between API and clients
- Ensure clock synchronization between servers

#### CORS Errors
- Verify CORS policy includes your frontend URL
- Check browser console for specific CORS errors
- Ensure credentials are being sent with requests

#### Session Expires Too Quickly
- Adjust `ExpireTimeSpan` in WebUI `Program.cs`
- Consider enabling `SlidingExpiration` for better UX

#### 401 Unauthorized Errors
- Verify user has correct role for endpoint
- Check JWT token is included in Authorization header
- Ensure token format is "Bearer {token}"

## 📞 Support & Contact

For issues, questions, or contributions, please refer to your project repository or contact the development team.

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🎓 Development Notes

### Code Standards
- Follow C# naming conventions
- Use async/await for all database operations
- Implement proper error handling
- Add XML documentation comments for public APIs
- Use DTOs for API responses (recommended for production)

### Database Conventions
- Table names use PascalCase
- Primary keys follow pattern `{TableName}_ID`
- Foreign keys follow pattern `{ReferencedTable}_ID`
- DateTime fields use `CreatedAt`, `UpdatedAt` suffixes
- Status fields use `IsActive`, `Status` naming

### Security Best Practices
- Never commit secrets to version control
- Use environment variables for sensitive configuration
- Implement API rate limiting in production
- Add request validation and sanitization
- Regular security audits and dependency updates
- Implement proper logging without exposing sensitive data

---

**Version**: 1.0.0  
**Framework**: .NET 9.0
