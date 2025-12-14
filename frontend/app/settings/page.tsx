import { NavHeader } from "@/components/nav-header"
import { SettingsContent } from "@/components/settings-content"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <SettingsContent />
    </div>
  )
}
