import { NavHeader } from "@/components/nav-header"
import { DashboardContent } from "@/components/dashboard-content"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <DashboardContent />
    </div>
  )
}
