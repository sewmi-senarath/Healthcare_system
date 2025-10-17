import React, { useEffect, useMemo, useState } from "react";

const roles = ["doctor", "nurse", "pharmacist", "manager", "staff"];
const statuses = ["active", "inactive"];
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  ""; // e.g. http://localhost:5000

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const defaultForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "staff",
  salary: 0,
  status: "active",
  address: { country: "Sri Lanka" },
};

export default function EmployeesPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (sort) p.set("sort", sort);
    if (statusFilter) p.set("status", statusFilter);
    if (roleFilter) p.set("role", roleFilter);
    p.set("page", String(page));
    p.set("limit", String(limit));
    return p.toString();
  }, [query, sort, statusFilter, roleFilter, page, limit]);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/employees?${qs}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load");
      setItems(data.data || []);
      setTotal(data.meta?.total || 0);
      setPages(data.meta?.pages || 1);
    } catch (err) {
      setToast(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  function resetForm() {
    setForm(defaultForm);
    setErrors({});
    setEditing(null);
  }

  function openCreate() {
    resetForm();
    setFormOpen(true);
  }

  function openEdit(emp) {
    setEditing(emp);
    setForm({
      ...emp,
      joinedAt: emp.joinedAt ? new Date(emp.joinedAt) : undefined,
    });
    setErrors({});
    setFormOpen(true);
  }

  function validate(values) {
    const e = {};
    if (!values.firstName || values.firstName.trim().length < 2) e.firstName = "First name is required (min 2)";
    if (!values.lastName || values.lastName.trim().length < 2) e.lastName = "Last name is required (min 2)";
    if (!values.email || !/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Valid email required";
    if (!roles.includes(values.role)) e.role = "Role is required";
    if (values.salary != null && Number(values.salary) < 0) e.salary = "Salary cannot be negative";
    if (values.status && !statuses.includes(values.status)) e.status = "Invalid status";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      const isEdit = !!(editing && editing._id);
      const url = isEdit ? `${API_BASE}/api/employees/${editing._id}` : `${API_BASE}/api/employees`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...form,
          joinedAt: form.joinedAt ? new Date(form.joinedAt).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save");

      setToast(isEdit ? "Employee updated" : "Employee created");
      setFormOpen(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      setToast(err.message || "Save failed");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this employee? (soft delete)")) return;
    try {
      const res = await fetch(`${API_BASE}/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      setToast("Employee deleted");
      fetchEmployees();
    } catch (err) {
      setToast(err.message || "Delete failed");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-sm text-gray-500">Manage staff, doctors, pharmacists, and more.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openCreate} className="px-4 py-2 rounded-md bg-black text-white hover:opacity-90">
            + New Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Search name/email/role..."
          value={query}
          onChange={(e) => {
            setPage(1);
            setQuery(e.target.value);
          }}
        />
        <select
          className="border rounded-md px-3 py-2"
          value={roleFilter}
          onChange={(e) => {
            setPage(1);
            setRoleFilter(e.target.value || "");
          }}
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r[0].toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="border rounded-md px-3 py-2"
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value || "");
          }}
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="border rounded-md px-3 py-2"
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value);
          }}
        >
          <option value="-createdAt">Newest</option>
          <option value="firstName">First Name (A→Z)</option>
          <option value="lastName">Last Name (A→Z)</option>
          <option value="-salary">Salary (High→Low)</option>
          <option value="salary">Salary (Low→High)</option>
        </select>
        <select
          className="border rounded-md px-3 py-2"
          value={limit}
          onChange={(e) => {
            setPage(1);
            setLimit(Number(e.target.value));
          }}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Salary</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={7}>
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={7}>
                  No employees found.
                </td>
              </tr>
            ) : (
              items.map((emp) => (
                <tr key={emp._id} className="border-t">
                  <td className="px-4 py-2">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-2">{emp.email}</td>
                  <td className="px-4 py-2 capitalize">{emp.role}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        emp.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{emp.salary ?? 0}</td>
                  <td className="px-4 py-2">
                    {emp.joinedAt ? new Date(emp.joinedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(emp)}
                        className="px-3 py-1 rounded-md border hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => emp._id && handleDelete(emp._id)}
                        className="px-3 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-sm">
            Page {page} / {pages || 1}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? "Edit Employee" : "New Employee"}</h2>
              <button
                onClick={() => {
                  setFormOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">First Name</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
                {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Last Name</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
                {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Role</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r[0].toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={form.status || "active"}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Salary</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="number"
                  min={0}
                  value={form.salary ?? 0}
                  onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
                />
                {errors.salary && <p className="text-red-600 text-xs mt-1">{errors.salary}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Joined At</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="date"
                  value={form.joinedAt ? new Date(form.joinedAt).toISOString().slice(0, 10) : ""}
                  onChange={(e) =>
                    setForm({ ...form, joinedAt: e.target.value ? new Date(e.target.value) : undefined })
                  }
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div>
                  <label className="block text-sm mb-1">Address Line 1</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    value={form.address?.line1 || ""}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, line1: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">City</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    value={form.address?.city || ""}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Country</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    value={form.address?.country || ""}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-md bg-black text-white">
                  {editing ? "Save Changes" : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-4 right-4 bg-black text-white rounded-md px-4 py-2 shadow"
          onAnimationEnd={() => setTimeout(() => setToast(null), 2000)}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
