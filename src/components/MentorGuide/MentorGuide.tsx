import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Layers, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle,
  FileCode2,
  GitBranch,
  KeyRound
} from 'lucide-react';

export const MentorGuide: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-slate-800">
      
      {/* Mentor Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-8 rounded-3xl shadow-lg border border-slate-800">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Senior ASP.NET Core Developer &amp; Mentor Guide</h1>
            <p className="text-slate-300 text-sm mt-1">
              Architecture Analysis, Security Standards, EF Core 8 with SQLite, and Best Practices.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Critical Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Pillar 1: Direct DbContext Injection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">1. Direct DbContext Injection</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            As mandated, controllers inject <code>AppDbContext</code> directly without an abstract Repository/Service layer.
            EF Core’s <code>DbContext</code> already implements the <strong>Unit of Work</strong> and <strong>Repository</strong> patterns internally (<code>DbSet&lt;T&gt;</code> is the repository).
          </p>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-blue-800">
            public AppointmentsController(AppDbContext context) &#123; _context = context; &#125;
          </div>
        </div>

        {/* Pillar 2: Security & Over-Posting */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">2. Security Best Practices</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All POST endpoints are decorated with <code>[ValidateAntiForgeryToken]</code> to prevent Cross-Site Request Forgery (CSRF).
            Model parameter binding uses <code>[Bind("Prop1,Prop2")]</code> to prevent <strong>Over-Posting / Mass Assignment</strong> vulnerabilities.
          </p>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-emerald-800">
            [HttpPost, ValidateAntiForgeryToken]<br/>
            public async Task&lt;IActionResult&gt; Create([Bind("Date,Diagnosis,...")] Appointment appt)
          </div>
        </div>

        {/* Pillar 3: PRG Pattern with TempData */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <GitBranch className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">3. Post / Redirect / Get (PRG)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            After successful state-mutating POST requests (Create, Edit, Delete), the controller redirects via <code>RedirectToAction(nameof(Index))</code>.
            Flash messages are stored in <code>TempData["Success"]</code>, surviving the HTTP redirect and clearing automatically after rendering.
          </p>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-amber-800">
            TempData["Success"] = "Saved!";<br/>
            return RedirectToAction(nameof(Index));
          </div>
        </div>

        {/* Pillar 4: Eager Loading with .Include() */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">4. Eager Loading (.Include)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Prevents N+1 database queries by explicitly loading related entities using <code>.Include(a =&gt; a.Patient).Include(a =&gt; a.Doctor).ThenInclude(d =&gt; d.Department)</code>.
            Read queries use <code>.AsNoTracking()</code> to reduce memory footprint.
          </p>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-indigo-800">
            _context.Appointments.Include(a =&gt; a.Patient)...AsNoTracking().ToListAsync();
          </div>
        </div>

        {/* Pillar 5: Fluent API & Delete Behaviors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">5. Explicit Fluent API</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Configured in <code>AppDbContext.OnModelCreating</code>:
            <br/>• <strong>Department &lt;- Doctor</strong>: <code>DeleteBehavior.Restrict</code> (Prevent deleting dept with doctors).
            <br/>• <strong>Patient &lt;- Appointment</strong>: <code>DeleteBehavior.Cascade</code>.
            <br/>• <strong>Doctor &lt;- Appointment</strong>: <code>DeleteBehavior.Restrict</code>.
          </p>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-purple-800">
            modelBuilder.Entity&lt;Doctor&gt;().HasOne(d =&gt; d.Department)...
          </div>
        </div>

        {/* Pillar 6: ViewBag SelectList Dropdowns */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <FileCode2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">6. Razor Dropdown Binding</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In <code>Create</code> and <code>Edit</code> actions, <code>ViewBag.PatientId</code> and <code>ViewBag.DoctorId</code> provide <code>SelectList</code> instances.
            Razor tags like <code>&lt;select asp-for="PatientId" asp-items="ViewBag.PatientId"&gt;</code> render dropdowns with automatic selected-item binding.
          </p>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-rose-800">
            ViewBag.PatientId = new SelectList(patients, "Id", "Name");
          </div>
        </div>

      </div>

      {/* Step-by-Step CLI Setup Guide */}
      <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-400">
          <Terminal className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">How to Run this Project Locally with .NET 8 CLI</h2>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block mb-1"># 1. Create a new ASP.NET Core MVC 8 project</span>
            <div className="p-3 bg-slate-950 rounded-lg text-emerald-300">
              dotnet new mvc -n HospitalManagementSystem -f net8.0<br/>
              cd HospitalManagementSystem
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1"># 2. Install Entity Framework Core SQLite and Tools packages</span>
            <div className="p-3 bg-slate-950 rounded-lg text-emerald-300">
              dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 8.0.8<br/>
              dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.8<br/>
              dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design --version 8.0.4
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1"># 3. Create and apply Entity Framework Core Migrations</span>
            <div className="p-3 bg-slate-950 rounded-lg text-emerald-300">
              dotnet ef migrations add InitialHospitalSchema<br/>
              dotnet ef database update
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1"># 4. Run the application</span>
            <div className="p-3 bg-slate-950 rounded-lg text-emerald-300">
              dotnet run
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
