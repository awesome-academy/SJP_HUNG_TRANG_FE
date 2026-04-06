import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"; 
import { cn } from "@/lib/utils";

export function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <div>
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function SortButton({
  field, label, current, order, onClick,
}: {
  field: string; label: string;
  current: string; order: "asc" | "desc";
  onClick: (field: string) => void;
}) {
  const active = current === field;
  return (
    <button
      onClick={() => onClick(field)}
      className={cn(
        "flex items-center gap-1 text-xs font-semibold transition-colors",
        active ? "text-green-600" : "text-gray-400 hover:text-gray-700"
      )}
    >
      {label}
      {active
        ? order === "asc"
          ? <ArrowUp className="w-3 h-3" />
          : <ArrowDown className="w-3 h-3" />
        : <ArrowUpDown className="w-3 h-3" />}
    </button>
  );
}

export function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-green-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

export function SectionCard({ title, icon, children, action }: { title: string; icon?: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {icon && <span className="text-green-600">{icon}</span>}
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
