
import { cn } from "@/lib/utils";
import { RequestStatus } from "@/types";

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  purchased: { label: "Comprado", className: "bg-green-100 text-green-800 border-green-200" },
  received: { label: "Recebido", className: "bg-blue-100 text-blue-800 border-blue-200" },
  canceled: { label: "Cancelado", className: "bg-red-100 text-red-800 border-red-200" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: statusClassName } = statusConfig[status];
  
  return (
    <span className={cn("px-3 py-1 rounded-full text-sm font-medium border", statusClassName, className)}>
      {label}
    </span>
  );
}
