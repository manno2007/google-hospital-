using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers;

public class PatientsController : Controller
{
    private readonly AppDbContext _context;

    public PatientsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: Patients (LINQ: .OrderBy, .AsNoTracking)
    public async Task<IActionResult> Index()
    {
        var patients = await _context.Patients
            .Include(p => p.Appointments)
            .OrderBy(p => p.Name)
            .AsNoTracking()
            .ToListAsync();
        return View(patients);
    }

    // GET: Patients/Details/5
    public async Task<IActionResult> Details(int? id)
    {
        if (id == null) return NotFound();

        var patient = await _context.Patients
            .Include(p => p.Appointments)
                .ThenInclude(a => a.Doctor)
                    .ThenInclude(d => d.Department)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (patient == null) return NotFound();

        return View(patient);
    }

    // GET: Patients/Create
    public IActionResult Create()
    {
        return View(new Patient { RegistrationDate = DateTime.Today });
    }

    // POST: Patients/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name,RegistrationDate")] Patient patient)
    {
        if (ModelState.IsValid)
        {
            _context.Add(patient);
            await _context.SaveChangesAsync();
            TempData["Success"] = $"Patient '{patient.Name}' registered successfully!";
            return RedirectToAction(nameof(Index));
        }
        return View(patient);
    }

    // GET: Patients/Edit/5
    public async Task<IActionResult> Edit(int? id)
    {
        if (id == null) return NotFound();

        var patient = await _context.Patients.FindAsync(id);
        if (patient == null) return NotFound();

        return View(patient);
    }

    // POST: Patients/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, [Bind("Id,Name,RegistrationDate")] Patient patient)
    {
        if (id != patient.Id) return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(patient);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Patient details updated successfully!";
                return RedirectToAction(nameof(Index));
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Patients.Any(e => e.Id == patient.Id)) return NotFound();
                throw;
            }
        }
        return View(patient);
    }

    // GET: Patients/Delete/5
    public async Task<IActionResult> Delete(int? id)
    {
        if (id == null) return NotFound();

        var patient = await _context.Patients
            .Include(p => p.Appointments)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (patient == null) return NotFound();

        return View(patient);
    }

    // POST: Patients/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient != null)
        {
            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Patient record removed successfully!";
        }
        return RedirectToAction(nameof(Index));
    }
}
