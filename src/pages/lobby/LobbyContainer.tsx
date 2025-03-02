import React, { useState, useEffect } from 'react';
import { Button, Input, VStack, Heading, Text, HStack, useToast, List, ListItem, Divider } from '@chakra-ui/react';
import { signInAnonymously, supabase } from '../../services/supabase';
import { createGame, joinGame, fetchOpenGames } from '../../services/game.service';
import { User } from '@supabase/supabase-js';

type Game = {
  id: string;
  player1_name?: string;
  status: string;
};

function Lobby({ setGameId, setPlayerName, setCurrentPlayerId, setGameMode }: { setGameMode: (mode: 'friend' | 'computer' | null) => void, setGameId: (id: string) => void, setPlayerName: (name: string) => void, setCurrentPlayerId: (id?: string) => void }) {
  const [name, setName] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const toast = useToast();

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res?.data?.user) {
        setCurrentUser(res.data.user);
      }
    });

    loadOpenGames();
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      setCurrentPlayerId(currentUser.id)
    } else {
      setCurrentPlayerId(undefined);
    }
  }, [currentUser]);

  async function loadOpenGames() {
    const openGames = await fetchOpenGames();
    setGames(openGames);
  }

  async function handleLogin() {
    setLoading(true);
    try {
    const user = await signInAnonymously(name);
    setCurrentUser(user);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.toString(),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGame() {
    const _name = name || currentUser?.user_metadata?.display_name;

    if (!_name) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name before creating a game.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    const user = currentUser;

    try {
      if (!user) {
        toast({
          title: 'Error',
          description: 'User not found',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      localStorage.setItem('playerName', _name);
      localStorage.setItem('playerId', user.id);

      const game = await createGame(user.id);
      setGameMode('friend');

      setPlayerName(_name);
      setGameId(game.id);
    } catch (error: any) {
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }
    }
  }

  async function handleJoinGame(gameId: string) {
    const _name = name || currentUser?.user_metadata?.display_name;

    if (!_name) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name before joining a game.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const user = currentUser;

      localStorage.setItem('playerName', _name);
      localStorage.setItem('playerId', user!.id);

      await joinGame(gameId, user!.id);

      setGameMode('friend');
      setPlayerName(_name);
      setGameId(gameId);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.toString(),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }
  }

  function handlePlayComputer() {
    setGameMode('computer');
  }


  function renderLoggedInComponent() {
    return (
      <React.Fragment>
        <Button
          colorScheme="teal"
          onClick={handleCreateGame}
          isLoading={loading}
          loadingText="Creating..."
          w="full"
        >
          Play a friend
        </Button>

        <Button
          colorScheme="teal"
          onClick={handlePlayComputer}
          isLoading={loading}
          loadingText="Creating..."
          w="full"
        >
          Play vs Computer
        </Button>

        <Divider />

        <Heading size="md">Open Games</Heading>

        {games.length === 0 ? (
          <Text>No open games. Create one to get started!</Text>
        ) : (
          <List spacing={3} w="full">
            {games.map((game) => (
              <ListItem key={game.id}>
                <HStack justify="space-between" bg="gray.900" p={3} rounded="md">
                  <Text>Game {game.id.slice(0, 6)} - Host: {game.player1_name || 'Unknown'}</Text>
                  <Button size="sm" colorScheme="green" onClick={() => handleJoinGame(game.id)} isLoading={loading}>
                    Join
                  </Button>
                </HStack>
              </ListItem>
            ))}
          </List>
        )}
      </React.Fragment>
    );
  }

  function renderLoginComponent() {
    return (
      <React.Fragment>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          bg="gray.900"
          color="gray.100"
        />

        <Button
          colorScheme="teal"
          onClick={handleLogin}
          isLoading={loading}
          loadingText="Creating..."
          w="full"
        >
          Login
        </Button>
      </React.Fragment>
    )
  }

  return (
    <VStack spacing={6} p={8} bg="gray.700" rounded="xl" shadow="lg" maxW="lg" mx="auto" mt={12}>
      <Heading size="lg">Welcome to Chess Lobby {currentUser?.id ? `- ${currentUser?.user_metadata?.display_name ?? ''}` : ''}</Heading>

      {!currentUser ? renderLoginComponent() : (renderLoggedInComponent())}
    </VStack>
  );
}

export default Lobby;
