using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers;

public class DoctorsController : Controller
{
    private readonly AppDbContext _context;

    public DoctorsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: Doctors (LINQ: Include)
    public async Task<IActionResult> Index()
    {
        var doctors = await _context.Doctors
            .Include(d => d.Department)
            .OrderBy(d => d.Name)
            .ToListAsync();
        return View(doctors);
    }

    // GET: Doctors/Create
    public IActionResult Create()
    {
        ViewBag.DepartmentId = new SelectList(_context.Departments, "Id", "Name");
        return View();
    }

    // POST: Doctors/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Doctor doctor)
    {
        if (ModelState.IsValid)
        {
            _context.Add(doctor);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Doctor registered!";
            return RedirectToAction(nameof(Index));
        }

        ViewBag.DepartmentId = new SelectList(_context.Departments, "Id", "Name", doctor.DepartmentId);
        return View(doctor);
    }

    // POST: Doctors/Delete/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var doctor = await _context.Doctors.FindAsync(id);
        if (doctor != null)
        {
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Doctor removed!";
        }
        return RedirectToAction(nameof(Index));
    }
}
