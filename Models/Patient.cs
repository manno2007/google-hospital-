using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models;

public class Patient
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Patient name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Patient name must be between 2 and 100 characters")]
    [Display(Name = "Patient Full Name")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Registration date is required")]
    [DataType(DataType.Date)]
    [Display(Name = "Registration Date")]
    public DateTime RegistrationDate { get; set; } = DateTime.Today;

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
