import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MvcLayout } from './components/MvcApp/MvcLayout';
import { AppointmentViews } from './components/MvcApp/AppointmentViews';
import { DepartmentViews } from './components/MvcApp/DepartmentViews';
import { DoctorViews } from './components/MvcApp/DoctorViews';
import { PatientViews } from './components/MvcApp/PatientViews';
import { CodeExplorer } from './components/CodeExplorer/CodeExplorer';
import { DbInspector } from './components/DatabaseExplorer/DbInspector';
import { MentorGuide } from './components/MentorGuide/MentorGuide';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_DOCTORS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_SQL_LOGS 
} from './data/seedData';
import { Department, Doctor, Patient, Appointment, SqlQueryLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'mvc' | 'code' | 'db' | 'mentor'>('mvc');
  const [currentController, setCurrentController] = useState<'Appointments' | 'Patients' | 'Doctors' | 'Departments'>('Appointments');
  const [isRtl, setIsRtl] = useState<boolean>(false);

  // Simulated In-Memory Database State (EF Core DbSet)
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [sqlLogs, setSqlLogs] = useState<SqlQueryLog[]>(INITIAL_SQL_LOGS);

  // ASP.NET Core TempData Flash Messages
  const [tempDataSuccess, setTempDataSuccess] = useState<string | null>(
    'Welcome to MediCore Hospital Management System (ASP.NET Core 8 MVC with EF Core SQLite)!'
  );
  const [tempDataError, setTempDataError] = useState<string | null>(null);

  // Trigger simulated SQL log
  const handleTriggerSqlLog = (action: string, sql: string) => {
    const newLog: SqlQueryLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      action,
      sql,
      executionTimeMs: Math.floor(Math.random() * 6) + 2
    };
    setSqlLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // Reset database to initial seed data
  const handleResetDatabase = () => {
    setDepartments(INITIAL_DEPARTMENTS);
    setDoctors(INITIAL_DOCTORS);
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setSqlLogs(INITIAL_SQL_LOGS);
    setTempDataSuccess('Database re-seeded with initial migration data (HasData)!');
    setTempDataError(null);
  };

  // --- CRUD Operations for Appointments ---
  const handleCreateAppointment = (appt: Omit<Appointment, 'id'>) => {
    const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    const newAppt: Appointment = { ...appt, id: newId };
    setAppointments(prev => [newAppt, ...prev]);
  };

  const handleUpdateAppointment = (appt: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === appt.id ? appt : a));
  };

  const handleDeleteAppointment = (id: number) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  // --- CRUD Operations for Departments ---
  const handleCreateDepartment = (name: string) => {
    const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1;
    setDepartments(prev => [...prev, { id: newId, name }]);
  };

  const handleUpdateDepartment = (id: number, name: string) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  };

  const handleDeleteDepartment = (id: number): { success: boolean; error?: string } => {
    const hasDoctors = doctors.some(d => d.departmentId === id);
    if (hasDoctors) {
      return { success: false, error: 'Cannot delete Department: Active doctors are assigned (DeleteBehavior.Restrict).' };
    }
    setDepartments(prev => prev.filter(d => d.id !== id));
    return { success: true };
  };

  // --- CRUD Operations for Doctors ---
  const handleCreateDoctor = (doc: { name: string; departmentId: number }) => {
    const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
    setDoctors(prev => [...prev, { id: newId, ...doc }]);
  };

  const handleUpdateDoctor = (doc: { id: number; name: string; departmentId: number }) => {
    setDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, ...doc } : d));
  };

  const handleDeleteDoctor = (id: number): { success: boolean; error?: string } => {
    const hasAppts = appointments.some(a => a.doctorId === id);
    if (hasAppts) {
      return { success: false, error: 'Cannot delete Doctor: Doctor has scheduled appointments (DeleteBehavior.Restrict).' };
    }
    setDoctors(prev => prev.filter(d => d.id !== id));
    return { success: true };
  };

  // --- CRUD Operations for Patients ---
  const handleCreatePatient = (pt: { name: string; registrationDate: string }) => {
    const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
    setPatients(prev => [...prev, { id: newId, ...pt }]);
  };

  const handleUpdatePatient = (pt: { id: number; name: string; registrationDate: string }) => {
    setPatients(prev => prev.map(p => p.id === pt.id ? { ...p, ...pt } : p));
  };

  const handleDeletePatient = (id: number) => {
    // Cascade delete appointments
    setAppointments(prev => prev.filter(a => a.patientId !== id));
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRtl={isRtl}
        setIsRtl={setIsRtl}
        onResetDatabase={handleResetDatabase}
      />

      {/* Main Content Areas */}
      <div className="flex-1 bg-slate-100 text-slate-900">
        
        {/* Tab 1: Live ASP.NET Core MVC 8 Web Simulator */}
        {activeTab === 'mvc' && (
          <MvcLayout
            currentController={currentController}
            setCurrentController={setCurrentController}
            tempDataSuccess={tempDataSuccess}
            setTempDataSuccess={setTempDataSuccess}
            tempDataError={tempDataError}
            setTempDataError={setTempDataError}
            totalAppointments={appointments.length}
            totalPatients={patients.length}
            totalDoctors={doctors.length}
            totalDepartments={departments.length}
          >
            {currentController === 'Appointments' && (
              <AppointmentViews
                appointments={appointments}
                doctors={doctors}
                patients={patients}
                departments={departments}
                onCreateAppointment={handleCreateAppointment}
                onUpdateAppointment={handleUpdateAppointment}
                onDeleteAppointment={handleDeleteAppointment}
                onTriggerSqlLog={handleTriggerSqlLog}
                setTempDataSuccess={setTempDataSuccess}
              />
            )}

            {currentController === 'Patients' && (
              <PatientViews
                patients={patients}
                appointments={appointments}
                doctors={doctors}
                onCreatePatient={handleCreatePatient}
                onUpdatePatient={handleUpdatePatient}
                onDeletePatient={handleDeletePatient}
                onTriggerSqlLog={handleTriggerSqlLog}
                setTempDataSuccess={setTempDataSuccess}
              />
            )}

            {currentController === 'Doctors' && (
              <DoctorViews
                doctors={doctors}
                departments={departments}
                appointments={appointments}
                patients={patients}
                onCreateDoctor={handleCreateDoctor}
                onUpdateDoctor={handleUpdateDoctor}
                onDeleteDoctor={handleDeleteDoctor}
                onTriggerSqlLog={handleTriggerSqlLog}
                setTempDataSuccess={setTempDataSuccess}
                setTempDataError={setTempDataError}
              />
            )}

            {currentController === 'Departments' && (
              <DepartmentViews
                departments={departments}
                doctors={doctors}
                onCreateDepartment={handleCreateDepartment}
                onUpdateDepartment={handleUpdateDepartment}
                onDeleteDepartment={handleDeleteDepartment}
                onTriggerSqlLog={handleTriggerSqlLog}
                setTempDataSuccess={setTempDataSuccess}
                setTempDataError={setTempDataError}
              />
            )}
          </MvcLayout>
        )}

        {/* Tab 2: Full C# Source Code Explorer */}
        {activeTab === 'code' && <CodeExplorer />}

        {/* Tab 3: SQLite & EF Core Inspector */}
        {activeTab === 'db' && (
          <DbInspector
            departments={departments}
            doctors={doctors}
            patients={patients}
            appointments={appointments}
            sqlLogs={sqlLogs}
            onClearLogs={() => setSqlLogs([])}
          />
        )}

        {/* Tab 4: Senior Developer & Mentor Notes */}
        {activeTab === 'mentor' && <MentorGuide />}

      </div>

    </div>
  );
}
