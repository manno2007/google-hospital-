import React, { useState } from 'react';
import { 
  Appointment, 
  Doctor, 
  Patient, 
  Department 
} from '../../types';
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  AlertCircle, 
  ArrowLeft, 
  Save, 
  Building2 
} from 'lucide-react';

interface AppointmentViewsProps {
  appointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  departments: Department[];
  onCreateAppointment: (appt: Omit<Appointment, 'id'>) => void;
  onUpdateAppointment: (appt: Appointment) => void;
  onDeleteAppointment: (id: number) => void;
  onTriggerSqlLog: (action: string, sql: string) => void;
  setTempDataSuccess: (msg: string | null) => void;
}

export const AppointmentViews: React.FC<AppointmentViewsProps> = ({
  appointments,
  doctors,
  patients,
  departments,
  onCreateAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onTriggerSqlLog,
  setTempDataSuccess
}) => {
  const [viewMode, setViewMode] = useState<'index' | 'create' | 'edit' | 'details' | 'delete'>('index');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchString, setSearchString] = useState('');

  // Form states for Create & Edit
  const [formPatientId, setFormPatientId] = useState<number>(patients[0]?.id || 1);
  const [formDoctorId, setFormDoctorId] = useState<number>(doctors[0]?.id || 1);
  const [formDate, setFormDate] = useState<string>(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
  const [formDiagnosis, setFormDiagnosis] = useState<string>('');
  
  // Validation errors simulation (ModelState)
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenCreate = () => {
    setFormPatientId(patients[0]?.id || 1);
    setFormDoctorId(doctors[0]?.id || 1);
    setFormDate(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
    setFormDiagnosis('');
    setErrors({});
    setViewMode('create');
  };

  const handleOpenEdit = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setFormPatientId(appt.patientId);
    setFormDoctorId(appt.doctorId);
    setFormDate(appt.appointmentDate);
    setFormDiagnosis(appt.diagnosis);
    setErrors({});
    setViewMode('edit');
  };

  const handleOpenDetails = (appt: Appointment) => {
    setSelectedAppointment(appt);
    onTriggerSqlLog(
      `GET: Appointments/Details/${appt.id} (Eager Loading)`,
      `SELECT a."Id", a."AppointmentDate", a."Diagnosis", a."PatientId", a."DoctorId",
       p."Name" AS PatientName, d."Name" AS DoctorName, dep."Name" AS DepartmentName
FROM "Appointments" AS a
LEFT JOIN "Patients" AS p ON a."PatientId" = p."Id"
LEFT JOIN "Doctors" AS d ON a."DoctorId" = d."Id"
LEFT JOIN "Departments" AS dep ON d."DepartmentId" = dep."Id"
WHERE a."Id" = ${appt.id} LIMIT 1;`
    );
    setViewMode('details');
  };

  const handleOpenDelete = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setViewMode('delete');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formPatientId) {
      newErrors.PatientId = 'Please select a Patient.';
    }
    if (!formDoctorId) {
      newErrors.DoctorId = 'Please select a Doctor.';
    }
    if (!formDate) {
      newErrors.AppointmentDate = 'Appointment Date & Time is required.';
    }
    if (!formDiagnosis || formDiagnosis.trim().length < 5) {
      newErrors.Diagnosis = 'Diagnosis / Reason must be at least 5 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onCreateAppointment({
      patientId: Number(formPatientId),
      doctorId: Number(formDoctorId),
      appointmentDate: formDate,
      diagnosis: formDiagnosis.trim()
    });

    onTriggerSqlLog(
      'POST: Appointments/Create (INSERT with Foreign Keys)',
      `INSERT INTO "Appointments" ("AppointmentDate", "Diagnosis", "PatientId", "DoctorId")
VALUES ('${formDate}', '${formDiagnosis.replace(/'/g, "''")}', ${formPatientId}, ${formDoctorId});
SELECT last_insert_rowid();`
    );

    setTempDataSuccess('Appointment scheduled successfully (Post/Redirect/Get pattern)!');
    setViewMode('index');
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    if (!validateForm()) return;

    onUpdateAppointment({
      id: selectedAppointment.id,
      patientId: Number(formPatientId),
      doctorId: Number(formDoctorId),
      appointmentDate: formDate,
      diagnosis: formDiagnosis.trim()
    });

    onTriggerSqlLog(
      `POST: Appointments/Edit/${selectedAppointment.id} (UPDATE)`,
      `UPDATE "Appointments"
SET "AppointmentDate" = '${formDate}',
    "Diagnosis" = '${formDiagnosis.replace(/'/g, "''")}',
    "PatientId" = ${formPatientId},
    "DoctorId" = ${formDoctorId}
WHERE "Id" = ${selectedAppointment.id};`
    );

    setTempDataSuccess('Appointment updated successfully!');
    setViewMode('index');
  };

  const handleConfirmDelete = () => {
    if (!selectedAppointment) return;
    onDeleteAppointment(selectedAppointment.id);

    onTriggerSqlLog(
      `POST: Appointments/Delete/${selectedAppointment.id} (DELETE)`,
      `DELETE FROM "Appointments" WHERE "Id" = ${selectedAppointment.id};`
    );

    setTempDataSuccess('Appointment deleted successfully!');
    setViewMode('index');
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(a => {
    const patientName = patients.find(p => p.id === a.patientId)?.name.toLowerCase() || '';
    const doctor = doctors.find(d => d.id === a.doctorId);
    const doctorName = doctor?.name.toLowerCase() || '';
    const deptName = departments.find(dep => dep.id === doctor?.departmentId)?.name.toLowerCase() || '';
    const search = searchString.toLowerCase();
    return patientName.includes(search) || doctorName.includes(search) || deptName.includes(search) || a.diagnosis.toLowerCase().includes(search);
  });

  return (
    <div className="space-y-6">
      
      {/* 1. INDEX VIEW */}
      {viewMode === 'index' && (
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Calendar className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Appointments</h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Eager-loaded with <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono text-xs">.Include(a =&gt; a.Patient).Include(a =&gt; a.Doctor).ThenInclude(d =&gt; d.Department)</code>
              </p>
            </div>
            <button
              id="schedule-appt-btn"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              Schedule Appointment
            </button>
          </div>

          {/* Search Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 rtl:right-3 rtl:left-auto" />
                <input
                  id="search-appointments-input"
                  type="text"
                  placeholder="Search by patient, doctor, department, or diagnosis..."
                  value={searchString}
                  onChange={(e) => setSearchString(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rtl:pr-9 rtl:pl-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              {searchString && (
                <button
                  onClick={() => setSearchString('')}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Doctor & Department</th>
                    <th className="py-3.5 px-4">Diagnosis / Notes</th>
                    <th className="py-3.5 px-4 text-right rtl:text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appt) => {
                      const patient = patients.find(p => p.id === appt.patientId);
                      const doctor = doctors.find(d => d.id === appt.doctorId);
                      const dept = departments.find(dep => dep.id === doctor?.departmentId);

                      return (
                        <tr key={appt.id} className="hover:bg-blue-50/40 transition">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600 rtl:ml-1.5 rtl:mr-0" />
                              {appt.appointmentDate.replace('T', ' ')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-900">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                {patient?.name.charAt(0) || 'P'}
                              </div>
                              <span>{patient?.name || 'Unknown Patient'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-blue-700">{doctor?.name || 'Unassigned Doctor'}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded border border-blue-100">
                              {dept?.name || 'General'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={appt.diagnosis}>
                            {appt.diagnosis}
                          </td>
                          <td className="py-3.5 px-4 text-right rtl:text-left whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                              <button
                                onClick={() => handleOpenDetails(appt)}
                                title="Details"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(appt)}
                                title="Edit"
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDelete(appt)}
                                title="Delete"
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                        <p className="font-medium text-slate-600">No appointments found</p>
                        <p className="text-xs text-slate-400 mt-1">Try changing your search filter or click "Schedule Appointment"</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATE VIEW */}
      {viewMode === 'create' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Calendar className="w-5 h-5" />
                <h2 className="font-bold text-lg">Schedule New Appointment (Create.cshtml)</h2>
              </div>
              <span className="text-xs bg-blue-500/50 px-2 py-1 rounded">ViewBag Dropdowns Binding</span>
            </div>

            <form onSubmit={handleSubmitCreate} className="p-6 space-y-6">
              {/* Anti-Forgery & Model summary banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex items-center space-x-2 rtl:space-x-reverse">
                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  Razor Tag Helper: <code>@Html.AntiForgeryToken()</code> &amp; Controller: <code>[ValidateAntiForgeryToken]</code> + <code>[Bind("AppointmentDate,Diagnosis,PatientId,DoctorId")]</code>
                </span>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-700 text-sm">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-4 h-4" /> Please correct the following validation errors:
                  </div>
                  <ul className="list-disc list-inside text-xs space-y-0.5">
                    {Object.values(errors).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Patient Dropdown (ViewBag.PatientId) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Patient (asp-for="PatientId") <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 rtl:right-3 rtl:left-auto" />
                    <select
                      id="create-patient-select"
                      value={formPatientId}
                      onChange={(e) => setFormPatientId(Number(e.target.value))}
                      className={`w-full pl-9 pr-8 py-2.5 rtl:pr-9 rtl:pl-8 bg-white border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.PatientId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    >
                      <option value="">-- Select Patient (ViewBag.PatientId) --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Reg: {p.registrationDate})</option>
                      ))}
                    </select>
                  </div>
                  {errors.PatientId && <p className="text-xs text-rose-500 mt-1">{errors.PatientId}</p>}
                </div>

                {/* Doctor Dropdown (ViewBag.DoctorId) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Doctor &amp; Department (asp-for="DoctorId") <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3 rtl:right-3 rtl:left-auto" />
                    <select
                      id="create-doctor-select"
                      value={formDoctorId}
                      onChange={(e) => setFormDoctorId(Number(e.target.value))}
                      className={`w-full pl-9 pr-8 py-2.5 rtl:pr-9 rtl:pl-8 bg-white border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.DoctorId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    >
                      <option value="">-- Select Doctor &amp; Department --</option>
                      {doctors.map(d => {
                        const dept = departments.find(dep => dep.id === d.departmentId);
                        return (
                          <option key={d.id} value={d.id}>
                            {d.name} ({dept?.name || 'General'})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {errors.DoctorId && <p className="text-xs text-rose-500 mt-1">{errors.DoctorId}</p>}
                </div>

                {/* Appointment Date */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Appointment Date &amp; Time (asp-for="AppointmentDate") <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 rtl:right-3 rtl:left-auto" />
                    <input
                      id="create-date-input"
                      type="datetime-local"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2.5 rtl:pr-9 rtl:pl-4 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.AppointmentDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.AppointmentDate && <p className="text-xs text-rose-500 mt-1">{errors.AppointmentDate}</p>}
                </div>

                {/* Diagnosis / Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Diagnosis / Symptoms / Reason (asp-for="Diagnosis") <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="create-diagnosis-input"
                    rows={4}
                    value={formDiagnosis}
                    onChange={(e) => setFormDiagnosis(e.target.value)}
                    placeholder="Enter clinical symptoms, diagnosis, or consultation notes..."
                    className={`w-full p-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.Diagnosis ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.Diagnosis && <p className="text-xs text-rose-500 mt-1">{errors.Diagnosis}</p>}
                </div>

              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMode('index')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> Back to List
                </button>
                <button
                  type="submit"
                  id="save-appointment-btn"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT VIEW */}
      {viewMode === 'edit' && selectedAppointment && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-amber-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Edit3 className="w-5 h-5" />
                <h2 className="font-bold text-lg">Edit Appointment #{selectedAppointment.id} (Edit.cshtml)</h2>
              </div>
              <span className="text-xs bg-amber-500/50 px-2 py-1 rounded">Hidden Id Binding</span>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Patient</label>
                  <select
                    value={formPatientId}
                    onChange={(e) => setFormPatientId(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Doctor & Department</label>
                  <select
                    value={formDoctorId}
                    onChange={(e) => setFormDoctorId(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                  >
                    {doctors.map(d => {
                      const dept = departments.find(dep => dep.id === d.departmentId);
                      return (
                        <option key={d.id} value={d.id}>{d.name} ({dept?.name || 'General'})</option>
                      );
                    })}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Diagnosis / Reason</label>
                  <textarea
                    rows={4}
                    value={formDiagnosis}
                    onChange={(e) => setFormDiagnosis(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMode('index')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Update Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DETAILS VIEW */}
      {viewMode === 'details' && selectedAppointment && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Eye className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-lg">Appointment Details #{selectedAppointment.id}</h2>
              </div>
              <span className="text-xs bg-slate-700 px-2 py-1 rounded">Details.cshtml</span>
            </div>

            <div className="p-6 space-y-4">
              {(() => {
                const patient = patients.find(p => p.id === selectedAppointment.patientId);
                const doctor = doctors.find(d => d.id === selectedAppointment.doctorId);
                const dept = departments.find(dep => dep.id === doctor?.departmentId);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Patient</span>
                      <span className="text-base font-bold text-slate-800">{patient?.name}</span>
                      <span className="text-xs text-slate-500 block">Registered: {patient?.registrationDate}</span>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Specialist</span>
                      <span className="text-base font-bold text-blue-600">{doctor?.name}</span>
                      <span className="text-xs text-slate-500 block">Department: {dept?.name}</span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Scheduled Date & Time</span>
                      <span className="text-sm font-semibold text-slate-700 font-mono">
                        {selectedAppointment.appointmentDate.replace('T', ' at ')}
                      </span>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Clinical Diagnosis & Notes</span>
                      <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">
                        {selectedAppointment.diagnosis}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setViewMode('index')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> Back to List
                </button>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => handleOpenEdit(selectedAppointment)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleOpenDelete(selectedAppointment)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. DELETE CONFIRMATION VIEW */}
      {viewMode === 'delete' && selectedAppointment && (
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-xl border border-rose-200 shadow-lg overflow-hidden">
            <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Trash2 className="w-5 h-5" />
                <h2 className="font-bold text-lg">Delete Appointment Confirmation (Delete.cshtml)</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to permanently delete this appointment record from the SQLite database?
              </p>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-slate-800 space-y-2">
                <div>
                  <strong className="text-rose-900">Patient: </strong>
                  {patients.find(p => p.id === selectedAppointment.patientId)?.name}
                </div>
                <div>
                  <strong className="text-rose-900">Doctor: </strong>
                  {doctors.find(d => d.id === selectedAppointment.doctorId)?.name}
                </div>
                <div>
                  <strong className="text-rose-900">Scheduled Date: </strong>
                  {selectedAppointment.appointmentDate.replace('T', ' ')}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMode('index')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
