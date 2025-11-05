import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import useDarkMode from "../hooks/useDarkMode";

export default function Admin() {
  const [darkMode] = useDarkMode();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [typing, setTyping] = useState(null);

  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(new Set());

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit]);

  const fetchStats = async () => {
    try {
      const { data } = await API.get("/admin/stats");
      setStats(data);
    } catch (e) {
      // silent
      e
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(
        `/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}&sort=${sort}&order=${order}`
      );
      setUsers(data.results || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Fetch users failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch on page/sort/order change
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, order]);

  // Debounce search
  useEffect(() => {
    if (typing) clearTimeout(typing);
    const t = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);
    setTyping(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleSort = (field) => {
    if (sort === field) setOrder(order === "asc" ? "desc" : "asc");
    else {
      setSort(field);
      setOrder("asc");
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(sel);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSel(next);
  };

  const bulkBan = async (flag) => {
    try {
      await Promise.all(
        Array.from(sel).map((id) => API.patch(`/admin/users/${id}/ban`, { isBanned: flag }))
      );
      setSel(new Set());
      fetchUsers();
    } catch (e) {
      console.error("Bulk ban failed", e);
    }
  };

  const bulkVerify = async (flag) => {
    try {
      await Promise.all(
        Array.from(sel).map((id) => API.patch(`/admin/users/${id}/verify`, { isVerified: flag }))
      );
      setSel(new Set());
      fetchUsers();
    } catch (e) {
      console.error("Bulk verify failed", e);
    }
  };

 const exportCsv = async () => {
    try {
      // ✅ Use API to fetch with auth headers, set responseType to 'blob'
      const response = await API.get(
        `/admin/users/export?search=${encodeURIComponent(search)}`,
        { responseType: "blob" }
      );

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Extract filename if backend sends it, otherwise default
      link.setAttribute("download", "users.csv");

      // Append to body, click, and cleanup
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export CSV. Are you an admin?");
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen p-6`}>
      <header className={`p-4 mb-4 rounded ${darkMode ? "bg-gray-800" : "bg-white"} shadow flex justify-between items-center`}>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700">Export CSV</button>
          <button onClick={() => (window.location.href = "/dashboard")} className="px-3 py-1.5 rounded bg-blue-600 text-white">Back to App</button>
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { k: "users", label: "Total Users" },
            { k: "verified", label: "Verified" },
            { k: "banned", label: "Banned" },
            { k: "activities", label: "Activities" },
          ].map((s) => (
            <div key={s.k} className={`p-4 rounded ${darkMode ? "bg-gray-800" : "bg-white"} shadow`}>
              <p className="text-sm opacity-70">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{stats[s.k]}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className={`p-4 rounded ${darkMode ? "bg-gray-800" : "bg-white"} shadow mb-4 flex flex-wrap gap-2 items-center`}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email..."
          className={`px-3 py-2 rounded border w-full sm:w-64 ${darkMode ? "bg-gray-900 border-gray-700" : ""}`}
        />
        <div className="ml-auto flex gap-2">
          <button disabled={!sel.size} onClick={() => bulkVerify(true)} className="px-3 py-1.5 rounded bg-green-600 text-white disabled:opacity-50">Verify</button>
          <button disabled={!sel.size} onClick={() => bulkVerify(false)} className="px-3 py-1.5 rounded bg-yellow-600 text-white disabled:opacity-50">Unverify</button>
          <button disabled={!sel.size} onClick={() => bulkBan(true)} className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50">Ban</button>
          <button disabled={!sel.size} onClick={() => bulkBan(false)} className="px-3 py-1.5 rounded bg-gray-500 text-white disabled:opacity-50">Unban</button>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded ${darkMode ? "bg-gray-800" : "bg-white"} shadow overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <tr>
              <th className="p-3"><input type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) setSel(new Set(users.map(u => u._id)));
                  else setSel(new Set());
                }}
                checked={sel.size === users.length && users.length > 0}
              /></th>
              {[
                { k: "name", label: "Name" },
                { k: "email", label: "Email" },
                { k: "role", label: "Role" },
                { k: "isVerified", label: "Verified" },
                { k: "isBanned", label: "Banned" },
                { k: "createdAt", label: "Joined" },
                { k: "actions", label: "Actions", noSort: true },
              ].map(col => (
                <th key={col.k} className="p-3 text-left">
                  {!col.noSort ? (
                    <button
                      className="font-semibold"
                      onClick={() => toggleSort(col.k)}
                      title="Sort"
                    >
                      {col.label} {sort === col.k ? (order === "asc" ? "▲" : "▼") : ""}
                    </button>
                  ) : <span className="font-semibold">{col.label}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-center" colSpan={8}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td className="p-4 text-center" colSpan={8}>No users found</td></tr>
            ) : users.map(u => (
              <tr key={u._id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-3">
                  <input type="checkbox" onChange={() => toggleSelect(u._id)} checked={sel.has(u._id)} />
                </td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.isVerified ? "Yes" : "No"}</td>
                <td className="p-3">{u.isBanned ? "Yes" : "No"}</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={async () => {
                      await API.patch(`/admin/users/${u._id}/role`, { role: u.role === "admin" ? "user" : "admin" });
                      fetchUsers();
                    }}
                    className="px-2 py-1 rounded bg-purple-600 text-white"
                  >
                    {u.role === "admin" ? "Make User" : "Make Admin"}
                  </button>
                  <button
                    onClick={async () => {
                      await API.patch(`/admin/users/${u._id}/verify`, { isVerified: !u.isVerified });
                      fetchUsers();
                    }}
                    className="px-2 py-1 rounded bg-green-600 text-white"
                  >
                    {u.isVerified ? "Unverify" : "Verify"}
                  </button>
                  <button
                    onClick={async () => {
                      await API.patch(`/admin/users/${u._id}/ban`, { isBanned: !u.isBanned });
                      fetchUsers();
                    }}
                    className="px-2 py-1 rounded bg-red-600 text-white"
                  >
                    {u.isBanned ? "Unban" : "Ban"}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete user?")) return;
                      await API.delete(`/admin/users/${u._id}`);
                      fetchUsers();
                    }}
                    className="px-2 py-1 rounded bg-gray-600 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm opacity-70">
          Page {page} / {totalPages} • {total} users
        </p>
        <div className="space-x-2">
          <button disabled={page <= 1} onClick={() => setPage(1)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">« First</button>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">‹ Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">Next ›</button>
          <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">Last »</button>
        </div>
      </div>
    </div>
  );
}
