export interface Department {
  id: number;
  name: string;
  doctorCount?: number;
}

export interface Doctor {
  id: number;
  name: string;
  departmentId: number;
  department?: Department;
  appointmentCount?: number;
}

export interface Patient {
  id: number;
  name: string;
  registrationDate: string; // ISO date format YYYY-MM-DD
  appointmentCount?: number;
}

export interface Appointment {
  id: number;
  appointmentDate: string; // ISO datetime YYYY-MM-DDTHH:mm
  diagnosis: string;
  patientId: number;
  doctorId: number;
  patient?: Patient;
  doctor?: Doctor;
}

export interface SqlQueryLog {
  id: string;
  timestamp: string;
  sql: string;
  executionTimeMs: number;
  action: string;
}

export interface CodeFile {
  id: string;
  filename: string;
  category: 'Models' | 'Data' | 'Program' | 'Controllers' | 'Views' | 'Config';
  language: string;
  description: string;
  code: string;
  highlightLines?: number[];
}
