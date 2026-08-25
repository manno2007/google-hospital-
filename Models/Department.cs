using System.ComponentModel.DataAnnotations;

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
}
