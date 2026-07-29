import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }: { status: "open" | "in_progress" | "fixed" | "ignored" }) {
  switch (status) {
    case "open":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Open</Badge>
    case "in_progress":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">In Progress</Badge>
    case "fixed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Fixed</Badge>
    case "ignored":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">Ignored</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function PriorityBadge({ priority }: { priority?: "low" | "medium" | "high" | null }) {
  if (!priority) return null;
  
  switch (priority) {
    case "high":
      return <span className="inline-flex items-center text-xs font-medium text-red-600"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />High</span>
    case "medium":
      return <span className="inline-flex items-center text-xs font-medium text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />Medium</span>
    case "low":
      return <span className="inline-flex items-center text-xs font-medium text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-400 mr-1.5" />Low</span>
    default:
      return <span className="text-xs text-muted-foreground">{priority}</span>
  }
}
