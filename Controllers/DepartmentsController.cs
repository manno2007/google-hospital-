using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;

namespace HospitalManagementSystem.Controllers;

public class DepartmentsController : Controller
{
    private readonly AppDbContext _context;

    public DepartmentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: Departments (LINQ: .OrderBy, .AsNoTracking)
    public async Task<IActionResult> Index()
    {
        var departments = await _context.Departments
            .Include(d => d.Doctors)
            .OrderBy(d => d.Name)
            .AsNoTracking()
            .ToListAsync();
        return View(departments);
    }

    // GET: Departments/Details/5
    public async Task<IActionResult> Details(int? id)
    {
        if (id == null) return NotFound();

        var department = await _context.Departments
            .Include(d => d.Doctors)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (department == null) return NotFound();

        return View(department);
    }

    // GET: Departments/Create
    public IActionResult Create()
    {
        return View();
    }

    // POST: Departments/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name")] Department department)
    {
        if (ModelState.IsValid)
        {
            _context.Add(department);
            await _context.SaveChangesAsync();
            TempData["Success"] = $"Department '{department.Name}' created successfully!";
            return RedirectToAction(nameof(Index));
        }
        return View(department);
    }

    // GET: Departments/Edit/5
    public async Task<IActionResult> Edit(int? id)
    {
        if (id == null) return NotFound();

        var department = await _context.Departments.FindAsync(id);
        if (department == null) return NotFound();

        return View(department);
    }

    // POST: Departments/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, [Bind("Id,Name")] Department department)
    {
        if (id != department.Id) return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(department);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Department updated successfully!";
                return RedirectToAction(nameof(Index));
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Departments.Any(e => e.Id == department.Id)) return NotFound();
                throw;
            }
        }
        return View(department);
    }

    // GET: Departments/Delete/5
    public async Task<IActionResult> Delete(int? id)
    {
        if (id == null) return NotFound();

        var department = await _context.Departments
            .Include(d => d.Doctors)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (department == null) return NotFound();

        return View(department);
    }

    // POST: Departments/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var department = await _context.Departments
            .Include(d => d.Doctors)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (department != null)
        {
            if (department.Doctors.Any())
            {
                TempData["Error"] = "Cannot delete department: Doctors are currently assigned to it.";
                return RedirectToAction(nameof(Index));
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Department deleted successfully!";
        }
        return RedirectToAction(nameof(Index));
    }
}
