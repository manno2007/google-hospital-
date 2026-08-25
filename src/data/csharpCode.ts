import { CodeFile } from '../types';

export const CSHARP_FILES: CodeFile[] = [
  {
    id: 'program-cs',
    filename: 'Program.cs',
    category: 'Program',
    language: 'csharp',
    description: 'Official .NET 8 minimal hosting model: Configures MVC Controllers & Views, SQLite EF Core DbContext, Auto-migration/seeding, and standard HTTP middleware pipeline.',
    code: `using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Register MVC Controllers and Views into the DI container
builder.Services.AddControllersWithViews();

// 2. Register SQLite EF Core DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=Hospital.db"));

var app = builder.Build();

// 3. Database Initialization & Seed Check on Startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// 4. Configure HTTP Request Pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

// 5. Default MVC Route Pattern: /{controller}/{action}/{id?}
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Appointments}/{action=Index}/{id?}");

app.Run();`
  },
  {
    id: 'appointments-controller-cs',
    filename: 'Controllers/AppointmentsController.cs',
    category: 'Controllers',
    language: 'csharp',
    description: 'Compliant ASP.NET Core Controller: Direct DbContext DI, Async/Await Task<IActionResult>, LINQ (.Include/.Where/.OrderByDescending), [ValidateAntiForgeryToken], [Bind] Over-posting protection, and PRG (Post-Redirect-Get).',
    code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers;

public class AppointmentsController : Controller
{
    private readonly AppDbContext _context;

    // 1. Direct DbContext Dependency Injection (Standard .NET Practice)
    public AppointmentsController(AppDbContext context)
    {
        _context = context;
    }

    // 2. GET: Appointments
    // LINQ: .Include() & .ThenInclude() (Eager Loading), .Where() (Filtering), .OrderByDescending() (Sorting)
    public async Task<IActionResult> Index(string? search)
    {
        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.Department)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a => 
                a.Patient!.Name.ToLower().Contains(search.ToLower()) || 
                a.Doctor!.Name.ToLower().Contains(search.ToLower()) ||
                a.Diagnosis.ToLower().Contains(search.ToLower()));
        }

        var appointments = await query.OrderByDescending(a => a.AppointmentDate).ToListAsync();
        ViewBag.Search = search;
        return View(appointments);
    }

    // 3. GET: Appointments/Details/5
    public async Task<IActionResult> Details(int? id)
    {
        if (id == null) return NotFound();

        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.Department)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (appointment == null) return NotFound();

        return View(appointment);
    }

    // 4. GET: Appointments/Create
    public IActionResult Create()
    {
        PopulateDropdowns();
        return View(new Appointment { AppointmentDate = DateTime.Now.AddHours(2) });
    }

    // 5. POST: Appointments/Create
    // Security: [ValidateAntiForgeryToken] for CSRF + [Bind] to prevent Over-Posting / Mass Assignment
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("AppointmentDate,Diagnosis,PatientId,DoctorId")] Appointment appointment)
    {
        if (ModelState.IsValid)
        {
            _context.Add(appointment);
            await _context.SaveChangesAsync();
            
            // Post-Redirect-Get (PRG) Pattern with TempData flash message
            TempData["Success"] = "Appointment scheduled successfully!";
            return RedirectToAction(nameof(Index));
        }

        PopulateDropdowns(appointment.PatientId, appointment.DoctorId);
        return View(appointment);
    }

    // 6. GET: Appointments/Edit/5
    public async Task<IActionResult> Edit(int? id)
    {
        if (id == null) return NotFound();

        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null) return NotFound();

        PopulateDropdowns(appointment.PatientId, appointment.DoctorId);
        return View(appointment);
    }

    // 7. POST: Appointments/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, [Bind("Id,AppointmentDate,Diagnosis,PatientId,DoctorId")] Appointment appointment)
    {
        if (id != appointment.Id) return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(appointment);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Appointment updated successfully!";
                return RedirectToAction(nameof(Index));
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Appointments.Any(e => e.Id == appointment.Id)) return NotFound();
                throw;
            }
        }

        PopulateDropdowns(appointment.PatientId, appointment.DoctorId);
        return View(appointment);
    }

    // 8. GET: Appointments/Delete/5
    public async Task<IActionResult> Delete(int? id)
    {
        if (id == null) return NotFound();

        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.Department)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (appointment == null) return NotFound();

        return View(appointment);
    }

    // 9. POST: Appointments/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment != null)
        {
            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Appointment cancelled and removed!";
        }
        return RedirectToAction(nameof(Index));
    }

    // Helper for SelectLists
    private void PopulateDropdowns(int? selectedPatientId = null, int? selectedDoctorId = null)
    {
        ViewBag.PatientId = new SelectList(_context.Patients.OrderBy(p => p.Name), "Id", "Name", selectedPatientId);
        ViewBag.DoctorId = new SelectList(_context.Doctors.OrderBy(d => d.Name), "Id", "Name", selectedDoctorId);
    }
}`
  },
  {
    id: 'doctors-controller-cs',
    filename: 'Controllers/DoctorsController.cs',
    category: 'Controllers',
    language: 'csharp',
    description: 'Controller managing Doctors: Eager loading department details, relational integrity, and standard CRUD workflows.',
    code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers;

public class DoctorsController : Controller
{
    private readonly AppDbContext _context;

    public DoctorsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: Doctors
    public async Task<IActionResult> Index()
    {
        var doctors = await _context.Doctors
            .Include(d => d.Department)
            .OrderBy(d => d.Name)
            .AsNoTracking()
            .ToListAsync();
        return View(doctors);
    }

    // GET: Doctors/Create
    public IActionResult Create()
    {
        ViewBag.DepartmentId = new SelectList(_context.Departments.OrderBy(d => d.Name), "Id", "Name");
        return View();
    }

    // POST: Doctors/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name,DepartmentId")] Doctor doctor)
    {
        if (ModelState.IsValid)
        {
            _context.Add(doctor);
            await _context.SaveChangesAsync();
            TempData["Success"] = $"Dr. {doctor.Name} registered successfully!";
            return RedirectToAction(nameof(Index));
        }

        ViewBag.DepartmentId = new SelectList(_context.Departments.OrderBy(d => d.Name), "Id", "Name", doctor.DepartmentId);
        return View(doctor);
    }

    // POST: Doctors/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var doctor = await _context.Doctors.FindAsync(id);
        if (doctor != null)
        {
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Doctor record removed!";
        }
        return RedirectToAction(nameof(Index));
    }
}`
  },
  {
    id: 'patients-controller-cs',
    filename: 'Controllers/PatientsController.cs',
    category: 'Controllers',
    language: 'csharp',
    description: 'Controller managing Patient registrations and medical visit history.',
    code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers;

public class PatientsController : Controller
{
    private readonly AppDbContext _context;

    public PatientsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: Patients
    public async Task<IActionResult> Index()
    {
        var patients = await _context.Patients
            .Include(p => p.Appointments)
            .OrderBy(p => p.Name)
            .AsNoTracking()
            .ToListAsync();
        return View(patients);
    }

    // GET: Patients/Create
    public IActionResult Create()
    {
        return View(new Patient { RegistrationDate = DateTime.Today });
    }

    // POST: Patients/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name,RegistrationDate")] Patient patient)
    {
        if (ModelState.IsValid)
        {
            _context.Add(patient);
            await _context.SaveChangesAsync();
            TempData["Success"] = $"Patient '{patient.Name}' registered successfully!";
            return RedirectToAction(nameof(Index));
        }
        return View(patient);
    }

    // POST: Patients/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient != null)
        {
            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Patient removed!";
        }
        return RedirectToAction(nameof(Index));
    }
}`
  },
  {
    id: 'departments-controller-cs',
    filename: 'Controllers/DepartmentsController.cs',
    category: 'Controllers',
    language: 'csharp',
    description: 'Controller for hospital medical departments with relational delete constraints.',
    code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers;

public class DepartmentsController : Controller
{
    private readonly AppDbContext _context;

    public DepartmentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: Departments
    public async Task<IActionResult> Index()
    {
        var departments = await _context.Departments
            .Include(d => d.Doctors)
            .OrderBy(d => d.Name)
            .AsNoTracking()
            .ToListAsync();
        return View(departments);
    }

    // GET: Departments/Create
    public IActionResult Create()
    {
        return View();
    }

    // POST: Departments/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name")] Department department)
    {
        if (ModelState.IsValid)
        {
            _context.Add(department);
            await _context.SaveChangesAsync();
            TempData["Success"] = $"Department '{department.Name}' created!";
            return RedirectToAction(nameof(Index));
        }
        return View(department);
    }

    // POST: Departments/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var department = await _context.Departments
            .Include(d => d.Doctors)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (department != null)
        {
            if (department.Doctors.Any())
            {
                TempData["Error"] = "Cannot delete department: Doctors are assigned to it.";
                return RedirectToAction(nameof(Index));
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Department deleted!";
        }
        return RedirectToAction(nameof(Index));
    }
}`
  },
  {
    id: 'appointment-model-cs',
    filename: 'Models/Appointment.cs',
    category: 'Models',
    language: 'csharp',
    description: 'Appointment entity with DataAnnotations validation, DataType, and Foreign Key constraints.',
    code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagementSystem.Models;

public class Appointment
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Appointment date and time is required")]
    [Display(Name = "Appointment Date")]
    [DataType(DataType.DateTime)]
    public DateTime AppointmentDate { get; set; } = DateTime.Now;

    [Required(ErrorMessage = "Diagnosis or reason for visit is required")]
    [StringLength(500, MinimumLength = 3, ErrorMessage = "Diagnosis must be between 3 and 500 characters")]
    [Display(Name = "Diagnosis / Reason")]
    public string Diagnosis { get; set; } = string.Empty;

    // Foreign Key: Patient
    [Required(ErrorMessage = "Please select a patient")]
    [Display(Name = "Patient")]
    [ForeignKey(nameof(Patient))]
    public int PatientId { get; set; }

    public virtual Patient? Patient { get; set; }

    // Foreign Key: Doctor
    [Required(ErrorMessage = "Please select a doctor")]
    [Display(Name = "Doctor")]
    [ForeignKey(nameof(Doctor))]
    public int DoctorId { get; set; }

    public virtual Doctor? Doctor { get; set; }
}`
  },
  {
    id: 'doctor-model-cs',
    filename: 'Models/Doctor.cs',
    category: 'Models',
    language: 'csharp',
    description: 'Doctor entity with 1-to-many relationship with Department and Appointments.',
    code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagementSystem.Models;

public class Doctor
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Doctor name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
    [Display(Name = "Doctor Name")]
    public string Name { get; set; } = string.Empty;

    // Foreign Key: Department
    [Required(ErrorMessage = "Please select a department")]
    [Display(Name = "Department")]
    [ForeignKey(nameof(Department))]
    public int DepartmentId { get; set; }

    public virtual Department? Department { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}`
  },
  {
    id: 'patient-model-cs',
    filename: 'Models/Patient.cs',
    category: 'Models',
    language: 'csharp',
    description: 'Patient entity with registration date validation and relationship collection.',
    code: `using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models;

public class Patient
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Patient name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
    [Display(Name = "Patient Full Name")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Registration date is required")]
    [DataType(DataType.Date)]
    [Display(Name = "Registration Date")]
    public DateTime RegistrationDate { get; set; } = DateTime.Today;

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}`
  },
  {
    id: 'department-model-cs',
    filename: 'Models/Department.cs',
    category: 'Models',
    language: 'csharp',
    description: 'Department entity representing hospital clinical units.',
    code: `using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models;

public class Department
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Department name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Department name must be between 2 and 100 characters")]
    [Display(Name = "Department Name")]
    public string Name { get; set; } = string.Empty;

    public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}`
  },
  {
    id: 'appdbcontext-cs',
    filename: 'Data/AppDbContext.cs',
    category: 'Data',
    language: 'csharp',
    description: 'EF Core DbContext with Fluent API configuration (Cascade/Restrict rules) and seed data.',
    code: `using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Fluent API: Department -> Doctors (1-to-many, Restrict Delete)
        modelBuilder.Entity<Doctor>()
            .HasOne(d => d.Department)
            .WithMany(dept => dept.Doctors)
            .HasForeignKey(d => d.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Fluent API: Patient -> Appointments (1-to-many, Cascade Delete)
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Patient)
            .WithMany(p => p.Appointments)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        // Fluent API: Doctor -> Appointments (1-to-many, Restrict Delete)
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Doctor)
            .WithMany(d => d.Appointments)
            .HasForeignKey(a => a.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed Initial Data
        modelBuilder.Entity<Department>().HasData(
            new Department { Id = 1, Name = "Cardiology" },
            new Department { Id = 2, Name = "Neurology" },
            new Department { Id = 3, Name = "Pediatrics" },
            new Department { Id = 4, Name = "Orthopedics" }
        );

        modelBuilder.Entity<Doctor>().HasData(
            new Doctor { Id = 1, Name = "Dr. Sarah Al-Mansoor", DepartmentId = 1 },
            new Doctor { Id = 2, Name = "Dr. Marcus Vance", DepartmentId = 2 },
            new Doctor { Id = 3, Name = "Dr. Elena Rostova", DepartmentId = 3 },
            new Doctor { Id = 4, Name = "Dr. Tariq Mahmood", DepartmentId = 4 }
        );

        modelBuilder.Entity<Patient>().HasData(
            new Patient { Id = 1, Name = "Amina Khalid", RegistrationDate = new DateTime(2024, 1, 15) },
            new Patient { Id = 2, Name = "Omar Farooq", RegistrationDate = new DateTime(2024, 2, 20) },
            new Patient { Id = 3, Name = "Layla Hassan", RegistrationDate = new DateTime(2024, 3, 10) }
        );

        modelBuilder.Entity<Appointment>().HasData(
            new Appointment { Id = 1, AppointmentDate = new DateTime(2025, 6, 1, 9, 30, 0), Diagnosis = "Routine cardiac checkup & ECG review", PatientId = 1, DoctorId = 1 },
            new Appointment { Id = 2, AppointmentDate = new DateTime(2025, 6, 2, 14, 0, 0), Diagnosis = "Persistent migraine with visual aura", PatientId = 2, DoctorId = 2 },
            new Appointment { Id = 3, AppointmentDate = new DateTime(2025, 6, 3, 11, 15, 0), Diagnosis = "Annual pediatric wellness examination", PatientId = 3, DoctorId = 3 }
        );
    }
}`
  },
  {
    id: 'index-cshtml',
    filename: 'Views/Appointments/Index.cshtml',
    category: 'Views',
    language: 'razor',
    description: 'Razor View for Appointment listing: Tag Helpers, LINQ search form, and PRG alerts.',
    code: `@model IEnumerable<HospitalManagementSystem.Models.Appointment>

@{
    ViewData["Title"] = "Appointments";
}

<div class="d-flex justify-content-between align-items-center mb-3">
    <h2>Appointments</h2>
    <a asp-action="Create" class="btn btn-primary">+ New Appointment</a>
</div>

@* Post-Redirect-Get Flash Alerts *@
@if (TempData["Success"] != null)
{
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        @TempData["Success"]
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
}

<!-- LINQ Search Filter Form -->
<form asp-action="Index" method="get" class="mb-3 d-flex gap-2">
    <input type="text" name="search" value="@ViewBag.Search" class="form-control" placeholder="Search by patient, doctor, diagnosis..." />
    <button type="submit" class="btn btn-secondary">Search</button>
    <a asp-action="Index" class="btn btn-outline-secondary">Reset</a>
</form>

<table class="table table-striped table-hover border align-middle">
    <thead class="table-dark">
        <tr>
            <th>Date & Time</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Department</th>
            <th>Diagnosis</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
    @foreach (var item in Model)
    {
        <tr>
            <td>@item.AppointmentDate.ToString("yyyy-MM-dd HH:mm")</td>
            <td>@item.Patient?.Name</td>
            <td>@item.Doctor?.Name</td>
            <td><span class="badge bg-info text-dark">@item.Doctor?.Department?.Name</span></td>
            <td>@item.Diagnosis</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <a asp-action="Details" asp-route-id="@item.Id" class="btn btn-outline-secondary">Details</a>
                    <a asp-action="Edit" asp-route-id="@item.Id" class="btn btn-outline-primary">Edit</a>
                    <a asp-action="Delete" asp-route-id="@item.Id" class="btn btn-outline-danger">Cancel</a>
                </div>
            </td>
        </tr>
    }
    </tbody>
</table>`
  },
  {
    id: 'create-cshtml',
    filename: 'Views/Appointments/Create.cshtml',
    category: 'Views',
    language: 'razor',
    description: 'Razor View for Appointment Creation: ASP.NET Core Tag Helpers and Client-Side Validation.',
    code: `@model HospitalManagementSystem.Models.Appointment

@{
    ViewData["Title"] = "Schedule Appointment";
}

<div class="card col-md-8 mx-auto shadow-sm">
    <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Schedule Appointment</h5>
    </div>
    <div class="card-body">
        <form asp-action="Create" method="post">
            <div asp-validation-summary="ModelOnly" class="text-danger mb-3"></div>

            <div class="mb-3">
                <label asp-for="PatientId" class="form-label"></label>
                <select asp-for="PatientId" class="form-select" asp-items="ViewBag.PatientId">
                    <option value="">-- Choose Patient --</option>
                </select>
                <span asp-validation-for="PatientId" class="text-danger"></span>
            </div>

            <div class="mb-3">
                <label asp-for="DoctorId" class="form-label"></label>
                <select asp-for="DoctorId" class="form-select" asp-items="ViewBag.DoctorId">
                    <option value="">-- Choose Doctor --</option>
                </select>
                <span asp-validation-for="DoctorId" class="text-danger"></span>
            </div>

            <div class="mb-3">
                <label asp-for="AppointmentDate" class="form-label"></label>
                <input asp-for="AppointmentDate" type="datetime-local" class="form-control" />
                <span asp-validation-for="AppointmentDate" class="text-danger"></span>
            </div>

            <div class="mb-3">
                <label asp-for="Diagnosis" class="form-label"></label>
                <textarea asp-for="Diagnosis" class="form-control" rows="3" placeholder="Reason for consultation..."></textarea>
                <span asp-validation-for="Diagnosis" class="text-danger"></span>
            </div>

            <div class="d-flex justify-content-between">
                <a asp-action="Index" class="btn btn-secondary">Back to List</a>
                <button type="submit" class="btn btn-primary">Save Appointment</button>
            </div>
        </form>
    </div>
</div>

@section Scripts {
    @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
}`
  },
  {
    id: 'csproj',
    filename: 'HospitalManagementSystem.csproj',
    category: 'Config',
    language: 'xml',
    description: 'Official .NET 8 Web SDK Project manifest with EntityFrameworkCore.Sqlite package dependencies.',
    code: `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.8" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.8">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>

</Project>`
  }
];
