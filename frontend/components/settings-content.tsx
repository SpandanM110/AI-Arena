"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Upload, Save, AlertTriangle, Trash2, RefreshCw } from "lucide-react"

export function SettingsContent() {
  const [rounds, setRounds] = useState("10")
  const [allowedTools, setAllowedTools] = useState(true)
  const [sandboxPermissions, setSandboxPermissions] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  return (
    <main className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-balance">Settings & Configuration</h1>
        <p className="text-muted-foreground">Configure arena rules and manage agents</p>
      </div>

      <Tabs defaultValue="match" className="space-y-6">
        <TabsList>
          <TabsTrigger value="match">Match Rules</TabsTrigger>
          <TabsTrigger value="agents">Agent Management</TabsTrigger>
          <TabsTrigger value="models">Model Configuration</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* Match Rules Tab */}
        <TabsContent value="match" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Configuration</CardTitle>
              <CardDescription>Configure simulation parameters and battle rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rounds">Number of Rounds</Label>
                <Input
                  id="rounds"
                  type="number"
                  value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground">Maximum number of attack/defense rounds per match</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Round Timeout (seconds)</Label>
                <Input id="timeout" type="number" defaultValue="30" placeholder="30" />
                <p className="text-xs text-muted-foreground">Maximum time allowed per round before timeout</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity-threshold">Severity Threshold</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="severity-threshold">
                    <SelectValue placeholder="Select threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Score &gt; 3.0)</SelectItem>
                    <SelectItem value="medium">Medium (Score &gt; 5.0)</SelectItem>
                    <SelectItem value="high">High (Score &gt; 7.0)</SelectItem>
                    <SelectItem value="critical">Critical (Score &gt; 9.0)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Minimum severity score to trigger alerts</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="allowed-tools">Allow Tool Usage</Label>
                  <p className="text-xs text-muted-foreground">Enable agents to use external tools and APIs</p>
                </div>
                <Switch id="allowed-tools" checked={allowedTools} onCheckedChange={setAllowedTools} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="sandbox">Sandbox Permissions</Label>
                  <p className="text-xs text-muted-foreground">Run agents in isolated sandbox environment</p>
                </div>
                <Switch id="sandbox" checked={sandboxPermissions} onCheckedChange={setSandboxPermissions} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto-Save Transcripts</Label>
                  <p className="text-xs text-muted-foreground">Automatically save match transcripts after completion</p>
                </div>
                <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Match Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Management Tab */}
        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Custom Target Agent</CardTitle>
              <CardDescription>Deploy your own AI model as the target system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input type="file" accept=".json,.yaml,.yml" className="flex-1" />
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Agent
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: JSON, YAML. Must include model configuration and system prompt.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Oumi Fine-Tuning Integration</CardTitle>
              <CardDescription>Connect fine-tuned models from Oumi platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oumi-api-key">Oumi API Key</Label>
                <Input id="oumi-api-key" type="password" placeholder="oumi_xxxxxxxxxxxxx" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oumi-model-id">Fine-Tuned Model ID</Label>
                <Input id="oumi-model-id" placeholder="ft-model-12345" />
              </div>

              <Button>Connect Oumi Model</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Permissions</CardTitle>
              <CardDescription>Configure tool access and capability permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm">Prompt Manipulation</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm">Context Exploitation</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm">Multi-Turn Attacks</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm">Tool Chaining</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm">Advanced Exploits</span>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Configuration Tab */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Allowed Agent Models</CardTitle>
              <CardDescription>Select which AI models can be used in the arena</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="font-medium">GPT-4 Turbo</div>
                  <p className="text-xs text-muted-foreground">OpenAI • High performance</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="font-medium">GPT-4o</div>
                  <p className="text-xs text-muted-foreground">OpenAI • Multimodal</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="font-medium">Claude 3 Opus</div>
                  <p className="text-xs text-muted-foreground">Anthropic • Advanced reasoning</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="font-medium">Claude 3.5 Sonnet</div>
                  <p className="text-xs text-muted-foreground">Anthropic • Balanced</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="font-medium">Llama 3 70B</div>
                  <p className="text-xs text-muted-foreground">Meta • Open source</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="font-medium">Gemini Pro</div>
                  <p className="text-xs text-muted-foreground">Google • Fast inference</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Parameters</CardTitle>
              <CardDescription>Configure default model parameters for all agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input id="temperature" type="number" step="0.1" defaultValue="0.7" placeholder="0.7" />
                <p className="text-xs text-muted-foreground">Controls randomness (0.0 - 2.0)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <Input id="max-tokens" type="number" defaultValue="2048" placeholder="2048" />
                <p className="text-xs text-muted-foreground">Maximum response length</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="top-p">Top P</Label>
                <Input id="top-p" type="number" step="0.1" defaultValue="0.9" placeholder="0.9" />
                <p className="text-xs text-muted-foreground">Nucleus sampling threshold (0.0 - 1.0)</p>
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Parameters
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions that affect your entire arena</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <h3 className="mb-2 font-medium">Reset All Match History</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Permanently delete all match records, transcripts, and analytics data. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Match History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all match history, transcripts, and analytics. This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <h3 className="mb-2 font-medium">Reset All Agents</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Remove all custom agents and reset to default configuration. Built-in agents will be preserved.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset Agents
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset all agents?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all custom agents and configurations. Default agents will be restored.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Reset Agents
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <h3 className="mb-2 font-medium">Reset Entire Arena</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Complete reset of the entire platform including all matches, agents, and settings. This is the nuclear
                  option.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Reset Everything
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset entire arena?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete ALL data including matches, agents, configurations, and analytics.
                        This action cannot be undone and will reset the platform to its initial state.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Reset Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
