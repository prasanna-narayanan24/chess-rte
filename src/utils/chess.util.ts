export type MoveQuality = 'BRILLIANT' | 'GREAT' | 'EXCELLENT' | 'BEST' | 'NORMAL' | 'MISTAKE' | 'BLUNDER' | 'INACCURACY';

export function classifyMoveQuality(previousEval: number, currentEval: number, turn: 'w' | 'b'): MoveQuality {
  console.log('previousEval :>> ', previousEval);
  console.log('currentEval :>> ', currentEval);
  console.log('turn :>> ', turn);

  const evalChange = (turn === 'w')
    ? currentEval - previousEval  // White's move — did white improve?
    : previousEval - currentEval;  // Black's move — did black improve?

  console.log('evalChange :>> ', evalChange);
  console.log(`-----`);

  if (evalChange >= +2.0) return 'BRILLIANT';    // Huge gain
  if (evalChange >= +1.0) return 'GREAT';         // Strong gain
  if (evalChange >= +0.5) return 'EXCELLENT';     // Moderate gain
  if (evalChange >= -0.1 && evalChange <= +0.1) return 'BEST';  // Engine neutral (optimal move)
  if (evalChange <= -2.0) return 'BLUNDER';       // Catastrophic
  if (evalChange <= -1.0) return 'MISTAKE';       // Bad mistake
  if (evalChange <= -0.5) return 'INACCURACY';    // Minor mistake

  return 'NORMAL'; // Default (for safety)
}