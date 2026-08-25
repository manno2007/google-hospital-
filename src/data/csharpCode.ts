export interface CSharpFile {
  name: string;
  category: 'Program' | 'Models' | 'Controllers' | 'Data' | 'Views' | 'Config';
  path: string;
  description: string;
  code: string;
}

export const CSHARP_FILES: CSharpFile[] = [
  {
    name: 'Program.cs',
    category: 'Program',
    path: 'Program.cs',
    description: 'Minimal .NET 8 WebApplication bootstrap: adds MVC, EF Core SQLite DbContext, and route mapping.',
    code: `using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add MVC Controllers & Views to DI Container
builder.Services.AddControllersWithViews();

// 2. Add EF Core SQLite DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=Hospital.db"));

var app = builder.Build();

// 3. Auto-create database schema and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// 4. HTTP Middleware Pipeline
app.UseStaticFiles();
app.UseRouting();

// 5. Default MVC Route: /{controller}/{action}/{id?}
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Appointments}/{action=Index}/{id?}");

app.Run();`
  },
  {
    name: 'AppointmentsController.cs',
    category: 'Controllers',
    path: 'Controllers/AppointmentsController.cs',
    description: 'Simple MVC Controller demonstrating LINQ queries (.Include, .Where, .OrderByDescending), DbContext DI, and Post-Redirect-Get.',
    code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers;

public class AppointmentsController : Controller
{
    private readonly AppDbContext _context;

    // Direct DbContext Dependency Injection (No repository boilerplate)
    public AppointmentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: Appointments
    // LINQ: .Include() for eager loading related Patient & Doctor data
    // LINQ: .Where() for filtering search terms
    // LINQ: .OrderByDescending() for sorting by appointment date
    public async Task<IActionResult> Index(string? search)
    {
        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.Department)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(a => 
                a.Patient!.Name.Contains(search) || 
                a.Doctor!.Name.Contains(search) ||
                a.Diagnosis.Contains(search));
        }

        var appointments = await query.OrderByDescending(a => a.AppointmentDate).ToListAsync();
        ViewBag.Search = search;
        return View(appointments);
    }

    // GET: Appointments/Create
    public IActionResult Create()
    {
        // Populate SelectLists for dropdowns
        ViewBag.PatientId = new SelectList(_context.Patients, "Id", "Name");
        ViewBag.DoctorId = new SelectList(_context.Doctors, "Id", "Name");
        return View();
    }

    // POST: Appointments/Create (Post-Redirect-Get Pattern)
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Appointment appointment)
    {
        if (ModelState.IsValid)
        {
            _context.Add(appointment);
            await _context.SaveChangesAsync();
            
            TempData["Success"] = "Appointment scheduled successfully!";
            return RedirectToAction(nameof(Index)); // PRG Pattern
        }

        ViewBag.PatientId = new SelectList(_context.Patients, "Id", "Name", appointment.PatientId);
        ViewBag.DoctorId = new SelectList(_context.Doctors, "Id", "Name", appointment.DoctorId);
        return View(appointment);
    }

    // GET: Appointments/Edit/5
    public async Task<IActionResult> Edit(int id)
    {
        // LINQ: .FindAsync(id)
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null) return NotFound();

        ViewBag.PatientId = new SelectList(_context.Patients, "Id", "Name", appointment.PatientId);
        ViewBag.DoctorId = new SelectList(_context.Doctors, "Id", "Name", appointment.DoctorId);
        return View(appointment);
    }

    // POST: Appointments/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Appointment appointment)
    {
        if (ModelState.IsValid)
        {
            _context.Update(appointment);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Appointment updated!";
            return RedirectToAction(nameof(Index));
        }

        ViewBag.PatientId = new SelectList(_context.Patients, "Id", "Name", appointment.PatientId);
        ViewBag.DoctorId = new SelectList(_context.Doctors, "Id", "Name", appointment.DoctorId);
        return View(appointment);
    }

    // POST: Appointments/Delete/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment != null)
        {
            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Appointment cancelled!";
        }
        return RedirectToAction(nameof(Index));
    }
}`
  },
  {
    name: 'DoctorsController.cs',
    category: 'Controllers',
    path: 'Controllers/DoctorsController.cs',
    description: 'Controller demonstrating LINQ .Include(d => d.Department) and SelectList bindings.',
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

    // GET: Doctors (LINQ .Include and .OrderBy)
    public async Task<IActionResult> Index()
    {
        var doctors = await _context.Doctors
            .Include(d => d.Department)
            .OrderBy(d => d.Name)
            .ToListAsync();
        return View(doctors);
    }

    // GET: Doctors/Create
    public IActionResult Create()
    {
        ViewBag.DepartmentId = new SelectList(_context.Departments, "Id", "Name");
        return View();
    }

    // POST: Doctors/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Doctor doctor)
    {
        if (ModelState.IsValid)
        {
            _context.Add(doctor);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Doctor registered!";
            return RedirectToAction(nameof(Index));
        }

        ViewBag.DepartmentId = new SelectList(_context.Departments, "Id", "Name", doctor.DepartmentId);
        return View(doctor);
    }

    // POST: Doctors/Delete/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var doctor = await _context.Doctors.FindAsync(id);
        if (doctor != null)
        {
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Doctor removed!";
        }
        return RedirectToAction(nameof(Index));
    }
}`
  },
  {
    name: 'PatientsController.cs',
    category: 'Controllers',
    path: 'Controllers/PatientsController.cs',
    description: 'Controller for managing patient records.',
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

    // GET: Patients (LINQ .OrderBy)
    public async Task<IActionResult> Index()
    {
        var patients = await _context.Patients
            .OrderBy(p => p.Name)
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
    public async Task<IActionResult> Create(Patient patient)
    {
        if (ModelState.IsValid)
        {
            _context.Add(patient);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Patient registered!";
            return RedirectToAction(nameof(Index));
        }
        return View(patient);
    }

    // POST: Patients/Delete/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
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
    name: 'DepartmentsController.cs',
    category: 'Controllers',
    path: 'Controllers/DepartmentsController.cs',
    description: 'Controller for managing clinical hospital departments.',
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
            .OrderBy(d => d.Name)
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
    public async Task<IActionResult> Create(Department department)
    {
        if (ModelState.IsValid)
        {
            _context.Add(department);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Department created!";
            return RedirectToAction(nameof(Index));
        }
        return View(department);
    }

    // POST: Departments/Delete/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department != null)
        {
            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Department deleted!";
        }
        return RedirectToAction(nameof(Index));
    }
}`
  },
  {
    name: 'Appointment.cs',
    category: 'Models',
    path: 'Models/Appointment.cs',
    description: 'Appointment Model with Foreign Keys to Patient and Doctor.',
    code: `using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models;

