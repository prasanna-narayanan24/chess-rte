export type GameMode = 'learning' | 'play';

export interface GameState {
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  turn: 'w' | 'b';
  gamePhase: 'opening' | 'middlegame' | 'endgame';
}

export interface MoveData {
  from: string;
  to: string;
  piece: string;
  san: string; // Standard algebraic notation
  annotation?: string;
}

export interface PositionEvaluation {
  score: number; // positive for white advantage, negative for black
  bestMove?: string;
  threats?: string[];
  opportunities?: string[];
}


export type GameEndType = 'checkmate' | 'resignation' | 'stalemate' | 'timeout' | 'draw'
export type MoveType = string | { from: string, to: string, promotion?: string };
export type GameStats = {
  isWin: boolean,
  mistakes: number;
  blunders: number;
  missedWins: number;
  endType: GameEndType
}

export interface IGameMoveHistory {
  moveNumber: number;
  white: string;
  black: string;
  fen: string;
  metadata: any;
}