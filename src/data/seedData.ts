import { Department, Doctor, Patient, Appointment, SqlQueryLog } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 1, name: 'Cardiology' },
  { id: 2, name: 'Neurology' },
  { id: 3, name: 'Pediatrics' },
  { id: 4, name: 'Orthopedics' },
  { id: 5, name: 'General Surgery' }
];

export const INITIAL_DOCTORS: Doctor[] = [
  { id: 1, name: 'Dr. Sarah Al-Mansoor', departmentId: 1 },
  { id: 2, name: 'Dr. Marcus Vance', departmentId: 1 },
  { id: 3, name: 'Dr. Elena Rostova', departmentId: 2 },
  { id: 4, name: 'Dr. Tariq Mahmoud', departmentId: 3 },
  { id: 5, name: 'Dr. James Wilson', departmentId: 4 }
];

export const INITIAL_PATIENTS: Patient[] = [
  { id: 1, name: 'Amina Khalid', registrationDate: '2024-01-15' },
  { id: 2, name: 'Omar Farooq', registrationDate: '2024-02-20' },
  { id: 3, name: 'Chloe Bennett', registrationDate: '2024-03-05' },
  { id: 4, name: 'Youssef Ibrahim', registrationDate: '2024-04-12' }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    appointmentDate: '2024-10-15T10:30',
    diagnosis: 'Routine cardiac checkup; mild hypertension monitoring and ECG scan.',
    patientId: 1,
    doctorId: 1
  },
  {
    id: 2,
    appointmentDate: '2024-10-16T14:00',
    diagnosis: 'Recurring migraine episodes with visual aura; requested MRI follow-up.',
    patientId: 2,
    doctorId: 3
  },
  {
    id: 3,
    appointmentDate: '2024-10-18T11:15',
    diagnosis: 'Pediatric asthma follow-up and inhaler dosage adjustment.',
    patientId: 3,
    doctorId: 4
  },
  {
    id: 4,
    appointmentDate: '2024-10-20T09:00',
    diagnosis: 'Post-operative knee arthroscopy physical therapy evaluation.',
    patientId: 4,
    doctorId: 5
  }
];

export const INITIAL_SQL_LOGS: SqlQueryLog[] = [
  {
    id: 'log-1',
    timestamp: new Date().toLocaleTimeString(),
    action: 'Database.EnsureCreated()',
    sql: `CREATE TABLE IF NOT EXISTS "Departments" ("Id" INTEGER PRIMARY KEY AUTOINCREMENT, "Name" TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS "Patients" ("Id" INTEGER PRIMARY KEY AUTOINCREMENT, "Name" TEXT NOT NULL, "RegistrationDate" TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS "Doctors" ("Id" INTEGER PRIMARY KEY AUTOINCREMENT, "Name" TEXT NOT NULL, "DepartmentId" INTEGER NOT NULL, FOREIGN KEY("DepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT);
CREATE TABLE IF NOT EXISTS "Appointments" ("Id" INTEGER PRIMARY KEY AUTOINCREMENT, "AppointmentDate" TEXT NOT NULL, "Diagnosis" TEXT NOT NULL, "PatientId" INTEGER NOT NULL, "DoctorId" INTEGER NOT NULL, FOREIGN KEY("PatientId") REFERENCES "Patients"("Id") ON DELETE CASCADE, FOREIGN KEY("DoctorId") REFERENCES "Doctors"("Id") ON DELETE RESTRICT);`,
    executionTimeMs: 14
  },
  {
    id: 'log-2',
    timestamp: new Date().toLocaleTimeString(),
    action: 'Appointments.Include(a => a.Patient).Include(a => a.Doctor).ThenInclude(d => d.Department)',
    sql: `SELECT a."Id", a."AppointmentDate", a."Diagnosis", a."PatientId", a."DoctorId",
       p."Id" AS "Patient_Id", p."Name" AS "Patient_Name",
       d."Id" AS "Doctor_Id", d."Name" AS "Doctor_Name", d."DepartmentId",
       dep."Id" AS "Dep_Id", dep."Name" AS "Department_Name"
FROM "Appointments" AS a
LEFT JOIN "Patients" AS p ON a."PatientId" = p."Id"
LEFT JOIN "Doctors" AS d ON a."DoctorId" = d."Id"
LEFT JOIN "Departments" AS dep ON d."DepartmentId" = dep."Id"
ORDER BY a."AppointmentDate" DESC;`,
    executionTimeMs: 4
  }
];
