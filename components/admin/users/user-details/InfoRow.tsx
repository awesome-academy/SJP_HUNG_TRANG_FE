export default function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-green-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5 break-all">{value || ""}</p>
      </div>
    </div>
  );
}
