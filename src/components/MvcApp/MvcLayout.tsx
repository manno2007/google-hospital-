import React from 'react';
import { 
  Calendar, 
  Users, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Activity,
  Database,
  ArrowRight
} from 'lucide-react';

interface MvcLayoutProps {
  currentController: 'Appointments' | 'Patients' | 'Doctors' | 'Departments';
  setCurrentController: (controller: 'Appointments' | 'Patients' | 'Doctors' | 'Departments') => void;
  tempDataSuccess: string | null;
  setTempDataSuccess: (msg: string | null) => void;
  tempDataError: string | null;
  setTempDataError: (msg: string | null) => void;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
  children: React.ReactNode;
}

export const MvcLayout: React.FC<MvcLayoutProps> = ({
  currentController,
  setCurrentController,
  tempDataSuccess,
  setTempDataSuccess,
  tempDataError,
  setTempDataError,
  totalAppointments,
  totalPatients,
  totalDoctors,
  totalDepartments,
  children
}) => {
  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 pb-16">
      
      {/* Top Simulated Razor Navbar (_Layout.cshtml) */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2.5 gap-2">
            
            {/* Controller Links */}
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto rtl:space-x-reverse pb-1 md:pb-0">
              <button
                id="nav-appointments-btn"
                onClick={() => setCurrentController('Appointments')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center transition whitespace-nowrap ${
                  currentController === 'Appointments'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-blue-600" />
                Appointments
                <span className="ml-2 rtl:mr-2 rtl:ml-0 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {totalAppointments}
                </span>
              </button>

              <button
                id="nav-patients-btn"
                onClick={() => setCurrentController('Patients')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center transition whitespace-nowrap ${
                  currentController === 'Patients'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-emerald-600" />
                Patients
                <span className="ml-2 rtl:mr-2 rtl:ml-0 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full">
                  {totalPatients}
                </span>
              </button>

              <button
                id="nav-doctors-btn"
                onClick={() => setCurrentController('Doctors')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center transition whitespace-nowrap ${
                  currentController === 'Doctors'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-indigo-600" />
                Doctors
                <span className="ml-2 rtl:mr-2 rtl:ml-0 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                  {totalDoctors}
                </span>
              </button>

              <button
                id="nav-departments-btn"
                onClick={() => setCurrentController('Departments')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center transition whitespace-nowrap ${
                  currentController === 'Departments'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-amber-600" />
                Departments
                <span className="ml-2 rtl:mr-2 rtl:ml-0 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">
                  {totalDepartments}
                </span>
              </button>
            </div>

            {/* Architecture Banner Badge */}
            <div className="hidden lg:flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Route: <strong className="text-slate-700">/{currentController}/Index</strong></span>
              <span className="text-slate-300">|</span>
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Context: <strong className="text-slate-700">AppDbContext (Direct DI)</strong></span>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* TempData["Success"] Toast Banner */}
        {tempDataSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                  TempData["Success"] (PRG Pattern Redirect)
                </span>
                <p className="text-sm font-medium text-emerald-800">{tempDataSuccess}</p>
              </div>
            </div>
            <button
              onClick={() => setTempDataSuccess(null)}
              className="p-1 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* TempData["Error"] Toast Banner */}
        {tempDataError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block">
                  TempData["Error"] (Validation / FK Restrict)
                </span>
                <p className="text-sm font-medium text-rose-800">{tempDataError}</p>
              </div>
            </div>
            <button
              onClick={() => setTempDataError(null)}
              className="p-1 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body Content */}
        {children}

      </main>

    </div>
  );
};
