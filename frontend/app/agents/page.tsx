import { NavHeader } from "@/components/nav-header"
import { AgentsContent } from "@/components/agents-content"

export default function AgentsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <AgentsContent />
    </div>
  )
}
