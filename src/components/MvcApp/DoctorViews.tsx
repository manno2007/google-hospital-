import React, { useState } from 'react';
import { Doctor, Department, Appointment, Patient } from '../../types';
import { Stethoscope, Plus, Edit3, Trash2, Eye, ArrowLeft, Save, Building2, Calendar } from 'lucide-react';

interface DoctorViewsProps {
  doctors: Doctor[];
  departments: Department[];
  appointments: Appointment[];
  patients: Patient[];
  onCreateDoctor: (doc: { name: string; departmentId: number }) => void;
  onUpdateDoctor: (doc: { id: number; name: string; departmentId: number }) => void;
  onDeleteDoctor: (id: number) => { success: boolean; error?: string };
  onTriggerSqlLog: (action: string, sql: string) => void;
  setTempDataSuccess: (msg: string | null) => void;
  setTempDataError: (msg: string | null) => void;
}

export const DoctorViews: React.FC<DoctorViewsProps> = ({
  doctors,
  departments,
  appointments,
  patients,
  onCreateDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
  onTriggerSqlLog,
  setTempDataSuccess,
  setTempDataError
}) => {
  const [viewMode, setViewMode] = useState<'index' | 'create' | 'edit' | 'details' | 'delete'>('index');
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [deptIdInput, setDeptIdInput] = useState<number>(departments[0]?.id || 1);
  const [error, setError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setNameInput('');
    setDeptIdInput(departments[0]?.id || 1);
    setError(null);
    setViewMode('create');
  };

  const handleOpenEdit = (doc: Doctor) => {
    setSelectedDoc(doc);
    setNameInput(doc.name);
    setDeptIdInput(doc.departmentId);
    setError(null);
    setViewMode('edit');
  };

  const handleOpenDetails = (doc: Doctor) => {
    setSelectedDoc(doc);
    onTriggerSqlLog(
      `GET: Doctors/Details/${doc.id} (.Include(d => d.Department).Include(d => d.Appointments).ThenInclude(a => a.Patient))`,
      `SELECT d."Id", d."Name", d."DepartmentId", dep."Name" AS DepartmentName,
       a."Id" AS ApptId, a."AppointmentDate", a."Diagnosis", p."Name" AS PatientName
FROM "Doctors" AS d
LEFT JOIN "Departments" AS dep ON d."DepartmentId" = dep."Id"
LEFT JOIN "Appointments" AS a ON d."Id" = a."DoctorId"
LEFT JOIN "Patients" AS p ON a."PatientId" = p."Id"
WHERE d."Id" = ${doc.id};`
    );
    setViewMode('details');
  };

  const handleOpenDelete = (doc: Doctor) => {
    setSelectedDoc(doc);
    setViewMode('delete');
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || nameInput.trim().length < 3) {
      setError('Doctor name must be at least 3 characters.');
      return;
    }
    onCreateDoctor({ name: nameInput.trim(), departmentId: Number(deptIdInput) });
    onTriggerSqlLog(
      'POST: Doctors/Create',
      `INSERT INTO "Doctors" ("Name", "DepartmentId") VALUES ('${nameInput.trim().replace(/'/g, "''")}', ${deptIdInput});`
    );
    setTempDataSuccess(`Doctor '${nameInput.trim()}' registered successfully!`);
    setViewMode('index');
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (!nameInput.trim() || nameInput.trim().length < 3) {
      setError('Doctor name must be at least 3 characters.');
      return;
    }
    onUpdateDoctor({ id: selectedDoc.id, name: nameInput.trim(), departmentId: Number(deptIdInput) });
    onTriggerSqlLog(
      `POST: Doctors/Edit/${selectedDoc.id}`,
      `UPDATE "Doctors" SET "Name" = '${nameInput.trim().replace(/'/g, "''")}', "DepartmentId" = ${deptIdInput} WHERE "Id" = ${selectedDoc.id};`
    );
    setTempDataSuccess('Doctor updated successfully!');
    setViewMode('index');
  };

  const handleConfirmDelete = () => {
    if (!selectedDoc) return;
    const res = onDeleteDoctor(selectedDoc.id);
    if (!res.success) {
      setTempDataError(res.error || 'Cannot delete doctor with active appointments.');
    } else {
      onTriggerSqlLog(
        `POST: Doctors/Delete/${selectedDoc.id}`,
        `DELETE FROM "Doctors" WHERE "Id" = ${selectedDoc.id};`
      );
      setTempDataSuccess('Doctor removed successfully!');
    }
    setViewMode('index');
  };

  return (
    <div className="space-y-6">
      {/* 1. INDEX */}
      {viewMode === 'index' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Stethoscope className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Doctors &amp; Medical Staff</h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Eager-loaded with <code className="text-xs font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-600">.Include(d =&gt; d.Department)</code>
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              Register Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map(doc => {
              const dept = departments.find(dep => dep.id === doc.departmentId);
              const docAppts = appointments.filter(a => a.doctorId === doc.id);

              return (
                <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <button onClick={() => handleOpenDetails(doc)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenEdit(doc)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenDelete(doc)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mt-4">{doc.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-blue-600 font-medium">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{dept?.name || 'General'}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {docAppts.length} Scheduled Appointments
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. CREATE */}
      {viewMode === 'create' && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" /> Register New Doctor (Create.cshtml)
            </h2>
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Doctor Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Dr. Jennifer Adams"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Department (ViewBag.DepartmentId SelectList)
                </label>
                <select
                  value={deptIdInput}
                  onChange={(e) => setDeptIdInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <div className="flex items-center justify-between pt-3 border-t">
                <button type="button" onClick={() => setViewMode('index')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm">
                  Register Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT */}
      {viewMode === 'edit' && selectedDoc && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-600" /> Edit Doctor #{selectedDoc.id}
            </h2>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Doctor Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                <select
                  value={deptIdInput}
                  onChange={(e) => setDeptIdInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <div className="flex items-center justify-between pt-3 border-t">
                <button type="button" onClick={() => setViewMode('index')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium shadow-sm">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DETAILS */}
      {viewMode === 'details' && selectedDoc && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">{selectedDoc.name}</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-xs">
                {departments.find(d => d.id === selectedDoc.departmentId)?.name}
              </span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upcoming Appointments</p>
              <div className="space-y-2 text-sm">
                {appointments.filter(a => a.doctorId === selectedDoc.id).map(a => {
                  const pt = patients.find(p => p.id === a.patientId);
                  return (
                    <div key={a.id} className="p-3 bg-white border border-slate-200 rounded flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-800">{pt?.name}</div>
                        <div className="text-xs text-slate-500">{a.diagnosis}</div>
                      </div>
                      <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {a.appointmentDate.replace('T', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => setViewMode('index')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> Back to Doctors
            </button>
          </div>
        </div>
      )}

      {/* 5. DELETE */}
      {viewMode === 'delete' && selectedDoc && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-rose-200 shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-rose-600">Delete Doctor Record?</h2>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong>{selectedDoc.name}</strong>?
            </p>
            <div className="flex items-center justify-between pt-3 border-t">
              <button type="button" onClick={() => setViewMode('index')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmDelete} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-sm">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
