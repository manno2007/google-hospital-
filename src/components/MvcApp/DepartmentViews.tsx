import React, { useState } from 'react';
import { Department, Doctor } from '../../types';
import { Building2, Plus, Edit3, Trash2, Eye, ArrowLeft, Save, AlertTriangle, Users } from 'lucide-react';

interface DepartmentViewsProps {
  departments: Department[];
  doctors: Doctor[];
  onCreateDepartment: (name: string) => void;
  onUpdateDepartment: (id: number, name: string) => void;
  onDeleteDepartment: (id: number) => { success: boolean; error?: string };
  onTriggerSqlLog: (action: string, sql: string) => void;
  setTempDataSuccess: (msg: string | null) => void;
  setTempDataError: (msg: string | null) => void;
}

export const DepartmentViews: React.FC<DepartmentViewsProps> = ({
  departments,
  doctors,
  onCreateDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onTriggerSqlLog,
  setTempDataSuccess,
  setTempDataError
}) => {
  const [viewMode, setViewMode] = useState<'index' | 'create' | 'edit' | 'details' | 'delete'>('index');
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setNameInput('');
    setError(null);
    setViewMode('create');
  };

  const handleOpenEdit = (dept: Department) => {
    setSelectedDept(dept);
    setNameInput(dept.name);
    setError(null);
    setViewMode('edit');
  };

  const handleOpenDetails = (dept: Department) => {
    setSelectedDept(dept);
    onTriggerSqlLog(
      `GET: Departments/Details/${dept.id} (.Include(d => d.Doctors))`,
      `SELECT d."Id", d."Name", doc."Id" AS DoctorId, doc."Name" AS DoctorName
FROM "Departments" AS d
LEFT JOIN "Doctors" AS doc ON d."Id" = doc."DepartmentId"
WHERE d."Id" = ${dept.id};`
    );
    setViewMode('details');
  };

  const handleOpenDelete = (dept: Department) => {
    setSelectedDept(dept);
    setViewMode('delete');
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setError('Department name must be between 2 and 100 characters.');
      return;
    }
    onCreateDepartment(nameInput.trim());
    onTriggerSqlLog(
      'POST: Departments/Create',
      `INSERT INTO "Departments" ("Name") VALUES ('${nameInput.trim().replace(/'/g, "''")}');`
    );
    setTempDataSuccess(`Department '${nameInput.trim()}' created successfully!`);
    setViewMode('index');
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setError('Department name must be between 2 and 100 characters.');
      return;
    }
    onUpdateDepartment(selectedDept.id, nameInput.trim());
    onTriggerSqlLog(
      `POST: Departments/Edit/${selectedDept.id}`,
      `UPDATE "Departments" SET "Name" = '${nameInput.trim().replace(/'/g, "''")}' WHERE "Id" = ${selectedDept.id};`
    );
    setTempDataSuccess('Department updated successfully!');
    setViewMode('index');
  };

  const handleConfirmDelete = () => {
    if (!selectedDept) return;
    const res = onDeleteDepartment(selectedDept.id);
    if (!res.success) {
      setTempDataError(res.error || 'Cannot delete department with assigned doctors (DeleteBehavior.Restrict).');
    } else {
      onTriggerSqlLog(
        `POST: Departments/Delete/${selectedDept.id}`,
        `DELETE FROM "Departments" WHERE "Id" = ${selectedDept.id};`
      );
      setTempDataSuccess('Department deleted successfully!');
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
                <Building2 className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Departments</h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                One-to-Many relationship with Doctors configured via Fluent API with <code className="text-xs font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-600">DeleteBehavior.Restrict</code>
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map(dept => {
              const deptDoctors = doctors.filter(d => d.departmentId === dept.id);
              return (
                <div key={dept.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <button
                        onClick={() => handleOpenDetails(dept)}
                        title="Details"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        title="Edit"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(dept)}
                        title="Delete"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mt-4">{dept.name}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-2">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400 rtl:ml-1.5 rtl:mr-0" />
                    <span>{deptDoctors.length} Active Specialist{deptDoctors.length === 1 ? '' : 's'}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {deptDoctors.slice(0, 3).map(doc => (
                      <span key={doc.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                        {doc.name}
                      </span>
                    ))}
                    {deptDoctors.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                        +{deptDoctors.length - 3} more
                      </span>
                    )}
                    {deptDoctors.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No doctors assigned yet</span>
                    )}
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
              <Building2 className="w-5 h-5 text-blue-600" /> Add New Department
            </h2>
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Oncology, Radiology"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setViewMode('index')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT */}
      {viewMode === 'edit' && selectedDept && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-600" /> Edit Department #{selectedDept.id}
            </h2>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
                {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setViewMode('index')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DETAILS */}
      {viewMode === 'details' && selectedDept && (
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> {selectedDept.name} (Details.cshtml)
            </h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase">Assigned Doctors</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {doctors.filter(d => d.departmentId === selectedDept.id).map(doc => (
                  <li key={doc.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> {doc.name}
                  </li>
                ))}
                {doctors.filter(d => d.departmentId === selectedDept.id).length === 0 && (
                  <li className="text-slate-400 italic text-xs">No doctors assigned.</li>
                )}
              </ul>
            </div>
            <button
              onClick={() => setViewMode('index')}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> Back to Departments
            </button>
          </div>
        </div>
      )}

      {/* 5. DELETE */}
      {viewMode === 'delete' && selectedDept && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-rose-200 shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-lg font-bold">Delete Department?</h2>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong>{selectedDept.name}</strong>?
            </p>
            {doctors.filter(d => d.departmentId === selectedDept.id).length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800">
                Warning: This department has active doctors. Delete will be blocked by EF Core <code className="font-mono">DeleteBehavior.Restrict</code>.
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t">
              <button
                type="button"
                onClick={() => setViewMode('index')}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
