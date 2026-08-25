using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagementSystem.Models;

public class Doctor
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Doctor name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Doctor name must be between 2 and 100 characters")]
    [Display(Name = "Doctor Name")]
    public string Name { get; set; } = string.Empty;

    // Foreign Key: Department
    [Required(ErrorMessage = "Please select a department")]
    [Display(Name = "Department")]
    [ForeignKey(nameof(Department))]
    public int DepartmentId { get; set; }

    public virtual Department? Department { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
