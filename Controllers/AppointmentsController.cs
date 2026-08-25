using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers;

public class AppointmentsController : Controller
{
    private readonly AppDbContext _context;

    // Direct DbContext Dependency Injection
    public AppointmentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: Appointments
    // LINQ: .Include() for Eager Loading, .Where() for Search, .OrderByDescending() for Sorting
    public async Task<IActionResult> Index(string? search)
    {
        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.Department)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a => 
                a.Patient!.Name.ToLower().Contains(search.ToLower()) || 
                a.Doctor!.Name.ToLower().Contains(search.ToLower()) ||
                a.Diagnosis.ToLower().Contains(search.ToLower()));
        }

        var appointments = await query.OrderByDescending(a => a.AppointmentDate).ToListAsync();
        ViewBag.Search = search;
        return View(appointments);
    }

    // GET: Appointments/Details/5
    public async Task<IActionResult> Details(int? id)
    {
        if (id == null) return NotFound();

        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.Department)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (appointment == null) return NotFound();

        return View(appointment);
    }

    // GET: Appointments/Create
    public IActionResult Create()
    {
        PopulateDropdowns();
        return View(new Appointment { AppointmentDate = DateTime.Now.AddHours(2) });
    }

    // POST: Appointments/Create
    // Protocol: [ValidateAntiForgeryToken] for CSRF + [Bind] for Over-Posting prevention + PRG Pattern
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("AppointmentDate,Diagnosis,PatientId,DoctorId")] Appointment appointment)
    {
        if (ModelState.IsValid)
        {
            _context.Add(appointment);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Appointment scheduled successfully!";
            return RedirectToAction(nameof(Index)); // Post-Redirect-Get (PRG)
        }

        PopulateDropdowns(appointment.PatientId, appointment.DoctorId);
        return View(appointment);
    }

    // GET: Appointments/Edit/5
    public async Task<IActionResult> Edit(int? id)
    {
        if (id == null) return NotFound();

        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null) return NotFound();

        PopulateDropdowns(appointment.PatientId, appointment.DoctorId);
        return View(appointment);
    }

    // POST: Appointments/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, [Bind("Id,AppointmentDate,Diagnosis,PatientId,DoctorId")] Appointment appointment)
    {
        if (id != appointment.Id) return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(appointment);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Appointment updated successfully!";
                return RedirectToAction(nameof(Index));
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Appointments.Any(e => e.Id == appointment.Id)) return NotFound();
                throw;
            }
        }

        PopulateDropdowns(appointment.PatientId, appointment.DoctorId);
        return View(appointment);
    }

    // GET: Appointments/Delete/5
    public async Task<IActionResult> Delete(int? id)
    {
        if (id == null) return NotFound();

        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.Department)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (appointment == null) return NotFound();

        return View(appointment);
    }

    // POST: Appointments/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment != null)
        {
            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Appointment cancelled and removed!";
        }
        return RedirectToAction(nameof(Index));
    }

    private void PopulateDropdowns(int? selectedPatientId = null, int? selectedDoctorId = null)
    {
        ViewBag.PatientId = new SelectList(_context.Patients.OrderBy(p => p.Name), "Id", "Name", selectedPatientId);
        ViewBag.DoctorId = new SelectList(_context.Doctors.OrderBy(d => d.Name), "Id", "Name", selectedDoctorId);
    }
}
