using System.ComponentModel.DataAnnotations;

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
}
