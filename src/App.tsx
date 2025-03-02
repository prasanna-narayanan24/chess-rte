import { useEffect, useState } from 'react';
import { Box, useColorMode } from '@chakra-ui/react';
import Lobby from './pages/lobby/LobbyContainer';
import ChessGame from './pages/game/ChessGame';
import PlayerVsComputerChessGame from './pages/game/PlayerVsComputer';

function App() {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode('dark');
  }, [])

  const [gameId, setGameId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | undefined>(undefined);

  const [gameMode, setGameMode] = useState<'friend' | 'computer' | null>(null);

  function renderGame() {
    if (gameMode === 'friend') {
      if (gameId && currentPlayerId) {
        return <ChessGame gameId={gameId} playerName={playerName!} currentPlayerId={currentPlayerId} />;
      }
    } else if (gameMode === 'computer') {
      return <PlayerVsComputerChessGame playerColor="white" />
    } else if (gameMode === null)  {
      return <Lobby setGameId={setGameId} setGameMode={setGameMode} setPlayerName={setPlayerName} setCurrentPlayerId={setCurrentPlayerId} />
    }
  }

  return (
    <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
      {renderGame()}
    </Box>
  );
}

export default App;