public class Appointment
{
    public int Id { get; set; }

    [Required]
    [Display(Name = "Date & Time")]
    public DateTime AppointmentDate { get; set; } = DateTime.Now;

    [Required]
    [Display(Name = "Diagnosis / Reason")]
    public string Diagnosis { get; set; } = string.Empty;

    // Foreign Key: Patient
    [Required]
    [Display(Name = "Patient")]
    public int PatientId { get; set; }
    public Patient? Patient { get; set; }

    // Foreign Key: Doctor
    [Required]
    [Display(Name = "Doctor")]
    public int DoctorId { get; set; }
    public Doctor? Doctor { get; set; }
}`
  },
  {
    name: 'Doctor.cs',
    category: 'Models',
    path: 'Models/Doctor.cs',
    description: 'Doctor Model with Foreign Key to Department.',
    code: `using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models;

public class Doctor
{
    public int Id { get; set; }

    [Required]
    [Display(Name = "Doctor Name")]
    public string Name { get; set; } = string.Empty;

    // Foreign Key: Department
    [Required]
    [Display(Name = "Department")]
    public int DepartmentId { get; set; }
    public Department? Department { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}`
  },
  {
    name: 'Patient.cs',
    category: 'Models',
    path: 'Models/Patient.cs',
    description: 'Patient Model with 1-to-many relationship with Appointments.',
    code: `using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models;

public class Patient
{
    public int Id { get; set; }

