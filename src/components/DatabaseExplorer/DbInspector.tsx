import React, { useState } from 'react';
import { Department, Doctor, Patient, Appointment, SqlQueryLog } from '../../types';
import { 
  Database, 
  Table, 
  Terminal, 
  KeyRound, 
  Link2, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Trash2,
  RefreshCw
} from 'lucide-react';

interface DbInspectorProps {
  departments: Department[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  sqlLogs: SqlQueryLog[];
  onClearLogs: () => void;
}

export const DbInspector: React.FC<DbInspectorProps> = ({
  departments,
  doctors,
  patients,
  appointments,
  sqlLogs,
  onClearLogs
}) => {
  const [activeTable, setActiveTable] = useState<'Appointments' | 'Patients' | 'Doctors' | 'Departments'>('Appointments');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SQLite Database &amp; EF Core Inspector</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Live SQLite relational schema, active table rows, foreign key constraints, and EF Core generated SQL queries.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 rtl:ml-1.5 rtl:mr-0" />
            SQLite DB: HospitalManagement.db
          </span>
        </div>
      </div>

      {/* Relational Schema Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" /> Relational Schema &amp; Fluent API Mappings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Departments */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between font-bold text-slate-800 text-sm mb-2">
              <span className="text-blue-700">Departments</span>
              <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono">1-to-N</span>
            </div>
            <ul className="text-xs font-mono space-y-1 text-slate-600">
              <li className="flex items-center gap-1 font-semibold text-amber-700">
                <KeyRound className="w-3 h-3 text-amber-500" /> Id (INTEGER PK)
              </li>
              <li>Name (TEXT NOT NULL)</li>
            </ul>
            <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t">HasMany(d =&gt; d.Doctors)</p>
          </div>

          {/* Doctors */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between font-bold text-slate-800 text-sm mb-2">
              <span className="text-blue-700">Doctors</span>
              <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono">1-to-N</span>
            </div>
            <ul className="text-xs font-mono space-y-1 text-slate-600">
              <li className="flex items-center gap-1 font-semibold text-amber-700">
                <KeyRound className="w-3 h-3 text-amber-500" /> Id (INTEGER PK)
              </li>
              <li>Name (TEXT NOT NULL)</li>
              <li className="flex items-center gap-1 text-indigo-700 font-semibold">
                <Link2 className="w-3 h-3 text-indigo-500" /> DepartmentId (FK Restrict)
              </li>
            </ul>
            <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t">HasMany(d =&gt; d.Appointments)</p>
          </div>

          {/* Patients */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between font-bold text-slate-800 text-sm mb-2">
              <span className="text-blue-700">Patients</span>
              <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono">1-to-N</span>
            </div>
            <ul className="text-xs font-mono space-y-1 text-slate-600">
              <li className="flex items-center gap-1 font-semibold text-amber-700">
                <KeyRound className="w-3 h-3 text-amber-500" /> Id (INTEGER PK)
              </li>
              <li>Name (TEXT NOT NULL)</li>
              <li>RegistrationDate (TEXT NOT NULL)</li>
            </ul>
            <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t">HasMany(p =&gt; p.Appointments)</p>
          </div>

          {/* Appointments */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between font-bold text-slate-800 text-sm mb-2">
              <span className="text-blue-700">Appointments</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">Bridge/Core</span>
            </div>
            <ul className="text-xs font-mono space-y-1 text-slate-600">
              <li className="flex items-center gap-1 font-semibold text-amber-700">
                <KeyRound className="w-3 h-3 text-amber-500" /> Id (INTEGER PK)
              </li>
              <li>AppointmentDate (TEXT)</li>
              <li>Diagnosis (TEXT)</li>
              <li className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Link2 className="w-3 h-3 text-emerald-500" /> PatientId (FK Cascade)
              </li>
              <li className="flex items-center gap-1 text-indigo-700 font-semibold">
                <Link2 className="w-3 h-3 text-indigo-500" /> DoctorId (FK Restrict)
              </li>
            </ul>
            <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t">Links Patient &amp; Doctor</p>
          </div>

        </div>
      </div>

      {/* Table Data Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Table className="w-5 h-5 text-blue-600" /> Database Table Contents
          </h2>

          <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-slate-100 p-1 rounded-xl">
            {(['Appointments', 'Patients', 'Doctors', 'Departments'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTable(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTable === tab
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Active Table Data Grid */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          {activeTable === 'Appointments' && (
            <table className="w-full text-left rtl:text-right border-collapse text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Id</th>
                  <th className="p-3">AppointmentDate</th>
                  <th className="p-3">Diagnosis</th>
                  <th className="p-3">PatientId</th>
                  <th className="p-3">DoctorId</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-amber-700">{a.id}</td>
                    <td className="p-3">{a.appointmentDate}</td>
                    <td className="p-3 max-w-xs truncate">{a.diagnosis}</td>
                    <td className="p-3 text-emerald-700 font-semibold">{a.patientId}</td>
                    <td className="p-3 text-indigo-700 font-semibold">{a.doctorId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'Patients' && (
            <table className="w-full text-left rtl:text-right border-collapse text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Id</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">RegistrationDate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-amber-700">{p.id}</td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{p.registrationDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'Doctors' && (
            <table className="w-full text-left rtl:text-right border-collapse text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Id</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">DepartmentId</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {doctors.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-amber-700">{d.id}</td>
                    <td className="p-3 font-medium">{d.name}</td>
                    <td className="p-3 text-indigo-700 font-semibold">{d.departmentId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'Departments' && (
            <table className="w-full text-left rtl:text-right border-collapse text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Id</th>
                  <th className="p-3">Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {departments.map(dep => (
                  <tr key={dep.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-amber-700">{dep.id}</td>
                    <td className="p-3 font-medium">{dep.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* EF Core Query Logger */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-6 space-y-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold tracking-tight">EF Core SQL Query Execution Logger</h2>
          </div>
          <button
            onClick={onClearLogs}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Logs
          </button>
        </div>

        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {sqlLogs.map(log => (
            <div key={log.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-400">{log.action}</span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {log.executionTimeMs}ms
                  </span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {log.sql}
              </pre>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
