---
title: Running Matches
description: Guide to running matches in the AI Arena
---

# Running Matches

Complete guide to running matches and understanding results.

## Match Overview

A match is a simulation where:
- **Red Agent** attacks the target
- **Target Agent** responds to attacks
- **Blue Agent** defends and suggests patches
- **Scoring System** evaluates each round

## Match Modes

### Quick Mode
- **Rounds**: 5
- **Delay**: 1 second
- **Duration**: ~10 seconds
- **Use Case**: Fast vulnerability scan

### Standard Mode
- **Rounds**: 10
- **Delay**: 2 seconds
- **Duration**: ~30 seconds
- **Use Case**: Standard adversarial testing

### Deep Mode
- **Rounds**: 20
- **Delay**: 3 seconds
- **Duration**: ~2 minutes
- **Use Case**: Comprehensive analysis

### Continuous Mode
- **Rounds**: Unlimited
- **Delay**: 5 seconds
- **Duration**: Until stopped
- **Use Case**: Long-running monitoring

## Creating a Match

### Via API

```bash
curl -X POST http://localhost:3001/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "redAgentId": "agent-uuid",
    "blueAgentId": "agent-uuid",
    "targetAgentId": "agent-uuid",
    "mode": "standard"
  }'
```

### Via UI

1. Navigate to **Matches** page
2. Click **Create Match**
3. Select agents:
   - **Red Agent**: Attacker
   - **Blue Agent**: Defender
   - **Target Agent**: Agent under test
4. Choose **Mode**: quick, standard, deep, or continuous
5. Click **Start Match**

## Match Execution

### Round Flow

Each round follows this flow:

1. **Red Attack**: Red agent generates attack
2. **Target Response**: Target processes attack
3. **Blue Defense**: Blue agent analyzes and defends
4. **Scoring**: Round is scored
5. **Event Creation**: Events are logged
6. **WebSocket Broadcast**: Updates sent to subscribers

### Real-Time Monitoring

Subscribe to match events via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3002');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'event') {
    console.log('New event:', data.data);
  } else if (data.type === 'match_update') {
    console.log('Match update:', data.data);
  }
};

// Subscribe to match
ws.send(JSON.stringify({
  type: 'subscribe',
  matchId: 'AR-2024-0142'
}));
```

## Match Control

### Pause Match

```bash
curl -X POST http://localhost:3001/api/matches/AR-2024-0142/pause
```

Pauses the match after current round completes.

### Resume Match

```bash
curl -X POST http://localhost:3001/api/matches/AR-2024-0142/resume
```

Resumes a paused match.

### Stop Match

```bash
curl -X POST http://localhost:3001/api/matches/AR-2024-0142/stop
```

Stops the match immediately.

## Understanding Results

### Match Score

```json
{
  "red": 75,
  "blue": 85,
  "winner": "blue"
}
```

- **Red Score**: Attack success rate
- **Blue Score**: Defense success rate
- **Winner**: Agent with higher score

### Round Scores

Each round is scored:
- **Attack Success**: 0-10 points
- **Defense Success**: 0-10 points
- **Severity Multiplier**: 1.0x - 2.0x

### Events

Events show what happened:

- **Attack Events**: Red agent attacks
- **Defense Events**: Blue agent defenses
- **Target Response Events**: Target agent responses
- **Tool Execution Events**: Tool calls and results

## Analyzing Results

### View Match Details

```bash
curl http://localhost:3001/api/matches/AR-2024-0142
```

### View Match Events

```bash
curl http://localhost:3001/api/matches/AR-2024-0142/events
```

### View Match Transcript

```bash
curl http://localhost:3001/api/matches/AR-2024-0142/transcript
```

## Best Practices

### Agent Selection

1. **Match Capabilities**: Use appropriate models
2. **Balance Teams**: Similar capability levels
3. **Test Variations**: Try different agent combinations

### Match Configuration

1. **Start Small**: Use quick mode for testing
2. **Scale Up**: Use standard/deep for analysis
3. **Monitor Real-Time**: Watch WebSocket events
4. **Review Results**: Analyze transcripts

### Iterative Improvement

1. **Run Match**: Execute simulation
2. **Analyze Results**: Review scores and events
3. **Refine Agents**: Update system prompts
4. **Re-run**: Test improvements

## Troubleshooting

### Match Not Starting

- Check agent IDs are valid
- Verify agents exist
- Check backend logs

### Match Stuck

- Check WebSocket connection
- Review backend logs
- Try stopping and restarting

### Low Scores

- Review agent system prompts
- Check model selection
- Analyze event details

## Next Steps

- [Creating Agents](/guides/creating-agents/) - Create better agents
- [Scoring System](/backend/scoring/) - Understand scoring
- [API Reference](/api/matches/) - Complete API docs