    [Required]
    [Display(Name = "Patient Name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Date)]
    [Display(Name = "Registration Date")]
    public DateTime RegistrationDate { get; set; } = DateTime.Today;

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}`
  },
  {
    name: 'Department.cs',
    category: 'Models',
    path: 'Models/Department.cs',
    description: 'Department Model with 1-to-many relationship with Doctors.',
    code: `using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models;

public class Department
{
    public int Id { get; set; }

    [Required]
    [Display(Name = "Department Name")]
    public string Name { get; set; } = string.Empty;

    public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}`
  },
  {
    name: 'AppDbContext.cs',
    category: 'Data',
    path: 'Data/AppDbContext.cs',
    description: 'EF Core DbContext configuring DbSets and initial seed data.',
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

        // Initial Seed Data
        modelBuilder.Entity<Department>().HasData(
            new Department { Id = 1, Name = "Cardiology" },
            new Department { Id = 2, Name = "Neurology" },
            new Department { Id = 3, Name = "Pediatrics" }
        );

        modelBuilder.Entity<Doctor>().HasData(
            new Doctor { Id = 1, Name = "Dr. Sarah Al-Mansoor", DepartmentId = 1 },
            new Doctor { Id = 2, Name = "Dr. Marcus Vance", DepartmentId = 2 },
            new Doctor { Id = 3, Name = "Dr. Elena Rostova", DepartmentId = 3 }
        );

        modelBuilder.Entity<Patient>().HasData(
            new Patient { Id = 1, Name = "Amina Khalid", RegistrationDate = new DateTime(2024, 1, 15) },
            new Patient { Id = 2, Name = "Omar Farooq", RegistrationDate = new DateTime(2024, 2, 20) }
        );

        modelBuilder.Entity<Appointment>().HasData(
            new Appointment { Id = 1, AppointmentDate = DateTime.Now.AddDays(1), Diagnosis = "Heart checkup", PatientId = 1, DoctorId = 1 },
            new Appointment { Id = 2, AppointmentDate = DateTime.Now.AddDays(2), Diagnosis = "Migraine headache", PatientId = 2, DoctorId = 2 }
        );
    }
}`
  },
  {
    name: 'Index.cshtml',
    category: 'Views',
    path: 'Views/Appointments/Index.cshtml',
    description: 'Razor View displaying appointments table with search bar and flash message.',
    code: `@model IEnumerable<HospitalManagementSystem.Models.Appointment>

@{
    ViewData["Title"] = "Appointments";
}

<div class="d-flex justify-content-between align-items-center mb-3">
    <h2>Appointments</h2>
    <a asp-action="Create" class="btn btn-primary">+ New Appointment</a>
</div>

@* Post-Redirect-Get Flash Alert *@
@if (TempData["Success"] != null)
{
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        @TempData["Success"]
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
}

<!-- LINQ Search Form -->
<form asp-action="Index" method="get" class="mb-3 d-flex gap-2">
    <input type="text" name="search" value="@ViewBag.Search" class="form-control" placeholder="Search..." />
    <button type="submit" class="btn btn-secondary">Search</button>
    <a asp-action="Index" class="btn btn-outline-secondary">Reset</a>
</form>

<table class="table table-striped table-hover border">
    <thead class="table-dark">
        <tr>
            <th>Date</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Department</th>
            <th>Diagnosis</th>
            <th>Action</th>
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
                <div class="d-flex gap-1">
                    <a asp-action="Edit" asp-route-id="@item.Id" class="btn btn-sm btn-outline-primary">Edit</a>
                    <form asp-action="Delete" asp-route-id="@item.Id" method="post" onsubmit="return confirm('Cancel appointment?');">
                        <button type="submit" class="btn btn-sm btn-outline-danger">Cancel</button>
                    </form>
                </div>
            </td>
        </tr>
    }
    </tbody>
</table>`
  },
  {
    name: 'Create.cshtml',
    category: 'Views',
    path: 'Views/Appointments/Create.cshtml',
    description: 'Razor View for scheduling an appointment using ASP.NET Core Tag Helpers.',
    code: `@model HospitalManagementSystem.Models.Appointment

@{
    ViewData["Title"] = "New Appointment";
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
                <textarea asp-for="Diagnosis" class="form-control" rows="3" placeholder="Reason for visit..."></textarea>
                <span asp-validation-for="Diagnosis" class="text-danger"></span>
            </div>

            <div class="d-flex justify-content-between">
                <a asp-action="Index" class="btn btn-secondary">Back</a>
                <button type="submit" class="btn btn-primary">Save Appointment</button>
            </div>
        </form>
    </div>
</div>`
  }
];
