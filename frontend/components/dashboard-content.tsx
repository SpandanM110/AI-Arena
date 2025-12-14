"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Shield, Swords, Target, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { matchesApi, eventsApi, wsClient, Event, Match } from "@/lib/api"
import { useRouter } from "next/navigation"

export function DashboardContent() {
  const router = useRouter()
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [timelineData, setTimelineData] = useState<Array<{ time: string; attacks: number; defenses: number }>>([])
  const [loading, setLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)

  // Fetch current match and events
  useEffect(() => {
    loadDashboardData()
    
    // Connect WebSocket for real-time updates
    wsClient.connect()
    wsClient.on('event', (event: Event) => {
      setEvents(prev => [event, ...prev].slice(0, 50)) // Keep last 50 events
      updateTimeline([event, ...events])
    })
    wsClient.on('match_update', ({ matchId, data }: { matchId: string; data: any }) => {
      if (currentMatch?.id === matchId) {
        setCurrentMatch({ ...currentMatch, ...data })
        if (data.status === 'complete') {
          setIsRunning(false)
        } else if (data.status === 'running') {
          setIsRunning(true)
        }
      }
    })

    return () => {
      wsClient.off('event', () => {})
      wsClient.off('match_update', () => {})
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [matches, recentEvents] = await Promise.all([
        matchesApi.getAll(1, 0),
        eventsApi.getRecent(50)
      ])
      
      if (matches.length > 0) {
        const match = matches[0]
        setCurrentMatch(match)
        setIsRunning(match.status === 'running')
        
        // Subscribe to this match's events
        wsClient.subscribe(match.id)
        
        // Load events for this match
        const matchEvents = await matchesApi.getEvents(match.id, 100)
        setEvents(matchEvents)
        updateTimeline(matchEvents)
      } else {
        setEvents(recentEvents)
        updateTimeline(recentEvents)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTimeline = (eventList: Event[]) => {
    // Group events by minute and count attacks/defenses
    const grouped = eventList.reduce((acc, event) => {
      const time = new Date(event.timestamp)
      const minute = `${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`
      
      if (!acc[minute]) {
        acc[minute] = { time: minute, attacks: 0, defenses: 0 }
      }
      
      if (event.type === 'attack') acc[minute].attacks++
      if (event.type === 'defense') acc[minute].defenses++
      
      return acc
    }, {} as Record<string, { time: string; attacks: number; defenses: number }>)
    
    const timeline = Object.values(grouped).slice(-10) // Last 10 minutes
    setTimelineData(timeline.length > 0 ? timeline : [
      { time: "00:00", attacks: 0, defenses: 0 }
    ])
  }

  const handleStartMatch = () => {
    router.push('/matches')
  }

  if (loading) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    )
  }

  const attackCount = events.filter(e => e.type === 'attack').length
  const defenseCount = events.filter(e => e.type === 'defense').length
  const defenseRate = attackCount > 0 ? ((defenseCount / attackCount) * 100).toFixed(0) : '0'

  return (
    <main className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Match Dashboard</h1>
          <p className="text-muted-foreground">Real-time cybersecurity simulation</p>
        </div>
        <div className="flex gap-2">
          {currentMatch && currentMatch.status === 'running' && (
            <Button variant="outline" size="sm" onClick={() => matchesApi.pause(currentMatch.id)}>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          {currentMatch && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/matches?replay=${currentMatch.id}`)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Replay Match
            </Button>
          )}
          <Button size="sm" onClick={handleStartMatch}>
            <Play className="mr-2 h-4 w-4" />
            Start New Match
          </Button>
        </div>
      </div>

      {/* Match Status */}
      {currentMatch && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Match {currentMatch.id}</CardTitle>
                <CardDescription>
                  {currentMatch.startedAt 
                    ? `Started ${new Date(currentMatch.startedAt).toLocaleString()}`
                    : 'Not started yet'}
                </CardDescription>
              </div>
              <Badge 
                className={
                  currentMatch.status === 'running' 
                    ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                    : currentMatch.status === 'complete'
                    ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                    : "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
                }
              >
                {currentMatch.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/20">
                  <Swords className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{attackCount}</div>
                  <div className="text-sm text-muted-foreground">Red Attacks</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{defenseCount}</div>
                  <div className="text-sm text-muted-foreground">Blue Defenses</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{defenseRate}%</div>
                  <div className="text-sm text-muted-foreground">Defense Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!currentMatch && (
        <Card className="mb-6">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No active match. Start a new match to begin!</p>
            <Button onClick={handleStartMatch}>
              <Play className="mr-2 h-4 w-4" />
              Start New Match
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attack vs Defense Timeline</CardTitle>
            <CardDescription>Real-time battle progression</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
                <XAxis dataKey="time" stroke="oklch(0.58 0 0)" tick={{ fill: "oklch(0.58 0 0)" }} />
                <YAxis stroke="oklch(0.58 0 0)" tick={{ fill: "oklch(0.58 0 0)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0 0)",
                    border: "1px solid oklch(0.25 0 0)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attacks"
                  stroke="oklch(0.58 0.22 25)"
                  strokeWidth={2}
                  name="Red Attacks"
                />
                <Line
                  type="monotone"
                  dataKey="defenses"
                  stroke="oklch(0.62 0.25 265)"
                  strokeWidth={2}
                  name="Blue Defenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Summary - Simplified for now */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Live Stats</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Events</span>
                <span className="font-medium">{events.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Critical Events</span>
                <span className="font-medium text-destructive">
                  {events.filter(e => e.severity === 'critical').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">High Severity</span>
                <span className="font-medium text-orange-500">
                  {events.filter(e => e.severity === 'high').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Event Feed */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Live Event Feed</CardTitle>
          <CardDescription>Real-time battle events as they happen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No events yet. Start a match to see live events!</p>
            ) : (
              events.slice(0, 20).map((event, index) => {
                const time = new Date(event.timestamp)
                const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`
                
                return (
                  <div
                    key={`${event.id}-${index}-${event.timestamp}`}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
                  >
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full ${
                        event.type === "attack"
                          ? "bg-destructive"
                          : event.type === "defense"
                            ? "bg-primary"
                            : "bg-muted-foreground"
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{timeStr}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.type === "attack"
                            ? "Red Attack"
                            : event.type === "defense"
                              ? "Blue Defense"
                              : "Target Response"}
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
                      <p className="text-sm">{event.description}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
