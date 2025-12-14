"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, Code, Brain, Wrench, Loader2 } from "lucide-react"
import { eventsApi, matchesApi, Event, Agent, agentsApi } from "@/lib/api"

export function TranscriptContent() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get('matchId')
  
  const [events, setEvents] = useState<Event[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [agentFilter, setAgentFilter] = useState<string>("all")
  const [attackTypeFilter, setAttackTypeFilter] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [matchId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventsData, agentsData] = await Promise.all([
        matchId ? matchesApi.getEvents(matchId, 1000) : eventsApi.getRecent(500),
        agentsApi.getAll()
      ])
      setEvents(eventsData)
      setAgents(agentsData)
    } catch (error) {
      console.error('Failed to load transcript data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.reasoning && event.reasoning.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSeverity = severityFilter === "all" || event.severity === severityFilter
    const matchesAgent = agentFilter === "all" || event.agentId === agentFilter
    const matchesAttackType = attackTypeFilter === "all" || event.attackType === attackTypeFilter

    return matchesSearch && matchesSeverity && matchesAgent && matchesAttackType
  })

  const uniqueAgents = Array.from(new Set(events.map(e => e.agentId)))
    .map(id => agents.find(a => a.id === id))
    .filter(Boolean) as Agent[]

  const uniqueAttackTypes = Array.from(new Set(events.map(e => e.attackType).filter(Boolean)))

  if (loading) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    )
  }

  return (
    <main className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Live Transcript</h1>
          <p className="text-muted-foreground">
            {matchId ? `Transcript for match ${matchId}` : "Detailed event log with full context"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const dataStr = JSON.stringify(events, null, 2)
            const blob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `transcript-${matchId || 'all'}-${Date.now()}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}>
            <Download className="mr-2 h-4 w-4" />
            Export Transcript
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {uniqueAgents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={attackTypeFilter} onValueChange={setAttackTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Attack Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueAttackTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Event List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              {events.length === 0 
                ? "No events found. Start a match to see events!"
                : "No events match your filters."}
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => {
            const agent = agents.find(a => a.id === event.agentId)
            
            return (
              <Card key={event.id} className="overflow-hidden">
                <Accordion type="single" collapsible>
                  <AccordionItem value={event.id} className="border-0">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/50">
                      <div className="flex w-full items-center gap-4">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            event.type === "attack"
                              ? "bg-red-attack"
                              : event.type === "defense"
                                ? "bg-blue-defense"
                                : "bg-target-neutral"
                          }`}
                        />
                        <div className="flex flex-1 items-center gap-3 text-left">
                          <span className="font-mono text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              event.type === "attack"
                                ? "border-red-attack text-red-attack"
                                : event.type === "defense"
                                  ? "border-blue-defense text-blue-defense"
                                  : "border-target-neutral text-target-neutral"
                            }
                          >
                            {event.type === "attack"
                              ? "Red Attack"
                              : event.type === "defense"
                                ? "Blue Defense"
                                : "Target Response"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              event.severity === "critical"
                                ? "border-destructive text-destructive"
                                : event.severity === "high"
                                  ? "border-orange-500 text-orange-500"
                                  : "border-muted-foreground text-muted-foreground"
                            }
                          >
                            {event.severity}
                          </Badge>
                          <span className="flex-1 text-sm">{event.description}</span>
                          <Badge
                            variant="outline"
                            className={
                              event.outcome === "success" || event.outcome === "blocked" || event.outcome === "mitigated"
                                ? "border-green-500 text-green-500"
                                : event.outcome === "detected"
                                  ? "border-yellow-500 text-yellow-500"
                                  : ""
                            }
                          >
                            {event.outcome}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t border-border px-6 pb-4 pt-4">
                      <div className="space-y-4">
                        {/* Full Prompt */}
                        <div>
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Code className="h-4 w-4" />
                            Prompt
                          </div>
                          <div className="rounded-md bg-secondary p-3">
                            <code className="font-mono text-sm whitespace-pre-wrap">{event.prompt}</code>
                          </div>
                        </div>

                        {/* Reasoning */}
                        {event.reasoning && (
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                              <Brain className="h-4 w-4" />
                              Reasoning
                            </div>
                            <p className="text-sm text-muted-foreground">{event.reasoning}</p>
                          </div>
                        )}

                        {/* Tool Calls */}
                        {event.toolCalls && event.toolCalls.length > 0 && (
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                              <Wrench className="h-4 w-4" />
                              Tool Calls
                            </div>
                            <div className="space-y-2">
                              {event.toolCalls.map((tool, idx) => (
                                <div key={idx} className="rounded-md bg-secondary p-3">
                                  <div className="mb-1 font-mono text-sm font-medium">{tool.tool}</div>
                                  <code className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                                    {typeof tool.params === 'string' ? tool.params : JSON.stringify(tool.params, null, 2)}
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                          <span>Event ID: {event.id}</span>
                          <span>Agent: {agent?.name || event.agentName || event.agentId}</span>
                          {event.attackType && <span>Type: {event.attackType}</span>}
                          <span>Match: {event.matchId}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            )
          })
        )}
      </div>
    </main>
  )
}
