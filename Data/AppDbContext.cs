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

        // Simple Seed Data
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
}
