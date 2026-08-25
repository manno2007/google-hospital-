using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models;

public class Department
{
    public int Id { get; set; }

    [Required]
    [Display(Name = "Department Name")]
    public string Name { get; set; } = string.Empty;

    public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}
