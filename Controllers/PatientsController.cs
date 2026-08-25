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

    // GET: Patients (LINQ: OrderBy)
    public async Task<IActionResult> Index()
    {
        var patients = await _context.Patients
            .OrderBy(p => p.Name)
            .ToListAsync();
        return View(patients);
    }

    // GET: Patients/Create
    public IActionResult Create()
    {
        return View(new Patient { RegistrationDate = DateTime.Today });
    }

    // POST: Patients/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Patient patient)
    {
        if (ModelState.IsValid)
        {
            _context.Add(patient);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Patient registered!";
            return RedirectToAction(nameof(Index));
        }
        return View(patient);
    }

    // POST: Patients/Delete/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient != null)
        {
            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Patient removed!";
        }
        return RedirectToAction(nameof(Index));
    }
}
