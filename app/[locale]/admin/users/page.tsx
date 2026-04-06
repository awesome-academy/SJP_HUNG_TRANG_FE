"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";
import { ROLES, Role } from "@/constants/role";
import { USER_STATUS, UserStatus } from "@/constants/user_status";
import { Avatar, StatusBadge, RoleBadge } from "@/components/admin/users/ui";
import { useDebounce } from "use-debounce";
import { useLocale, useTranslations } from "next-intl";

// Confirm Delete Dialog

function ConfirmDeleteDialog({
  user,
  onConfirm,
  onCancel,
}: {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("Admin.users.deleteDialog");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center">
          {t("title")}
        </h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          {t("description", { name: user.fullName })}
        </p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Page

const PAGE_SIZE = 5;

export default function UserListPage() {
  const router = useRouter();
  const locale = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Admin.users");

  const ROLE_OPTIONS = [
    { value: "ALL", label: t("filters.all") },
    { value: ROLES.USER, label: t("filters.user") },
    { value: ROLES.ADMIN, label: t("filters.admin") },
  ] as const;

  const STATUS_OPTIONS = [
    { value: "ALL", label: t("filters.all") },
    { value: USER_STATUS.ACTIVE, label: t("filters.active") },
    { value: USER_STATUS.INACTIVE, label: t("filters.inactive") },
  ] as const;

  type RoleFilter = "ALL" | Role;
  type StatusFilter = "ALL" | UserStatus;

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [debouncedSearch] = useDebounce(search, 400);

  // Pagination
  const [page, setPage] = useState(1);

  // Delete
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [total, setTotal] = useState(0);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (debouncedSearch) params.append("q", debouncedSearch);
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (statusFilter !== "ALL") {
        params.append("isActive", String(statusFilter === USER_STATUS.ACTIVE));
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error();

      const data = await res.json();

      setUsers(data.data);
      setTotal(data.pagination.total);
    } catch {
      setError(t("error.load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  // Stats
  const stats = useMemo(
    () => ({
      total: total,
    }),
    [total],
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = users;

  // Reset page on filter change
  const applySearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const applyRole = (v: typeof roleFilter) => {
    setRoleFilter(v);
    setPage(1);
  };
  const applyStatus = (v: typeof statusFilter) => {
    setStatusFilter(v);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      await load(); // reload list
    } catch {
      alert(t("deleteDialog.error"));
    } finally {
      setDeletingUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-wide">
              {t("title")}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{t("subtitle")}</p>
          </div>
          <Button
            onClick={load}
            variant="outline"
            className="flex items-center gap-2 text-sm border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", loading && "animate-spin")}
            />
            {t("refresh")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">{t("stats.total")}</p>
            <span className="text-lg font-bold text-gray-900">
              {stats.total}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={search}
                onChange={(e) => applySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
              />
            </div>

            {/* Role filter */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => applyRole(r.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                    roleFilter === r.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => applyStatus(s.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                    statusFilter === s.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {(search || roleFilter !== "ALL" || statusFilter !== "ALL") && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                {t("filters.found", { total })}
              </span>
              <button
                onClick={() => {
                  applySearch("");
                  applyRole("ALL");
                  applyStatus("ALL");
                }}
                className="ml-auto text-xs text-green-600 hover:underline font-medium"
              >
                {t("filters.clear")}
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-green-500" />
              {t("table.loading")}
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">
              {error}
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              {t("table.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      t("table.headers.user"),
                      t("table.headers.email"),
                      t("table.headers.phone"),
                      t("table.headers.role"),
                      t("table.headers.status"),
                      t("table.headers.createdAt"),
                    ].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      <span className="sr-only">{t("actions.title")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={cn(
                        "border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors",
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                      )}
                    >
                      {/* Name + avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.fullName} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-gray-400">#{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {user.phone ?? t("table.N/A")}
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={user.isActive} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(locale)
                          : t("table.N/A")}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/users/${user.id}`)
                            }
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition-colors font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {t("actions.view")}
                          </button>
                          <span className="text-gray-200">|</span>
                          <button
                            disabled={user.role === ROLES.ADMIN}
                            onClick={() => setDeletingUser(user)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t("actions.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                {t("pagination.showing", {
                  from: (page - 1) * PAGE_SIZE + 1,
                  to: Math.min(page * PAGE_SIZE, total),
                  total,
                })}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-8 h-8 rounded-lg border text-xs font-semibold transition-all",
                        page === p
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {deletingUser && (
        <ConfirmDeleteDialog
          user={deletingUser}
          onConfirm={handleDelete}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}
