"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Download, Shield, Swords, Target, Clock, Trophy, AlertTriangle, Loader2, Plus } from "lucide-react"
import { matchesApi, agentsApi, Match, Agent, Event } from "@/lib/api"
import { useRouter } from "next/navigation"

export function MatchesContent() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [matchEvents, setMatchEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  // Match creation form state
  const [redAgentId, setRedAgentId] = useState<string>("")
  const [blueAgentId, setBlueAgentId] = useState<string>("")
  const [targetAgentId, setTargetAgentId] = useState<string>("")
  const [matchMode, setMatchMode] = useState<'quick' | 'standard' | 'deep' | 'continuous'>('standard')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [matchesData, agentsData] = await Promise.all([
        matchesApi.getAll(100, 0),
        agentsApi.getAll()
      ])
      setMatches(matchesData)
      setAgents(agentsData)
      
      // Auto-select first agent of each type if available
      const redAgents = agentsData.filter(a => a.type === 'red')
      const blueAgents = agentsData.filter(a => a.type === 'blue')
      const targetAgents = agentsData.filter(a => a.type === 'target')
      
      if (redAgents.length > 0 && !redAgentId) setRedAgentId(redAgents[0].id)
      if (blueAgents.length > 0 && !blueAgentId) setBlueAgentId(blueAgents[0].id)
      if (targetAgents.length > 0 && !targetAgentId) setTargetAgentId(targetAgents[0].id)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = async () => {
    if (!redAgentId || !blueAgentId || !targetAgentId) {
      alert('Please select all three agents')
      return
    }

    try {
      setCreating(true)
      const match = await matchesApi.create({
        redAgentId,
        blueAgentId,
        targetAgentId,
        mode: matchMode
      })
      
      // Start the match
      await matchesApi.resume(match.id)
      
      setShowCreateDialog(false)
      router.push('/')
    } catch (error: any) {
      alert(`Failed to create match: ${error.message}`)
    } finally {
      setCreating(false)
    }
  }

  const loadMatchEvents = async (matchId: string) => {
    try {
      const events = await matchesApi.getEvents(matchId, 1000)
      setMatchEvents(events)
    } catch (error) {
      console.error('Failed to load match events:', error)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const redAgents = agents.filter(a => a.type === 'red')
  const blueAgents = agents.filter(a => a.type === 'blue')
  const targetAgents = agents.filter(a => a.type === 'target')

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
          <h1 className="text-3xl font-bold text-balance">Match History</h1>
          <p className="text-muted-foreground">Review past battles and analyze outcomes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Match
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Match</DialogTitle>
              <DialogDescription>Select agents and start a new Red vs Blue simulation</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Red Team Agent</Label>
                <Select value={redAgentId} onValueChange={setRedAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select red agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {redAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blue Team Agent</Label>
                <Select value={blueAgentId} onValueChange={setBlueAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blue agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {blueAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex flex-col">
                          <span>{agent.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{agent.model}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Agent</Label>
                <Select value={targetAgentId} onValueChange={setTargetAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex flex-col">
                          <span>{agent.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{agent.model}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Match Mode</Label>
                <Select value={matchMode} onValueChange={(v: any) => setMatchMode(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick (3 rounds)</SelectItem>
                    <SelectItem value="standard">Standard (5 rounds)</SelectItem>
                    <SelectItem value="deep">Deep (10 rounds)</SelectItem>
                    <SelectItem value="continuous">Continuous (until stopped)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateMatch} disabled={creating} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Create & Start Match
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Matches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Matches</CardTitle>
          <CardDescription>Completed simulation battles</CardDescription>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matches yet. Create your first match to begin!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => {
                  const redAgent = agents.find(a => a.id === match.redAgentId)
                  const blueAgent = agents.find(a => a.id === match.blueAgentId)
                  const targetAgent = agents.find(a => a.id === match.targetAgentId)
                  
                  return (
                    <TableRow key={match.id}>
                      <TableCell className="font-mono text-sm">{match.id}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {match.startedAt 
                          ? new Date(match.startedAt).toLocaleString()
                          : 'Not started'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDuration(match.duration)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            match.status === 'running'
                              ? "border-green-500 text-green-500"
                              : match.status === 'complete'
                              ? "border-blue-500 text-blue-500"
                              : "border-gray-500 text-gray-500"
                          }
                        >
                          {match.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="text-red-attack">{match.score.attacks}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-blue-defense">{match.score.defenses}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            match.score.severity >= 8
                              ? "border-destructive text-destructive"
                              : match.score.severity >= 6
                                ? "border-orange-500 text-orange-500"
                                : "border-green-500 text-green-500"
                          }
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {match.score.severity.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {match.winner === "red" && (
                          <Badge variant="outline" className="border-red-attack text-red-attack">
                            <Trophy className="mr-1 h-3 w-3" />
                            Red Team
                          </Badge>
                        )}
                        {match.winner === "blue" && (
                          <Badge variant="outline" className="border-blue-defense text-blue-defense">
                            <Trophy className="mr-1 h-3 w-3" />
                            Blue Team
                          </Badge>
                        )}
                        {match.winner === "draw" && (
                          <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                            Draw
                          </Badge>
                        )}
                        {!match.winner && <span className="text-muted-foreground text-sm">-</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={async () => {
                                setSelectedMatch(match)
                                await loadMatchEvents(match.id)
                              }}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              View Replay
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">Match Replay: {match.id}</DialogTitle>
                              <DialogDescription>
                                {match.startedAt 
                                  ? `${new Date(match.startedAt).toLocaleString()} • ${formatDuration(match.duration)}`
                                  : 'Not started'}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="mt-4 space-y-6">
                              {/* Match Overview */}
                              <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Agents</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Swords className="h-4 w-4 text-red-attack" />
                                      <span>{redAgent?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-blue-defense" />
                                      <span>{blueAgent?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Target className="h-4 w-4 text-target-neutral" />
                                      <span>{targetAgent?.name || 'Unknown'}</span>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Battle Score</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Attacks</span>
                                      <span className="font-medium text-red-attack">{match.score.attacks}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Defenses</span>
                                      <span className="font-medium text-blue-defense">{match.score.defenses}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Defense Rate</span>
                                      <span className="font-medium">
                                        {match.score.attacks > 0 
                                          ? ((match.score.defenses / match.score.attacks) * 100).toFixed(0)
                                          : '0'}%
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Severity Analysis</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center gap-2">
                                      <div className="text-3xl font-bold">{match.score.severity.toFixed(1)}</div>
                                      <div className="text-xs text-muted-foreground">/ 10</div>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {match.score.severity >= 8 ? "High risk detected" : "Moderate risk level"}
                                    </p>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Event Timeline */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Event Timeline</CardTitle>
                                  <CardDescription>{matchEvents.length} events</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {matchEvents.length === 0 ? (
                                      <p className="text-center text-muted-foreground py-4">No events recorded</p>
                                    ) : (
                                      matchEvents.map((event) => {
                                        const time = new Date(event.timestamp)
                                        const timeStr = `${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`
                                        
                                        return (
                                          <div
                                            key={event.id}
                                            className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
                                          >
                                            <div
                                              className={`mt-1 h-2 w-2 rounded-full ${
                                                event.type === "attack"
                                                  ? "bg-red-attack"
                                                  : event.type === "defense"
                                                    ? "bg-blue-defense"
                                                    : "bg-muted-foreground"
                                              }`}
                                            />
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-muted-foreground">{timeStr}</span>
                                                <Badge variant="outline" className="text-xs">
                                                  {event.type}
                                                </Badge>
                                                <Badge
                                                  variant="outline"
                                                  className={`text-xs ${
                                                    event.severity === "critical"
                                                      ? "border-destructive text-destructive"
                                                      : event.severity === "high"
                                                        ? "border-orange-500 text-orange-500"
                                                        : "border-muted-foreground text-muted-foreground"
                                                  }`}
                                                >
                                                  {event.severity}
                                                </Badge>
                                              </div>
                                              <p className="text-sm mt-1">{event.description}</p>
                                            </div>
                                          </div>
                                        )
                                      })
                                    )}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Actions */}
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => router.push(`/transcript?matchId=${match.id}`)}
                                >
                                  View Full Transcript
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
