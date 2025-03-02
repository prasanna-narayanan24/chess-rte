import { supabase } from './supabase';

// Subscribe to game state changes (status, winner, etc.)
export function subscribeToGame(gameId: string, callback: (game: any) => void) {
    const channel = supabase.channel(`game_${gameId}`)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'games',
            filter: `id=eq.${gameId}`
        }, (payload) => {
            callback(payload.new);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// Subscribe to new moves
export function subscribeToMoves(gameId: string, callback: (move: any) => void) {
    const channel = supabase.channel(`moves_${gameId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'moves',
            filter: `game_id=eq.${gameId}`
        }, (payload) => {
            callback(payload.new);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}