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

    // GET: Doctors (LINQ: .Include, .OrderBy)
    public async Task<IActionResult> Index()
    {
        var doctors = await _context.Doctors
            .Include(d => d.Department)
            .OrderBy(d => d.Name)
            .AsNoTracking()
            .ToListAsync();
        return View(doctors);
    }

    // GET: Doctors/Details/5
    public async Task<IActionResult> Details(int? id)
    {
        if (id == null) return NotFound();

        var doctor = await _context.Doctors
            .Include(d => d.Department)
            .Include(d => d.Appointments)
                .ThenInclude(a => a.Patient)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (doctor == null) return NotFound();

        return View(doctor);
    }

    // GET: Doctors/Create
    public IActionResult Create()
    {
        ViewBag.DepartmentId = new SelectList(_context.Departments.OrderBy(d => d.Name), "Id", "Name");
        return View();
    }

    // POST: Doctors/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name,DepartmentId")] Doctor doctor)
    {
        if (ModelState.IsValid)
        {
            _context.Add(doctor);
            await _context.SaveChangesAsync();
            TempData["Success"] = $"Doctor '{doctor.Name}' registered successfully!";
            return RedirectToAction(nameof(Index));
        }

        ViewBag.DepartmentId = new SelectList(_context.Departments.OrderBy(d => d.Name), "Id", "Name", doctor.DepartmentId);
        return View(doctor);
    }

    // GET: Doctors/Edit/5
    public async Task<IActionResult> Edit(int? id)
    {
        if (id == null) return NotFound();

        var doctor = await _context.Doctors.FindAsync(id);
        if (doctor == null) return NotFound();

        ViewBag.DepartmentId = new SelectList(_context.Departments.OrderBy(d => d.Name), "Id", "Name", doctor.DepartmentId);
        return View(doctor);
    }

    // POST: Doctors/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, [Bind("Id,Name,DepartmentId")] Doctor doctor)
    {
        if (id != doctor.Id) return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(doctor);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Doctor record updated successfully!";
                return RedirectToAction(nameof(Index));
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Doctors.Any(e => e.Id == doctor.Id)) return NotFound();
                throw;
            }
        }

        ViewBag.DepartmentId = new SelectList(_context.Departments.OrderBy(d => d.Name), "Id", "Name", doctor.DepartmentId);
        return View(doctor);
    }

    // GET: Doctors/Delete/5
    public async Task<IActionResult> Delete(int? id)
    {
        if (id == null) return NotFound();

        var doctor = await _context.Doctors
            .Include(d => d.Department)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (doctor == null) return NotFound();

        return View(doctor);
    }

    // POST: Doctors/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var doctor = await _context.Doctors.FindAsync(id);
        if (doctor != null)
        {
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Doctor removed successfully!";
        }
        return RedirectToAction(nameof(Index));
    }
}
