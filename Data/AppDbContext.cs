using Microsoft.EntityFrameworkCore;
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

        // Department -> Doctors (1-to-many, Restrict Delete)
        modelBuilder.Entity<Doctor>()
            .HasOne(d => d.Department)
            .WithMany(dept => dept.Doctors)
            .HasForeignKey(d => d.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Patient -> Appointments (1-to-many, Cascade Delete)
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Patient)
            .WithMany(p => p.Appointments)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        // Doctor -> Appointments (1-to-many, Restrict Delete)
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Doctor)
            .WithMany(d => d.Appointments)
            .HasForeignKey(a => a.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed Initial Master & Demo Data
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
}
