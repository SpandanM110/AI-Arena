import { NavHeader } from "@/components/nav-header"
import { MatchesContent } from "@/components/matches-content"

export default function MatchesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <MatchesContent />
    </div>
  )
}
