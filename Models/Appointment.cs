using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models;

public class Appointment
{
    public int Id { get; set; }

    [Required]
    [Display(Name = "Date & Time")]
    public DateTime AppointmentDate { get; set; } = DateTime.Now;

    [Required]
    [Display(Name = "Diagnosis / Reason")]
    public string Diagnosis { get; set; } = string.Empty;

    [Required]
    [Display(Name = "Patient")]
    public int PatientId { get; set; }
    public Patient? Patient { get; set; }

    [Required]
    [Display(Name = "Doctor")]
    public int DoctorId { get; set; }
    public Doctor? Doctor { get; set; }
}
