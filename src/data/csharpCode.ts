import { CodeFile } from '../types';

export const CSHARP_FILES: CodeFile[] = [
  // 1. MODELS
  {
    id: 'department-cs',
    filename: 'Models/Department.cs',
    category: 'Models',
    language: 'csharp',
    description: 'Department entity with validation data annotations and 1-to-Many relationship with Doctors.',
    code: `using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models
{
    public class Department
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Department Name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Department name must be between 2 and 100 characters.")]
        [Display(Name = "Department Name")]
        public string Name { get; set; } = string.Empty;

        // Navigation property: One Department has Many Doctors
        public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}`
  },
  {
    id: 'patient-cs',
    filename: 'Models/Patient.cs',
    category: 'Models',
    language: 'csharp',
    description: 'Patient entity with registration date validation and 1-to-Many relationship with Appointments.',
    code: `using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models
{
    public class Patient
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Patient Name is required.")]
        [StringLength(120, MinimumLength = 3, ErrorMessage = "Patient name must be between 3 and 120 characters.")]
        [Display(Name = "Patient Name")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Registration Date is required.")]
        [DataType(DataType.Date)]
        [Display(Name = "Registration Date")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime RegistrationDate { get; set; } = DateTime.Today;

        // Navigation property: One Patient has Many Appointments
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}`
  },
  {
    id: 'doctor-cs',
    filename: 'Models/Doctor.cs',
    category: 'Models',
    language: 'csharp',
    description: 'Doctor entity with Foreign Key to Department and 1-to-Many relationship with Appointments.',
    code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagementSystem.Models
{
    public class Doctor
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Doctor Name is required.")]
        [StringLength(120, MinimumLength = 3, ErrorMessage = "Doctor name must be between 3 and 120 characters.")]
        [Display(Name = "Doctor Name")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please select a Department.")]
        [Display(Name = "Department")]
        [ForeignKey(nameof(Department))]
        public int DepartmentId { get; set; }

        // Navigation property to Department
        [Display(Name = "Department")]
        public Department? Department { get; set; }

        // Navigation property: One Doctor has Many Appointments
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}`
  },
  {
    id: 'appointment-cs',
    filename: 'Models/Appointment.cs',
    category: 'Models',
    language: 'csharp',
    description: 'Appointment entity connecting Patient and Doctor with Date and Diagnosis validations.',
    code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagementSystem.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Appointment Date & Time is required.")]
        [DataType(DataType.DateTime)]
        [Display(Name = "Appointment Date & Time")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd HH:mm}", ApplyFormatInEditMode = true)]
        public DateTime AppointmentDate { get; set; } = DateTime.Now.AddHours(1);

        [Required(ErrorMessage = "Diagnosis or description is required.")]
        [StringLength(500, ErrorMessage = "Diagnosis description cannot exceed 500 characters.")]
        [DataType(DataType.MultilineText)]
        [Display(Name = "Diagnosis / Reason")]
        public string Diagnosis { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please select a Patient.")]
        [Display(Name = "Patient")]
        [ForeignKey(nameof(Patient))]
        public int PatientId { get; set; }

        // Navigation property
        [Display(Name = "Patient")]
        public Patient? Patient { get; set; }

        [Required(ErrorMessage = "Please select a Doctor.")]
        [Display(Name = "Doctor")]
        [ForeignKey(nameof(Doctor))]
        public int DoctorId { get; set; }

        // Navigation property
        [Display(Name = "Doctor")]
        public Doctor? Doctor { get; set; }
    }
}`
  },

  // 2. DATA / APPDBCONTEXT
  {
    id: 'appdbcontext-cs',
    filename: 'Data/AppDbContext.cs',
    category: 'Data',
    language: 'csharp',
    description: 'EF Core DbContext configuring SQLite tables, explicit relationships via Fluent API, and Seed Data.',
    code: `using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Patient> Patients { get; set; } = null!;
        public DbSet<Doctor> Doctors { get; set; } = null!;
        public DbSet<Appointment> Appointments { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==========================================
            // 1. Department <-> Doctor (1-to-Many)
            // ==========================================
            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.Department)
                .WithMany(dep => dep.Doctors)
                .HasForeignKey(d => d.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // ==========================================
            // 2. Patient <-> Appointment (1-to-Many)
            // ==========================================
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            // ==========================================
            // 3. Doctor <-> Appointment (1-to-Many)
            // ==========================================
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // ==========================================
            // 4. Seed Data
            // ==========================================
            modelBuilder.Entity<Department>().HasData(
                new Department { Id = 1, Name = "Cardiology" },
                new Department { Id = 2, Name = "Neurology" },
                new Department { Id = 3, Name = "Pediatrics" },
                new Department { Id = 4, Name = "Orthopedics" },
                new Department { Id = 5, Name = "General Surgery" }
            );

            modelBuilder.Entity<Doctor>().HasData(
                new Doctor { Id = 1, Name = "Dr. Sarah Al-Mansoor", DepartmentId = 1 },
                new Doctor { Id = 2, Name = "Dr. Marcus Vance", DepartmentId = 1 },
                new Doctor { Id = 3, Name = "Dr. Elena Rostova", DepartmentId = 2 },
                new Doctor { Id = 4, Name = "Dr. Tariq Mahmoud", DepartmentId = 3 },
                new Doctor { Id = 5, Name = "Dr. James Wilson", DepartmentId = 4 }
            );

            modelBuilder.Entity<Patient>().HasData(
                new Patient { Id = 1, Name = "Amina Khalid", RegistrationDate = new DateTime(2024, 1, 15) },
                new Patient { Id = 2, Name = "Omar Farooq", RegistrationDate = new DateTime(2024, 2, 20) },
                new Patient { Id = 3, Name = "Chloe Bennett", RegistrationDate = new DateTime(2024, 3, 5) },
                new Patient { Id = 4, Name = "Youssef Ibrahim", RegistrationDate = new DateTime(2024, 4, 12) }
            );

            modelBuilder.Entity<Appointment>().HasData(
                new Appointment
                {
                    Id = 1,
                    AppointmentDate = new DateTime(2024, 10, 15, 10, 30, 0),
                    Diagnosis = "Routine cardiac checkup; mild hypertension monitoring.",
                    PatientId = 1,
                    DoctorId = 1
                },
                new Appointment
                {
                    Id = 2,
                    AppointmentDate = new DateTime(2024, 10, 16, 14, 0, 0),
                    Diagnosis = "Recurring migraine episodes with visual aura.",
                    PatientId = 2,
                    DoctorId = 3
                },
                new Appointment
                {
                    Id = 3,
                    AppointmentDate = new DateTime(2024, 10, 18, 11, 15, 0),
                    Diagnosis = "Pediatric asthma follow-up and inhaler dosage adjustment.",
                    PatientId = 3,
                    DoctorId = 4
                },
                new Appointment
                {
                    Id = 4,
                    AppointmentDate = new DateTime(2024, 10, 20, 09, 00, 0),
                    Diagnosis = "Post-operative knee arthroscopy evaluation.",
                    PatientId = 4,
                    DoctorId = 5
                }
            );
        }
    }
}`
  },

  // 3. PROGRAM.CS
  {
    id: 'program-cs',
    filename: 'Program.cs',
    category: 'Program',
    language: 'csharp',
    description: 'ASP.NET Core 8 minimal hosting setup with SQLite, EF Core migration bootstrapping, and MVC routing.',
    code: `using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register AppDbContext with SQLite provider directly
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=HospitalManagement.db"));

var app = builder.Build();

// Ensure the SQLite database is created and migrations / seed data applied on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating/seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

// Default Route pattern: controller/action/id
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Appointments}/{action=Index}/{id?}");

app.Run();`
  },

  // 4. CONTROLLERS
  {
    id: 'appointments-controller-cs',
    filename: 'Controllers/AppointmentsController.cs',
    category: 'Controllers',
    language: 'csharp',
    description: 'Complete 7 CRUD actions for Appointments with Eager Loading (.Include), ViewBag SelectLists, [Bind], [ValidateAntiForgeryToken], and PRG pattern.',
    code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers
{
    public class AppointmentsController : Controller
    {
        private readonly AppDbContext _context;

        // Constructor directly injecting AppDbContext (No repository pattern)
        public AppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: Appointments (Index with Eager Loading)
        public async Task<IActionResult> Index(string? searchString)
        {
            var query = _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.Department)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchString))
            {
                query = query.Where(a => 
                    a.Patient!.Name.ToLower().Contains(searchString.ToLower()) ||
                    a.Doctor!.Name.ToLower().Contains(searchString.ToLower()) ||
                    a.Diagnosis.ToLower().Contains(searchString.ToLower()));
            }

            var appointments = await query.OrderByDescending(a => a.AppointmentDate).ToListAsync();
            ViewData["CurrentFilter"] = searchString;
            return View(appointments);
        }

        // 2. GET: Appointments/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.Department)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (appointment == null)
            {
                return NotFound();
            }

            return View(appointment);
        }

        // 3. GET: Appointments/Create
        public IActionResult Create()
        {
            PopulateDropdowns();
            return View(new Appointment { AppointmentDate = DateTime.Now.AddHours(2) });
        }

        // 4. POST: Appointments/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("AppointmentDate,Diagnosis,PatientId,DoctorId")] Appointment appointment)
        {
            if (ModelState.IsValid)
            {
                _context.Add(appointment);
                await _context.SaveChangesAsync();

                // Post/Redirect/Get (PRG) pattern with TempData
                TempData["Success"] = "Appointment scheduled successfully!";
                return RedirectToAction(nameof(Index));
            }

            // Re-populate dropdowns if validation fails
            PopulateDropdowns(appointment.PatientId, appointment.DoctorId);
            return View(appointment);
        }

        // 5. GET: Appointments/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

            PopulateDropdowns(appointment.PatientId, appointment.DoctorId);
            return View(appointment);
        }

        // 6. POST: Appointments/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,AppointmentDate,Diagnosis,PatientId,DoctorId")] Appointment appointment)
        {
            if (id != appointment.Id)
            {
                return NotFound();
            }

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
                    if (!AppointmentExists(appointment.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
            }

            PopulateDropdowns(appointment.PatientId, appointment.DoctorId);
            return View(appointment);
        }

        // 7. GET: Appointments/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.Department)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (appointment == null)
            {
                return NotFound();
            }

            return View(appointment);
        }

        // POST: Appointments/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment != null)
            {
                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Appointment deleted successfully!";
            }

            return RedirectToAction(nameof(Index));
        }

        // Helper: populate Patient and Doctor dropdown lists
        private void PopulateDropdowns(object? selectedPatient = null, object? selectedDoctor = null)
        {
            var patients = _context.Patients.OrderBy(p => p.Name).AsNoTracking().ToList();
            var doctors = _context.Doctors.Include(d => d.Department).OrderBy(d => d.Name).AsNoTracking().ToList();

            ViewBag.PatientId = new SelectList(patients, "Id", "Name", selectedPatient);
            
            // Format doctor name with department in dropdown
            var doctorList = doctors.Select(d => new {
                Id = d.Id,
                DisplayName = $"{d.Name} ({d.Department?.Name ?? "General"})"
            });
            ViewBag.DoctorId = new SelectList(doctorList, "Id", "DisplayName", selectedDoctor);
        }

        private bool AppointmentExists(int id)
        {
            return _context.Appointments.Any(e => e.Id == id);
        }
    }
}`
  },
  {
    id: 'departments-controller-cs',
    filename: 'Controllers/DepartmentsController.cs',
    category: 'Controllers',
    language: 'csharp',
    description: 'Complete 7 CRUD actions for Departments with direct AppDbContext injection, Doctors counting via .Include, and TempData messages.',
    code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers
{
    public class DepartmentsController : Controller
    {
        private readonly AppDbContext _context;

        public DepartmentsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: Departments
        public async Task<IActionResult> Index()
        {
            var departments = await _context.Departments
                .Include(d => d.Doctors)
                .AsNoTracking()
                .ToListAsync();
            return View(departments);
        }

        // 2. GET: Departments/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null) return NotFound();

            var department = await _context.Departments
                .Include(d => d.Doctors)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (department == null) return NotFound();

            return View(department);
        }

        // 3. GET: Departments/Create
        public IActionResult Create()
        {
            return View();
        }

        // 4. POST: Departments/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Name")] Department department)
        {
            if (ModelState.IsValid)
            {
                _context.Add(department);
                await _context.SaveChangesAsync();
                TempData["Success"] = $"Department '{department.Name}' created successfully!";
                return RedirectToAction(nameof(Index));
            }
            return View(department);
        }

        // 5. GET: Departments/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();

            var department = await _context.Departments.FindAsync(id);
            if (department == null) return NotFound();

            return View(department);
        }

        // 6. POST: Departments/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Name")] Department department)
        {
            if (id != department.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(department);
                    await _context.SaveChangesAsync();
                    TempData["Success"] = "Department updated successfully!";
                    return RedirectToAction(nameof(Index));
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!_context.Departments.Any(e => e.Id == department.Id)) return NotFound();
                    throw;
                }
            }
            return View(department);
        }

        // 7. GET: Departments/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null) return NotFound();

            var department = await _context.Departments
                .Include(d => d.Doctors)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (department == null) return NotFound();

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
                    TempData["Error"] = "Cannot delete department with associated active doctors!";
                    return RedirectToAction(nameof(Index));
                }

                _context.Departments.Remove(department);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Department removed successfully!";
            }

            return RedirectToAction(nameof(Index));
        }
    }
}`
  },
  {
    id: 'doctors-controller-cs',
    filename: 'Controllers/DoctorsController.cs',
    category: 'Controllers',
    language: 'csharp',
    description: 'Complete 7 CRUD actions for Doctors with Department dropdown populated via ViewBag and eager loading.',
    code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers
{
    public class DoctorsController : Controller
    {
        private readonly AppDbContext _context;

        public DoctorsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: Doctors
        public async Task<IActionResult> Index()
        {
            var doctors = await _context.Doctors
                .Include(d => d.Department)
                .Include(d => d.Appointments)
                .AsNoTracking()
                .ToListAsync();
            return View(doctors);
        }

        // 2. GET: Doctors/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null) return NotFound();

            var doctor = await _context.Doctors
                .Include(d => d.Department)
                .Include(d => d.Appointments)
                    .ThenInclude(a => a.Patient)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (doctor == null) return NotFound();

            return View(doctor);
        }

        // 3. GET: Doctors/Create
        public IActionResult Create()
        {
            ViewBag.DepartmentId = new SelectList(_context.Departments.OrderBy(d => d.Name), "Id", "Name");
            return View();
        }

        // 4. POST: Doctors/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Name,DepartmentId")] Doctor doctor)
        {
            if (ModelState.IsValid)
            {
                _context.Add(doctor);
                await _context.SaveChangesAsync();
                TempData["Success"] = $"Doctor '{doctor.Name}' registered successfully!";
                return RedirectToAction(nameof(Index));
            }

            ViewBag.DepartmentId = new SelectList(_context.Departments.OrderBy(d => d.Name), "Id", "Name", doctor.DepartmentId);
            return View(doctor);
        }

        // 5. GET: Doctors/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();

            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null) return NotFound();

            ViewBag.DepartmentId = new SelectList(_context.Departments.OrderBy(d => d.Name), "Id", "Name", doctor.DepartmentId);
            return View(doctor);
        }

        // 6. POST: Doctors/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Name,DepartmentId")] Doctor doctor)
        {
            if (id != doctor.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(doctor);
                    await _context.SaveChangesAsync();
                    TempData["Success"] = "Doctor record updated successfully!";
                    return RedirectToAction(nameof(Index));
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!_context.Doctors.Any(e => e.Id == doctor.Id)) return NotFound();
                    throw;
                }
            }

            ViewBag.DepartmentId = new SelectList(_context.Departments.OrderBy(d => d.Name), "Id", "Name", doctor.DepartmentId);
            return View(doctor);
        }

        // 7. GET: Doctors/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null) return NotFound();

            var doctor = await _context.Doctors
                .Include(d => d.Department)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (doctor == null) return NotFound();

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
                TempData["Success"] = "Doctor deleted successfully!";
            }

            return RedirectToAction(nameof(Index));
        }
    }
}`
  },
  {
    id: 'patients-controller-cs',
    filename: 'Controllers/PatientsController.cs',
    category: 'Controllers',
    language: 'csharp',
    description: 'Complete 7 CRUD actions for Patients with registration date tracking and Appointment history eager loading.',
    code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers
{
    public class PatientsController : Controller
    {
        private readonly AppDbContext _context;

        public PatientsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: Patients
        public async Task<IActionResult> Index()
        {
            var patients = await _context.Patients
                .Include(p => p.Appointments)
                .AsNoTracking()
                .ToListAsync();
            return View(patients);
        }

        // 2. GET: Patients/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null) return NotFound();

            var patient = await _context.Patients
                .Include(p => p.Appointments)
                    .ThenInclude(a => a.Doctor)
                        .ThenInclude(d => d.Department)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (patient == null) return NotFound();

            return View(patient);
        }

        // 3. GET: Patients/Create
        public IActionResult Create()
        {
            return View(new Patient { RegistrationDate = DateTime.Today });
        }

        // 4. POST: Patients/Create
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

        // 5. GET: Patients/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();

            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound();

            return View(patient);
        }

        // 6. POST: Patients/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Name,RegistrationDate")] Patient patient)
        {
            if (id != patient.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(patient);
                    await _context.SaveChangesAsync();
                    TempData["Success"] = "Patient details updated successfully!";
                    return RedirectToAction(nameof(Index));
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!_context.Patients.Any(e => e.Id == patient.Id)) return NotFound();
                    throw;
                }
            }
            return View(patient);
        }

        // 7. GET: Patients/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null) return NotFound();

            var patient = await _context.Patients
                .Include(p => p.Appointments)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (patient == null) return NotFound();

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
                TempData["Success"] = "Patient deleted successfully!";
            }

            return RedirectToAction(nameof(Index));
        }
    }
}`
  },

  // 5. RAZOR VIEWS
  {
    id: 'appointments-index-cshtml',
    filename: 'Views/Appointments/Index.cshtml',
    category: 'Views',
    language: 'html',
    description: 'Razor Index view for Appointments rendering table with Patient, Doctor, Department, TempData alert, and Search bar.',
    code: `@model IEnumerable<HospitalManagementSystem.Models.Appointment>

@{
    ViewData["Title"] = "Appointments";
}

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h1 class="h3 mb-0 text-gray-800">
            <i class="bi bi-calendar-check text-primary me-2"></i>Appointments
        </h1>
        <p class="text-muted small mb-0">Manage hospital appointments, patients, and assigned specialists.</p>
    </div>
    <a asp-action="Create" class="btn btn-primary shadow-sm">
        <i class="bi bi-plus-circle me-1"></i> Schedule Appointment
    </a>
</div>

@if (TempData["Success"] != null)
{
    <div class="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i> @TempData["Success"]
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
}

<div class="card shadow-sm border-0 mb-4">
    <div class="card-body">
        <form asp-action="Index" method="get" class="row g-2 align-items-center mb-3">
            <div class="col-md-6 col-lg-4">
                <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                        <i class="bi bi-search text-muted"></i>
                    </span>
                    <input type="text" name="searchString" value="@ViewData["CurrentFilter"]" 
                           class="form-control bg-light border-start-0" 
                           placeholder="Search by patient, doctor, or diagnosis..." />
                </div>
            </div>
            <div class="col-auto">
                <button type="submit" class="btn btn-secondary">Filter</button>
                <a asp-action="Index" class="btn btn-outline-secondary">Reset</a>
            </div>
        </form>

        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Date & Time</th>
                        <th>Patient</th>
                        <th>Doctor / Specialist</th>
                        <th>Department</th>
                        <th>Diagnosis / Reason</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                @if (Model != null && Model.Any())
                {
                    @foreach (var item in Model)
                    {
                        <tr>
                            <td>
                                <span class="badge bg-light text-dark border">
                                    <i class="bi bi-clock me-1 text-primary"></i>
                                    @item.AppointmentDate.ToString("yyyy-MM-dd HH:mm")
                                </span>
                            </td>
                            <td class="fw-semibold">
                                <i class="bi bi-person text-secondary me-1"></i>
                                @item.Patient?.Name
                            </td>
                            <td>
                                <span class="text-primary fw-medium">@item.Doctor?.Name</span>
                            </td>
                            <td>
                                <span class="badge bg-info-subtle text-info border border-info-subtle">
                                    @item.Doctor?.Department?.Name
                                </span>
                            </td>
                            <td class="text-truncate" style="max-width: 260px;" title="@item.Diagnosis">
                                @item.Diagnosis
                            </td>
                            <td class="text-end">
                                <div class="btn-group btn-group-sm" role="group">
                                    <a asp-action="Details" asp-route-id="@item.Id" class="btn btn-outline-info" title="Details">
                                        <i class="bi bi-eye"></i>
                                    </a>
                                    <a asp-action="Edit" asp-route-id="@item.Id" class="btn btn-outline-warning" title="Edit">
                                        <i class="bi bi-pencil"></i>
                                    </a>
                                    <a asp-action="Delete" asp-route-id="@item.Id" class="btn btn-outline-danger" title="Delete">
                                        <i class="bi bi-trash"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>
                    }
                }
                else
                {
                    <tr>
                        <td colspan="6" class="text-center py-5 text-muted">
                            <i class="bi bi-calendar-x display-6 d-block mb-2 text-secondary opacity-50"></i>
                            No appointments found. Click "Schedule Appointment" to add one.
                        </td>
                    </tr>
                }
                </tbody>
            </table>
        </div>
    </div>
</div>`
  },
  {
    id: 'appointments-create-cshtml',
    filename: 'Views/Appointments/Create.cshtml',
    category: 'Views',
    language: 'html',
    description: 'Razor Create view for Appointments showing asp-for bindings, Validation Summary, and ViewBag Dropdowns for Doctors and Patients.',
    code: `@model HospitalManagementSystem.Models.Appointment

@{
    ViewData["Title"] = "Schedule Appointment";
}

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card shadow-sm border-0">
            <div class="card-header bg-primary text-white py-3">
                <h5 class="card-title mb-0">
                    <i class="bi bi-calendar-plus me-2"></i>Schedule New Appointment
                </h5>
            </div>
            <div class="card-body p-4">
                <form asp-action="Create" method="post">
                    @* Antiforgery token tag helper handles validation *@
                    @Html.AntiForgeryToken()

                    @* Global Validation Summary *@
                    <div asp-validation-summary="ModelOnly" class="alert alert-danger" role="alert"></div>

                    <div class="row g-3">
                        @* 1. Patient Dropdown populated from ViewBag.PatientId *@
                        <div class="col-md-6">
                            <label asp-for="PatientId" class="form-label fw-semibold"></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light"><i class="bi bi-person"></i></span>
                                <select asp-for="PatientId" class="form-select" asp-items="ViewBag.PatientId">
                                    <option value="">-- Select Patient --</option>
                                </select>
                            </div>
                            <span asp-validation-for="PatientId" class="text-danger small"></span>
                        </div>

                        @* 2. Doctor Dropdown populated from ViewBag.DoctorId *@
                        <div class="col-md-6">
                            <label asp-for="DoctorId" class="form-label fw-semibold"></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light"><i class="bi bi-heart-pulse"></i></span>
                                <select asp-for="DoctorId" class="form-select" asp-items="ViewBag.DoctorId">
                                    <option value="">-- Select Doctor & Department --</option>
                                </select>
                            </div>
                            <span asp-validation-for="DoctorId" class="text-danger small"></span>
                        </div>

                        @* 3. Appointment Date & Time *@
                        <div class="col-12">
                            <label asp-for="AppointmentDate" class="form-label fw-semibold"></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light"><i class="bi bi-clock"></i></span>
                                <input asp-for="AppointmentDate" type="datetime-local" class="form-control" />
                            </div>
                            <span asp-validation-for="AppointmentDate" class="text-danger small"></span>
                        </div>

                        @* 4. Diagnosis / Description *@
                        <div class="col-12">
                            <label asp-for="Diagnosis" class="form-label fw-semibold"></label>
                            <textarea asp-for="Diagnosis" class="form-control" rows="4" 
                                      placeholder="Enter patient symptoms, reason for visit, or preliminary diagnosis..."></textarea>
                            <span asp-validation-for="Diagnosis" class="text-danger small"></span>
                        </div>
                    </div>

                    <div class="mt-4 pt-3 border-top d-flex justify-content-between">
                        <a asp-action="Index" class="btn btn-outline-secondary">
                            <i class="bi bi-arrow-left me-1"></i> Back to List
                        </a>
                        <button type="submit" class="btn btn-primary px-4">
                            <i class="bi bi-check-lg me-1"></i> Save Appointment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@section Scripts {
    @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
}`
  },
  {
    id: 'appointments-edit-cshtml',
    filename: 'Views/Appointments/Edit.cshtml',
    category: 'Views',
    language: 'html',
    description: 'Razor Edit view for Appointments with pre-selected dropdowns, hidden Id field, and full validation.',
    code: `@model HospitalManagementSystem.Models.Appointment

@{
    ViewData["Title"] = "Edit Appointment";
}

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card shadow-sm border-0">
            <div class="card-header bg-warning text-dark py-3">
                <h5 class="card-title mb-0">
                    <i class="bi bi-pencil-square me-2"></i>Edit Appointment #@Model.Id
                </h5>
            </div>
            <div class="card-body p-4">
                <form asp-action="Edit" method="post">
                    @Html.AntiForgeryToken()
                    <input type="hidden" asp-for="Id" />
                    <div asp-validation-summary="ModelOnly" class="alert alert-danger" role="alert"></div>

                    <div class="row g-3">
                        <div class="col-md-6">
                            <label asp-for="PatientId" class="form-label fw-semibold"></label>
                            <select asp-for="PatientId" class="form-select" asp-items="ViewBag.PatientId"></select>
                            <span asp-validation-for="PatientId" class="text-danger small"></span>
                        </div>

                        <div class="col-md-6">
                            <label asp-for="DoctorId" class="form-label fw-semibold"></label>
                            <select asp-for="DoctorId" class="form-select" asp-items="ViewBag.DoctorId"></select>
                            <span asp-validation-for="DoctorId" class="text-danger small"></span>
                        </div>

                        <div class="col-12">
                            <label asp-for="AppointmentDate" class="form-label fw-semibold"></label>
                            <input asp-for="AppointmentDate" type="datetime-local" class="form-control" />
                            <span asp-validation-for="AppointmentDate" class="text-danger small"></span>
                        </div>

                        <div class="col-12">
                            <label asp-for="Diagnosis" class="form-label fw-semibold"></label>
                            <textarea asp-for="Diagnosis" class="form-control" rows="4"></textarea>
                            <span asp-validation-for="Diagnosis" class="text-danger small"></span>
                        </div>
                    </div>

                    <div class="mt-4 pt-3 border-top d-flex justify-content-between">
                        <a asp-action="Index" class="btn btn-outline-secondary">
                            <i class="bi bi-arrow-left me-1"></i> Cancel
                        </a>
                        <button type="submit" class="btn btn-warning px-4">
                            <i class="bi bi-save me-1"></i> Update Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@section Scripts {
    @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
}`
  },
  {
    id: 'appointments-delete-cshtml',
    filename: 'Views/Appointments/Delete.cshtml',
    category: 'Views',
    language: 'html',
    description: 'Razor Delete confirmation view with antiforgery token and details display.',
    code: `@model HospitalManagementSystem.Models.Appointment

@{
    ViewData["Title"] = "Delete Appointment";
}

<div class="row justify-content-center">
    <div class="col-lg-6">
        <div class="card shadow-sm border-danger border-top border-4">
            <div class="card-body p-4">
                <h4 class="card-title text-danger mb-3">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>Delete Appointment Confirmation
                </h4>
                <p class="text-muted">Are you sure you want to permanently cancel and delete this appointment?</p>

                <dl class="row bg-light p-3 rounded mb-4">
                    <dt class="col-sm-4 text-muted">Patient:</dt>
                    <dd class="col-sm-8 fw-bold">@Model.Patient?.Name</dd>

                    <dt class="col-sm-4 text-muted">Doctor:</dt>
                    <dd class="col-sm-8">@Model.Doctor?.Name (@Model.Doctor?.Department?.Name)</dd>

                    <dt class="col-sm-4 text-muted">Date & Time:</dt>
                    <dd class="col-sm-8">@Model.AppointmentDate.ToString("f")</dd>

                    <dt class="col-sm-4 text-muted">Diagnosis:</dt>
                    <dd class="col-sm-8">@Model.Diagnosis</dd>
                </dl>

                <form asp-action="Delete" method="post" class="d-flex justify-content-between">
                    @Html.AntiForgeryToken()
                    <input type="hidden" asp-for="Id" />
                    <a asp-action="Index" class="btn btn-outline-secondary">
                        <i class="bi bi-arrow-left me-1"></i> Back to List
                    </a>
                    <button type="submit" class="btn btn-danger px-4">
                        <i class="bi bi-trash-fill me-1"></i> Confirm Delete
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>`
  },
  {
    id: 'shared-layout-cshtml',
    filename: 'Views/Shared/_Layout.cshtml',
    category: 'Views',
    language: 'html',
    description: 'Master Bootstrap 5 Layout with Navigation bar, TempData toasts, and responsive header.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - Hospital Management System</title>
    <!-- Bootstrap 5 CSS & Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
</head>
<body class="bg-light d-flex flex-column min-vh-100">
    <header>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div class="container">
                <a class="navbar-brand fw-bold text-primary" asp-controller="Appointments" asp-action="Index">
                    <i class="bi bi-hospital me-2 text-danger"></i>MediCore Care
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" asp-controller="Appointments" asp-action="Index">
                                <i class="bi bi-calendar-check me-1"></i> Appointments
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" asp-controller="Patients" asp-action="Index">
                                <i class="bi bi-people me-1"></i> Patients
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" asp-controller="Doctors" asp-action="Index">
                                <i class="bi bi-heart-pulse me-1"></i> Doctors
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" asp-controller="Departments" asp-action="Index">
                                <i class="bi bi-diagram-3 me-1"></i> Departments
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <main class="container py-4 flex-grow-1">
        @RenderBody()
    </main>

    <footer class="bg-white border-top py-3 mt-auto text-center text-muted small">
        <div class="container">
            &copy; 2024 - Hospital Management System (ASP.NET Core 8 MVC & SQLite)
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="~/js/site.js" asp-append-version="true"></script>
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>`
  },

  // 6. CONFIGURATION
  {
    id: 'appsettings-json',
    filename: 'appsettings.json',
    category: 'Config',
    language: 'json',
    description: 'SQLite Connection String and ASP.NET Core logging configuration.',
    code: `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=HospitalManagement.db"
  },
  "AllowedHosts": "*"
}`
  },
  {
    id: 'csproj',
    filename: 'HospitalManagementSystem.csproj',
    category: 'Config',
    language: 'xml',
    description: '.NET 8 Project file with EF Core SQLite and Code Generation packages.',
    code: `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.8" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.8">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="8.0.4" />
  </ItemGroup>

</Project>`
  }
];
