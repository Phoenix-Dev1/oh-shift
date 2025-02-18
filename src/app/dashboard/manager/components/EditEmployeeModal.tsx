// src/app/dashboard/components/EditEmployeeModal.tsx

"use client";

interface EditEmployeeModalProps {
  employee: {
    id: string;
    name: string;
    position?: string;
    phone?: string;
  } | null;
  name: string;
  position: string;
  phone: string;
  setName: (value: string) => void;
  setPosition: (value: string) => void;
  setPhone: (value: string) => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export default function EditEmployeeModal({
  employee,
  name,
  position,
  phone,
  setName,
  setPosition,
  setPhone,
  onClose,
  onSave,
}: EditEmployeeModalProps) {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-bg-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-text-secondary">
          Edit Employee
        </h2>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">
              Name
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 bg-bg-900 text-text-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">
              Position
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 bg-bg-900 text-text-primary"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">
              Phone Number
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 bg-bg-900 text-text-primary"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
