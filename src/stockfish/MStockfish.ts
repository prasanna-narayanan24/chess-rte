let stockfish: Worker | null = null;

export function initStockfish() {
    if (!stockfish) {
        stockfish = new Worker('/stockfish.wasm.js');  // <- Load from your public folder
        stockfish.postMessage('ucinewgame');
        console.log(`--> Stockfish initialised >--`);
    }
}

export function evaluatePosition(fen: string, depth: number, callback: (evaluation: number, bestMove: string) => void) {
    if (!stockfish) return;

    stockfish.postMessage(`position fen ${fen}`);
    stockfish.postMessage(`go depth ${depth}`);

    let evaluation = 0;

    stockfish.onmessage = (e) => {
        const message = e.data;

        if (message.startsWith('info depth')) {
            const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
            if (scoreMatch) {
                const type = scoreMatch[1];
                const value = parseInt(scoreMatch[2], 10);

                if (type === 'cp') {
                    evaluation = value / 100;
                } else if (type === 'mate') {
                    evaluation = value > 0 ? 100 : -100;
                }
            }
        }

        if (message.startsWith('bestmove')) {
            const bestMove = message.split(' ')[1];
            callback(evaluation, bestMove);
        }
    };
}

export function stopStockfish() {
    if (stockfish) {
        stockfish.terminate();
        stockfish = null;

        console.log(`StockFish terminated..!`);
    }
}
