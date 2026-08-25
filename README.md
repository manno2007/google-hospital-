# MediCore Hospital Management System (ASP.NET Core 8 MVC)

A hospital management web application built with **ASP.NET Core 8 MVC**, **Entity Framework Core 8**, and **SQLite**.

## 📂 Project Directory Structure

```
├── Controllers/
│   ├── AppointmentsController.cs   # Core appointment workflows (PRG, [Bind], AntiForgery)
│   ├── DepartmentsController.cs     # Clinical department management
│   ├── DoctorsController.cs         # Doctor registrations and department bindings
│   └── PatientsController.cs        # Patient records and medical history
│
├── Models/
│   ├── Appointment.cs               # Appointment entity with Data Annotations
│   ├── Department.cs                # Department entity
│   ├── Doctor.cs                    # Doctor entity with Department FK
│   └── Patient.cs                   # Patient entity
│
├── Data/
│   └── AppDbContext.cs              # EF Core DbContext with Fluent API & Seed Data
│
├── Views/
│   ├── Appointments/                # Index, Create, Edit, Details, Delete Razor views
│   ├── Shared/_Layout.cshtml        # Main Bootstrap 5 layout
│   ├── _ViewImports.cshtml          # Global Tag Helpers & usings
│   └── _ViewStart.cshtml            # Default layout configuration
│
├── Program.cs                       # .NET 8 WebApplication bootstrap and DI container
├── appsettings.json                 # SQLite connection string & EF logging
├── HospitalManagementSystem.csproj  # .NET 8 project dependencies
└── README.md
```

## 🚀 How to Run Locally with .NET 8 SDK

1. Make sure [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) is installed on your machine.
2. Clone or open this repository in your terminal.
3. Run the application:

```bash
dotnet restore
dotnet run
```

4. Navigate to `http://localhost:5000` or `https://localhost:5001` in your browser.
The SQLite database `HospitalManagement.db` will be auto-created and pre-seeded on first run.

## 🛡️ Architectural Highlights

- **Direct DbContext Injection**: No redundant abstract repository layers. `AppDbContext` is directly injected into controllers.
- **Security**: All POST endpoints use `[ValidateAntiForgeryToken]` and `[Bind("...")]` to prevent Over-Posting / Mass-Assignment vulnerabilities.
- **PRG Pattern**: Implements Post/Redirect/Get with `TempData["Success"]` flash alerts.
- **Eager Loading**: Queries use `.Include()` to prevent N+1 database roundtrips.
- **Fluent API**: Explicit cascade and restrict delete behaviors defined in `OnModelCreating`.
