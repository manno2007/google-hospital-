import React, { useState } from 'react';
import { Patient, Appointment, Doctor } from '../../types';
import { Users, Plus, Edit3, Trash2, Eye, ArrowLeft, Save, Calendar, Clock } from 'lucide-react';

interface PatientViewsProps {
  patients: Patient[];
  appointments: Appointment[];
  doctors: Doctor[];
  onCreatePatient: (pt: { name: string; registrationDate: string }) => void;
  onUpdatePatient: (pt: { id: number; name: string; registrationDate: string }) => void;
  onDeletePatient: (id: number) => void;
  onTriggerSqlLog: (action: string, sql: string) => void;
  setTempDataSuccess: (msg: string | null) => void;
}

export const PatientViews: React.FC<PatientViewsProps> = ({
  patients,
  appointments,
  doctors,
  onCreatePatient,
  onUpdatePatient,
  onDeletePatient,
  onTriggerSqlLog,
  setTempDataSuccess
}) => {
  const [viewMode, setViewMode] = useState<'index' | 'create' | 'edit' | 'details' | 'delete'>('index');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setNameInput('');
    setDateInput(new Date().toISOString().slice(0, 10));
    setError(null);
    setViewMode('create');
  };

  const handleOpenEdit = (pt: Patient) => {
    setSelectedPatient(pt);
    setNameInput(pt.name);
    setDateInput(pt.registrationDate);
    setError(null);
    setViewMode('edit');
  };

  const handleOpenDetails = (pt: Patient) => {
    setSelectedPatient(pt);
    onTriggerSqlLog(
      `GET: Patients/Details/${pt.id} (.Include(p => p.Appointments).ThenInclude(a => a.Doctor))`,
      `SELECT p."Id", p."Name", p."RegistrationDate",
       a."Id" AS ApptId, a."AppointmentDate", a."Diagnosis", doc."Name" AS DoctorName
FROM "Patients" AS p
LEFT JOIN "Appointments" AS a ON p."Id" = a."PatientId"
LEFT JOIN "Doctors" AS doc ON a."DoctorId" = doc."Id"
WHERE p."Id" = ${pt.id};`
    );
    setViewMode('details');
  };

  const handleOpenDelete = (pt: Patient) => {
    setSelectedPatient(pt);
    setViewMode('delete');
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || nameInput.trim().length < 3) {
      setError('Patient name must be at least 3 characters.');
      return;
    }
    onCreatePatient({ name: nameInput.trim(), registrationDate: dateInput || new Date().toISOString().slice(0, 10) });
    onTriggerSqlLog(
      'POST: Patients/Create',
      `INSERT INTO "Patients" ("Name", "RegistrationDate") VALUES ('${nameInput.trim().replace(/'/g, "''")}', '${dateInput}');`
    );
    setTempDataSuccess(`Patient '${nameInput.trim()}' registered successfully!`);
    setViewMode('index');
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!nameInput.trim() || nameInput.trim().length < 3) {
      setError('Patient name must be at least 3 characters.');
      return;
    }
    onUpdatePatient({ id: selectedPatient.id, name: nameInput.trim(), registrationDate: dateInput });
    onTriggerSqlLog(
      `POST: Patients/Edit/${selectedPatient.id}`,
      `UPDATE "Patients" SET "Name" = '${nameInput.trim().replace(/'/g, "''")}', "RegistrationDate" = '${dateInput}' WHERE "Id" = ${selectedPatient.id};`
    );
    setTempDataSuccess('Patient details updated successfully!');
    setViewMode('index');
  };

  const handleConfirmDelete = () => {
    if (!selectedPatient) return;
    onDeletePatient(selectedPatient.id);
    onTriggerSqlLog(
      `POST: Patients/Delete/${selectedPatient.id} (Cascade Delete on Appointments)`,
      `DELETE FROM "Patients" WHERE "Id" = ${selectedPatient.id};`
    );
    setTempDataSuccess('Patient record and associated appointments removed (Cascade delete)!');
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
                <Users className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Registered Patients</h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                One-to-Many relationship with Appointments configured with <code className="text-xs font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-600">DeleteBehavior.Cascade</code>
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              Register Patient
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {patients.map(pt => {
              const ptAppts = appointments.filter(a => a.patientId === pt.id);

              return (
                <div key={pt.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      {pt.name.charAt(0)}
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <button onClick={() => handleOpenDetails(pt)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenEdit(pt)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenDelete(pt)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mt-4">{pt.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Registered on {pt.registrationDate}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {ptAppts.length} Appointment Record{ptAppts.length === 1 ? '' : 's'}
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
              <Users className="w-5 h-5 text-blue-600" /> Register Patient (Create.cshtml)
            </h2>
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Patient Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Tariq Mansour"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registration Date</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <div className="flex items-center justify-between pt-3 border-t">
                <button type="button" onClick={() => setViewMode('index')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm">
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT */}
      {viewMode === 'edit' && selectedPatient && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-600" /> Edit Patient #{selectedPatient.id}
            </h2>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Patient Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registration Date</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
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
      {viewMode === 'details' && selectedPatient && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">{selectedPatient.name}</h2>
            <p className="text-xs text-slate-500">Registered on {selectedPatient.registrationDate}</p>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Patient Appointment History</p>
              <div className="space-y-2 text-sm">
                {appointments.filter(a => a.patientId === selectedPatient.id).map(a => {
                  const doc = doctors.find(d => d.id === a.doctorId);
                  return (
                    <div key={a.id} className="p-3 bg-white border border-slate-200 rounded flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-blue-700">{doc?.name}</div>
                        <div className="text-xs text-slate-600">{a.diagnosis}</div>
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
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> Back to Patients
            </button>
          </div>
        </div>
      )}

      {/* 5. DELETE */}
      {viewMode === 'delete' && selectedPatient && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-rose-200 shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-rose-600">Delete Patient Record?</h2>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong>{selectedPatient.name}</strong>?
            </p>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs text-rose-800">
              Note: This will cascade delete all scheduled appointments for this patient.
            </div>
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
