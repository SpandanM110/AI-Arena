---
title: Scoring System
description: Evaluation and scoring algorithms
---

# Scoring System

The scoring system evaluates each round of a match to determine winners and track performance.

## Scoring Algorithm

### Attack Score

The attack score is calculated based on:

- **Success**: 10 points for successful attack
- **Partial**: 5 points for partially successful attack
- **Blocked**: 0 points for blocked attack
- **Severity Multiplier**: 
  - Low: 1.0x
  - Medium: 1.5x
  - High: 1.75x
  - Critical: 2.0x

### Defense Score

The defense score is calculated based on:

- **Successful Defense**: 10 points
- **Partial Defense**: 5 points
- **Failed Defense**: 0 points
- **Confidence Bonus**: Up to 5 points based on confidence level

### Round Winner

- **Red Wins**: If attack succeeded and defense failed
- **Blue Wins**: If attack was blocked or mitigated
- **Draw**: If both partially succeeded/failed

## Score Calculation

```typescript
function calculateRoundScore(attack: AttackEvent, defense: DefenseEvent): RoundScore {
  const attackScore = calculateAttackScore(attack);
  const defenseScore = calculateDefenseScore(defense);
  
  let winner: 'red' | 'blue' | 'draw';
  if (attackScore > defenseScore) {
    winner = 'red';
  } else if (defenseScore > attackScore) {
    winner = 'blue';
  } else {
    winner = 'draw';
  }
  
  return {
    red: attackScore,
    blue: defenseScore,
    winner
  };
}
```

## Match Score

The match score is the sum of all round scores:

```typescript
const matchScore = {
  red: rounds.reduce((sum, r) => sum + r.score.red, 0),
  blue: rounds.reduce((sum, r) => sum + r.score.blue, 0),
  winner: matchScore.red > matchScore.blue ? 'red' : 
          matchScore.blue > matchScore.red ? 'blue' : 'draw'
};
```

## Next Steps

- [Orchestration](/backend/orchestration/) - How matches are executed
- [Running Matches](/guides/running-matches/) - Understanding match results
