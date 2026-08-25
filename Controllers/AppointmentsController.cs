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

    // GET: Appointments (LINQ: Include + Where + OrderBy)
    public async Task<IActionResult> Index(string? search)
    {
        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.Department)
            .AsNoTracking();

        // LINQ Filtering
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(a => 
                a.Patient!.Name.Contains(search) || 
                a.Doctor!.Name.Contains(search) ||
                a.Diagnosis.Contains(search));
        }

        // LINQ Sorting
        var list = await query.OrderByDescending(a => a.AppointmentDate).ToListAsync();
        ViewBag.Search = search;
        return View(list);
    }

    // GET: Appointments/Create
    public IActionResult Create()
    {
        ViewBag.PatientId = new SelectList(_context.Patients, "Id", "Name");
        ViewBag.DoctorId = new SelectList(_context.Doctors, "Id", "Name");
        return View();
    }

    // POST: Appointments/Create (Post-Redirect-Get Pattern)
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Appointment appointment)
    {
        if (ModelState.IsValid)
        {
            _context.Add(appointment);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Appointment scheduled successfully!";
            return RedirectToAction(nameof(Index));
        }

        ViewBag.PatientId = new SelectList(_context.Patients, "Id", "Name", appointment.PatientId);
        ViewBag.DoctorId = new SelectList(_context.Doctors, "Id", "Name", appointment.DoctorId);
        return View(appointment);
    }

    // GET: Appointments/Edit/5 (LINQ: FindAsync)
    public async Task<IActionResult> Edit(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null) return NotFound();

        ViewBag.PatientId = new SelectList(_context.Patients, "Id", "Name", appointment.PatientId);
        ViewBag.DoctorId = new SelectList(_context.Doctors, "Id", "Name", appointment.DoctorId);
        return View(appointment);
    }

    // POST: Appointments/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Appointment appointment)
    {
        if (ModelState.IsValid)
        {
            _context.Update(appointment);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Appointment updated!";
            return RedirectToAction(nameof(Index));
        }

        ViewBag.PatientId = new SelectList(_context.Patients, "Id", "Name", appointment.PatientId);
        ViewBag.DoctorId = new SelectList(_context.Doctors, "Id", "Name", appointment.DoctorId);
        return View(appointment);
    }

    // POST: Appointments/Delete/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment != null)
        {
            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Appointment cancelled!";
        }
        return RedirectToAction(nameof(Index));
    }
}
