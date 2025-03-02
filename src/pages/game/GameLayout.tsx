import { Avatar, Box, Button, ButtonGroup, Center, Divider, GridItem, Heading, HStack, Icon, IconButton, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { CustomPieces, Piece } from "react-chessboard/dist/chessboard/types";
import { BiBulb, BiCopy, BiDiamond } from "react-icons/bi";
import { CiSettings } from "react-icons/ci";
import { FaChessBoard } from "react-icons/fa";
import { SiStudyverse } from "react-icons/si";
import { Header } from "../../components/layout/Header";
import { Chess } from "chess.js";
import { playSound } from "../../utils/sound";
import { GameEndModal } from "../../components/modals/GameEndModal";
import { GameEndType, GameStats, IGameMoveHistory, MoveType } from "../../types/game";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { CgFlag } from "react-icons/cg";
// import Engine from "../../stockfish/engine";
// import { stockfish } from "stockfish";

function GameSidebar() {
  return (
    <VStack align={'stretch'} spacing={2} h={'100%'}>
      <Header gameMode={'play'} onGameModeChange={() => { }} />

      <Divider />

      <Button variant="ghost" justifyContent="flex-start" leftIcon={<FaChessBoard />}>Play</Button>
      <Button variant="ghost" justifyContent="flex-start" leftIcon={<SiStudyverse />}>Learn</Button>
      <Button variant="ghost" justifyContent="flex-start" leftIcon={<CiSettings />}>Settings</Button>

    </VStack>
  );
}

function PlayerInfo({ username, rating, isReversed }: { username: string, rating: number, isReversed?: boolean }) {
  return (
    <HStack py={1} px={2} bg="whiteAlpha.50" borderRadius="md" justify={isReversed ? "flex-end" : "flex-start"} w="100%">
      {!isReversed && <Avatar size="sm" name={username} borderRadius={'md'} color={'black'} bgColor={'orange.400'} />}
      <VStack alignItems={isReversed ? 'flex-end' : 'flex-start'} fontSize={'xs'} spacing={0}>
        <HStack>
          <Text fontWeight="bold">{username}</Text>
          <Icon as={BiDiamond} color={'indigo.500'} />
        </HStack>
        <Text color="gray.400">Rating: {rating}</Text>
      </VStack>
      {isReversed && <Avatar size="sm" name={username} borderRadius={'md'} color={'black'} bgColor={'orange.400'} />}
    </HStack>
  );
}

function ShowPositionHistory({ history }: { history: IGameMoveHistory[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <VStack
      ref={containerRef}
      spacing={2}
      alignItems={'flex-start'}
      overflow={'scroll'}
      h={'95%'}
    >
      {history.map((move, index) => (
        <HStack justifyContent={'space-between'} w={'100%'} fontSize={'sm'} key={`history-${index}`} px={4} py={1} bg="whiteAlpha.50" borderRadius="md">
          <Text>{move.moveNumber}</Text>
          <Text>{move.white}</Text>
          <Text>{move.black}</Text>

          <ButtonGroup size={'sm'}>
            <IconButton
              aria-label="Copy"
              icon={<BiCopy />}
            />
            <IconButton
              aria-label="Next move"
              icon={<ArrowForwardIcon />}
            />
          </ButtonGroup>
        </HStack>
      ))}
    </VStack>
  );
}

const GameLayout = () => {
  // const engine = useMemo(() => new Engine(), []);
  const game = useMemo(() => new Chess(), []);

  // const cpuBestMoveRef = useRef<string | null>(null);

  const isMounted = useRef<boolean>(false);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  const [positions, setPositions] = useState<string>(game.fen());

  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    isWin: true,
    endType: 'checkmate',
    mistakes: 0,
    blunders: 0,
    missedWins: 0
  });

  const [moveHistory, setMoveHistory] = useState<IGameMoveHistory[]>([]);

  const [currentPlayer,] = useState<'w' | 'b'>('w');

  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"] as const;
  const customPieces = useMemo(() => {
    const pieceComponents: CustomPieces = {};

    pieces.forEach((piece) => {
      pieceComponents[piece] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(/pieces/${piece}.png)`,
            backgroundSize: "100%",
          }}
        />
      );
    });
    return pieceComponents;
  }, [pieces]);

  useEffect(() => {
    // -->
    return () => {
      console.log(`<- Stopping engine -->`);
      // engine.stop();
    }
  }, []);

  // Sound effects for moves
  useEffect(() => {
    if (!isMounted.current) {
      setTimeout(() => {
        isMounted.current = true;
      }, 1000);
    } else {
      const history = game.history({ verbose: true });
      if (history.length === 0) return;

      const lastMove = history[history.length - 1];

      const isCastle = lastMove.isKingsideCastle() || lastMove.isQueensideCastle();

      if (game.isCheck()) {
        playSound('/sounds/standard/move-check.mp3', { volume: 0.5 });
      } else if (lastMove.isCapture()) {
        playSound('/sounds/standard/capture.mp3', { volume: 0.5 });
      } else if (isCastle) {
        playSound('/sounds/standard/castle.mp3', { volume: 0.5 });
      } else if (game.turn() === currentPlayer) {
        playSound('/sounds/standard/move-self.mp3', { volume: 0.5 });
      } else {
        playSound('/sounds/standard/move-opponent.mp3', { volume: 0.5 });
      }

      if (game.isGameOver()) {
        return;
      }
    }
  }, [positions, currentPlayer]);

  useEffect(() => {
    if (game.isGameOver()) {

      let endType: GameEndType = 'checkmate';
      if (game.isDraw()) {
        endType = 'draw';
      } else if (game.isStalemate()) {
        endType = 'stalemate';
      }

      setGameStats({
        isWin: game.turn() !== currentPlayer,
        endType,
        missedWins: 3,
        mistakes: 4,
        blunders: 5
      });


      setShowVictoryModal(true);
    }
  }, [positions]);

  // Update history
  useEffect(() => {
    if (!isMounted.current) return;

    // Update move history
    const history = game.history({ verbose: true });
    const formattedHistory: IGameMoveHistory[] = [];
    for (let i = 0; i < history.length; i += 2) {
      formattedHistory.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: history[i].san,
        black: history[i + 1]?.san || '',
        fen: game.fen(),
        metadata: history[i],
      });
    }

    setMoveHistory(formattedHistory);
  }, [positions])

  function makeAMove(move: MoveType) {
    if (game.isGameOver()) {
      console.log(`GAME OVER`);
      return null;
    }

    try {
      const result = game.move(move, { strict: true });
      if (result) {
        setPositions(game.fen());
      }
      return result;
    } catch (e) {
      console.log('game.pgn() :>> ', game.pgn());
      playSound('/sounds/standard/illegal.mp3', { volume: 0.5 });
      return null;
    }
  }

  async function compMakeMove() {
    const before = game.fen();

    // https://stockfish.online/api/s/v2.php?fen=rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR%20b%20KQkq%20-%200%201&depth=12
    const STOCKFISH_URL = `https://stockfish.online/api/s/v2.php?fen=${before}&depth=2`;
    const res = await fetch(STOCKFISH_URL);
    const data = await res.json();

    if (data.success) {
      const { bestmove: _bestMove } = data;

      const bestMove = _bestMove.split(' ')[1];

      makeAMove({
        from: bestMove.slice(0, 2),
        to: bestMove.slice(2, 4),
        promotion: "q",
      });

      const after = game.fen();

      if (before !== after) {
        console.log('after :>> ', after);
      }
    }


    // engine.evaluatePosition(game.fen(), 2);

    // engine.onMessage((res) => {
    //   console.log('res :>> ', res);
    //   const { bestMove } = res;

    //   if (bestMove) {
    //     if (cpuBestMoveRef.current === bestMove) return;

    //     cpuBestMoveRef.current = bestMove;
    //     setTimeout(() => {
    //       makeAMove({
    //         from: bestMove.slice(0, 2),
    //         to: bestMove.slice(2, 4),
    //         promotion: "q",
    //       });
    //     }, 500);
    //   }
    // });
  }

  function handleNewGame() {
    resetBoard();
  }

  function resetBoard() {
    game.reset();

    setPositions(game.fen());
    setShowVictoryModal(false);
  }

  function handlePieceDrop(source: string, target: string, piece: Piece) {
    console.log('game :>> ', game);
    console.log('game.is :>> ', game.isStalemate());
    console.log('game.is :>> ', game.isInsufficientMaterial());
    console.log('game.isDraw() :>> ', game.isDraw());
    console.log('isCheckmate() :>> ', game.isCheckmate());
    console.log('game.isGameOver() :>> ', game.isGameOver());
    console.log('game.moves(); :>> ', game.moves());
    console.log(`0---`);
    console.log('currentPlayer :>> ', currentPlayer);
    console.log('game.turn() :>> ', game.turn());

    if (game.turn() !== currentPlayer) return false;

    const promotion = piece[1].toLowerCase() ?? "q";

    const gameMove: MoveType = {
      from: source,
      to: target,
      promotion,
    };
    const moveResult = makeAMove(gameMove);

    if (moveResult === null) {
      // ILLEGAL MOVE;
      return false;
    }

    setTimeout(compMakeMove, 200);

    return true;
  }

  return (
    <Box px={4}>
      <SimpleGrid columns={12} gap={4} my={2} >
        {/* Sidebar */}
        <GridItem colSpan={2}
          bg="whiteAlpha.50"
          borderRadius="lg"
          px={4}
          py={2}>
          <GameSidebar />
        </GridItem>

        {/* Game Board */}
        <GridItem
          colSpan={6}
          bg="whiteAlpha.50"
          borderRadius="lg"
          px={4}
          py={2}

        // maxW={'85vh'}
        >
          <VStack align={'stretch'} position={'relative'} >
            <PlayerInfo username={'John Doe'} rating={1500} />

            <Center maxW={'82vh'} ref={boardContainerRef}>
              <Chessboard
                customPieces={customPieces}
                position={positions}
                boardOrientation={currentPlayer === 'w' ? 'white' : 'black'}
                onPieceDrop={handlePieceDrop}
                customBoardStyle={{
                  borderRadius: "4px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                }}
              />
            </Center>

            <PlayerInfo username={'FrozenSkrullz'} rating={350} />


            <VStack top={16} right={0} position={'absolute'} align={'stretch'}>
              <HStack >
                <IconButton
                  px={5}
                  aria-label="Back"
                  icon={<ArrowBackIcon />}
                />

                <IconButton
                  px={5}
                  aria-label="Forward"
                  icon={<ArrowForwardIcon />}
                />
              </HStack>

              <Button colorScheme="green" leftIcon={<BiBulb />} size={'md'}></Button>
              <Button bgColor="red.600" leftIcon={<CgFlag />} size={'md'}></Button>
            </VStack>
          </VStack>
        </GridItem>

        <GridItem colSpan={2} bg="whiteAlpha.50" borderRadius="md" p={4} maxH={'95vh'}>
          <Heading fontSize={'md'}>Position History</Heading>
          <Divider my={2} />
          <ShowPositionHistory history={moveHistory} />
        </GridItem>

        {/* Move History */}
        <GridItem colSpan={2} bg="whiteAlpha.50" borderRadius="md" p={4} maxH={'95vh'}>
          <ShowPositionHistory history={moveHistory} />
        </GridItem>
      </SimpleGrid>


      <GameEndModal
        isOpen={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        onNewGame={handleNewGame}
        onRematch={handleNewGame}
        stats={gameStats}
      />
    </Box>
  );
}

export default GameLayout;
