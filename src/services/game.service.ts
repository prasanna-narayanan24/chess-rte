import { supabase } from './supabase';

// Create a new game (Player 1 starts)
export async function createGame(player1_id: string, timeControl = 'blitz') {
    const { data, error } = await supabase
        .from('games')
        .insert([{ player1_id, time_control: timeControl }])
        .select();

    if (error) throw error;
    localStorage.setItem(`@/chess-fe/player-color`, 'white');
    return data?.[0];
}

// Join an existing game (Player 2 joins)
export async function joinGame(gameId: string, player2_id: string) {
    const { data, error } = await supabase
        .from('games')
        .update({ player2_id, status: 'in_progress' })
        .eq('id', gameId)
        .select();
    if (error) throw error;

    localStorage.setItem(`@/chess-fe/player-color`, 'black');
    return data?.[0];
}

// Fetch available games to join
export async function fetchOpenGames() {
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'waiting');
    if (error) throw error;
    return data;
}

// Add move to a game
export async function addMove(gameId: string, playerId: string, move: { from: string; to: string; piece: string }) {
    const { data, error } = await supabase
        .from('moves')
        .insert([{
            game_id: gameId,
            player_id: playerId,
            move_number: (await countMoves(gameId)) + 1,
            from_square: move.from,
            to_square: move.to,
            piece: move.piece
        }]);
    if (error) throw error;
    return data;
}

// Get all moves for replay
export async function fetchMoves(gameId: string) {
    const { data, error } = await supabase
        .from('moves')
        .select('*')
        .eq('game_id', gameId)
        .order('move_number');
    if (error) throw error;
    return data;
}

// Internal helper: count moves in a game
async function countMoves(gameId: string): Promise<number> {
    const { count, error } = await supabase
        .from('moves')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', gameId);
    if (error) throw error;
    return count || 0;
}

// Update game result after checkmate/draw
export async function finishGame(gameId: string, winner: string | null, result: string) {
    const { error } = await supabase
        .from('games')
        .update({
            status: 'finished',
            winner,
            result
        })
        .eq('id', gameId);
    if (error) throw error;
}
