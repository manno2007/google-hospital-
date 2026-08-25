using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models;

public class Doctor
{
    public int Id { get; set; }

    [Required]
    [Display(Name = "Doctor Name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Display(Name = "Department")]
    public int DepartmentId { get; set; }

    // Navigation property
    public Department? Department { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
