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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, RefreshCw, Sparkles, Shield, Swords, Target, Loader2, Plus } from "lucide-react"
import { agentsApi, Agent, modelsApi, GroqModel } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function AgentsContent() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [models, setModels] = useState<GroqModel[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'red' as 'red' | 'blue' | 'target',
    model: '',
    systemPrompt: '',
  })

  useEffect(() => {
    loadAgents()
    loadModels()
  }, [])

  const loadAgents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await agentsApi.getAll()
      setAgents(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load agents')
      console.error('Failed to load agents:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadModels = async (type?: 'red' | 'blue' | 'target') => {
    try {
      const data = await modelsApi.getAll(type)
      setModels(data.recommended || data.models)
      // Auto-select first recommended model if none selected
      if (!createForm.model && data.recommended && data.recommended.length > 0) {
        setCreateForm(prev => ({ ...prev, model: data.recommended[0].id }))
      }
    } catch (err: any) {
      console.error('Failed to load models:', err)
    }
  }

  const handleCreateAgent = async () => {
    try {
      if (!createForm.name || !createForm.model || !createForm.systemPrompt) {
        alert("Please fill in all required fields")
        return
      }

      const newAgent = await agentsApi.create({
        name: createForm.name,
        type: createForm.type,
        model: createForm.model,
        systemPrompt: createForm.systemPrompt,
        permissions: [],
        version: '1.0.0',
      })

      alert(`Agent "${newAgent.name}" created successfully!`)

      setShowCreateDialog(false)
      setCreateForm({ name: '', type: 'red', model: '', systemPrompt: '' })
      loadAgents()
    } catch (err: any) {
      alert(`Error: ${err.message || 'Failed to create agent'}`)
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadAgents}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Agent Management</h1>
          <p className="text-muted-foreground">Configure and monitor AI agents in the arena</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  Create a new agent with a specific model and configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Agent Name</Label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Advanced Red Agent"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agent Type</Label>
                  <Select
                    value={createForm.type}
                    onValueChange={(value: 'red' | 'blue' | 'target') => {
                      setCreateForm(prev => ({ ...prev, type: value, model: '' }))
                      loadModels(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">Red Team (Attacker)</SelectItem>
                      <SelectItem value="blue">Blue Team (Defender)</SelectItem>
                      <SelectItem value="target">Target System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select
                    value={createForm.model}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, model: value }))}
                    onOpenChange={(open) => {
                      if (open && models.length === 0) {
                        loadModels(createForm.type)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model">
                        {models.find(m => m.id === createForm.model)?.name || 'Select a model'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{model.id}</span>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                            <span className="text-xs text-muted-foreground">
                              Tier: {model.tier} • Context: {model.contextWindow.toLocaleString()} tokens
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createForm.model && (
                    <div className="text-xs text-muted-foreground mt-1 p-2 bg-secondary rounded">
                      <strong>Model ID:</strong> <code className="font-mono">{createForm.model}</code>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea
                    value={createForm.systemPrompt}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    placeholder="Enter the system prompt for this agent..."
                    rows={6}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAgent}>
                    Create Agent
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Fine-Tune with Oumi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fine-Tune Agent with Oumi</DialogTitle>
                <DialogDescription>
                  Fine-tune an agent using match data via Oumi platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Agent to Fine-Tune</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} ({agent.type}) - {agent.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Training Matches</Label>
                  <Input type="number" placeholder="50" defaultValue="50" />
                  <p className="text-xs text-muted-foreground">
                    Number of recent matches to use for training
                  </p>
                </div>
                <Button className="w-full">
                  Start Fine-Tuning Job
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Agents</CardTitle>
              <CardDescription>Manage red team, blue team, and target agents</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadAgents}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agents found. Create agents via API or seed script.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>System Prompt</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          agent.type === "red"
                            ? "border-red-attack text-red-attack"
                            : agent.type === "blue"
                              ? "border-blue-defense text-blue-defense"
                              : "border-target-neutral text-target-neutral"
                        }
                      >
                        {agent.type === "red" && <Swords className="mr-1 h-3 w-3" />}
                        {agent.type === "blue" && <Shield className="mr-1 h-3 w-3" />}
                        {agent.type === "target" && <Target className="mr-1 h-3 w-3" />}
                        {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{agent.model}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{agent.version}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                        {agent.systemPrompt}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {agent.permissions.slice(0, 2).map((perm, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {agent.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedAgent(agent)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {agent.type === "red" && <Swords className="h-5 w-5 text-red-attack" />}
                              {agent.type === "blue" && <Shield className="h-5 w-5 text-blue-defense" />}
                              {agent.type === "target" && <Target className="h-5 w-5 text-target-neutral" />}
                              {agent.name}
                            </DialogTitle>
                            <DialogDescription>
                              {agent.model} • {agent.version}
                            </DialogDescription>
                          </DialogHeader>

                          <Tabs defaultValue="overview" className="mt-4">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="prompt">System Prompt</TabsTrigger>
                              <TabsTrigger value="permissions">Permissions</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Agent Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">ID</span>
                                      <span className="font-mono text-xs">{agent.id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Type</span>
                                      <span className="font-medium capitalize">{agent.type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Model</span>
                                      <span className="font-mono text-sm">{agent.model}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Version</span>
                                      <span className="font-medium">{agent.version}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Created</span>
                                      <span className="text-xs">
                                        {new Date(agent.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Metadata</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <pre className="text-xs bg-secondary p-3 rounded-md overflow-auto">
                                      {JSON.stringify(agent.metadata || {}, null, 2)}
                                    </pre>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>

                            <TabsContent value="prompt">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="rounded-md bg-secondary p-4">
                                    <code className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                      {agent.systemPrompt}
                                    </code>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>

                            <TabsContent value="permissions">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="space-y-2">
                                    {agent.permissions.length === 0 ? (
                                      <p className="text-muted-foreground text-sm">No permissions configured</p>
                                    ) : (
                                      agent.permissions.map((permission, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
                                        >
                                          <div className="h-2 w-2 rounded-full bg-green-500" />
                                          <span className="font-mono text-sm">{permission}</span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
