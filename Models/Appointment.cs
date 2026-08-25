using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagementSystem.Models;

public class Appointment
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Appointment date and time is required")]
    [Display(Name = "Appointment Date")]
    [DataType(DataType.DateTime)]
    public DateTime AppointmentDate { get; set; } = DateTime.Now;

    [Required(ErrorMessage = "Diagnosis or reason for visit is required")]
    [StringLength(500, MinimumLength = 3, ErrorMessage = "Diagnosis must be between 3 and 500 characters")]
    [Display(Name = "Diagnosis / Chief Complaint")]
    public string Diagnosis { get; set; } = string.Empty;

    // Foreign Key: Patient
    [Required(ErrorMessage = "Please select a patient")]
    [Display(Name = "Patient")]
    [ForeignKey(nameof(Patient))]
    public int PatientId { get; set; }

    public virtual Patient? Patient { get; set; }

    // Foreign Key: Doctor
    [Required(ErrorMessage = "Please select a doctor")]
    [Display(Name = "Doctor")]
    [ForeignKey(nameof(Doctor))]
    public int DoctorId { get; set; }

    public virtual Doctor? Doctor { get; set; }
}
