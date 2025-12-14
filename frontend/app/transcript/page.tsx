import { NavHeader } from "@/components/nav-header"
import { TranscriptContent } from "@/components/transcript-content"

export default function TranscriptPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <TranscriptContent />
    </div>
  )
}
