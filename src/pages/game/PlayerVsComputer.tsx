import { Avatar, Box, Button, ButtonGroup, Divider, GridItem, Heading, HStack, Icon, IconButton, Image, Progress, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Arrow, CustomPieces, CustomSquareStyles } from "react-chessboard/dist/chessboard/types";
import { BiCopy, BiDiamond } from "react-icons/bi";
import { Chess, PieceSymbol, Square } from "chess.js";
import { playSound } from "../../utils/sound";
import { GameEndModal } from "../../components/modals/GameEndModal";
import { GameEndType, GameStats, IGameMoveHistory, MoveType } from "../../types/game";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { evaluatePosition, initStockfish, stopStockfish } from "../../stockfish/MStockfish";
import { classifyMoveQuality, MoveQuality } from "../../utils/chess.util";

function PlayerInfo({ username, rating, piecesCaptured = [], playerColor }: { playerColor: 'w' | 'b', username: string, rating: number, piecesCaptured: PieceSymbol[] }) {
  return (
    <HStack px={2} py={1} bg="whiteAlpha.50" borderRadius="md" justify="space-between" w="100%">
      <HStack justifyContent={'flex-start'} alignItems={'center'} spacing={2}>
        <Avatar size="sm" name={username} borderRadius={'md'} color={'black'} bgColor={'orange.400'} />
        <VStack alignItems={'flex-start'} fontSize={'xs'} spacing={0}>
          <HStack>
            <Text fontWeight="bold">{username}</Text>
            <Icon as={BiDiamond} color={'indigo.500'} />
          </HStack>
          <Text color="gray.400">Rating: {rating}</Text>
        </VStack>
      </HStack>

      <HStack spacing={2}>
        {piecesCaptured.map((piece, index) => (
          <Image w={4} h={4} key={`image-piece-captured-${index}`} src={`/pieces/${playerColor}${piece.toUpperCase()}.png`} />
        ))}
      </HStack>
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

const PlayerVsComputerChessGame = ({ playerColor }: { playerColor: 'white' | 'black' }) => {

  const game = useMemo(() => new Chess(), []);

  const isMounted = useRef<boolean>(false);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  const [positions, setPositions] = useState<string>(game.fen());
  const [optionsSquare, setOptionsSquare] = useState<CustomSquareStyles>({});
  const [customArrows, setCustomArrows] = useState<Arrow[]>([]);

  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    isWin: true,
    endType: 'checkmate',
    mistakes: 0,
    blunders: 0,
    missedWins: 0
  });

  const [capturedPieces, setCapturedPieces] = useState<Record<'w' | 'b', PieceSymbol[]>>({
    'w': [],
    'b': []
  });

  const [evaluation, setEvaluation] = useState<number>(0);
  const [moveQuality, setMoveQuality] = useState<MoveQuality>('NORMAL');

  const [moveHistory, setMoveHistory] = useState<IGameMoveHistory[]>([]);

  const [currentPlayer,] = useState<'w' | 'b'>(playerColor === 'white' ? 'w' : 'b');

  // click to move states
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [moveTo, setMoveTo] = useState<Square | null>(null);

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


  const progressValue = useMemo(() => {
    if (evaluation === null) return 50;  // Neutral if no eval yet

    // Scale pawn advantage directly to the bar (use tanh for soft clamping)
    const scaleFactor = .5; // How fast the bar moves for small evals
    const percentage = 50 + (50 * Math.tanh(evaluation * scaleFactor));

    return Math.min(Math.max(percentage, 0), 100);  // Always stays 0 to 100
  }, [evaluation]);

  useEffect(() => {
    // -->
    initStockfish();
    handleGameStart();

    return () => {
      console.log(`<- Stopping engine -->`);
      stopStockfish();
    }
  }, []);

  async function handleGameStart() {
    playSound('/sounds/standard/game-start.mp3', { volume: 0.5 });
  }

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
    evaluatePlayerPosition();

    if (game.isGameOver()) {
      handleGameFinish();
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
    setOptionsSquare({});
  }, [positions]);

  function evaluatePlayerPosition() {
    if (moveHistory.length && game.turn() === 'w') {
      return;
    }

    evaluatePosition(game.fen(), 8, (newEvaluation, _) => {
      setMoveQuality(classifyMoveQuality(evaluation, newEvaluation, 'w'));
      setEvaluation(newEvaluation);
    });
  }

  async function handleGameFinish() {
    let endType: GameEndType = 'checkmate';
    if (game.isDraw()) {
      endType = 'draw';
    } else if (game.isStalemate()) {
      endType = 'stalemate';
    }

    const isPlayerWin = game.turn() !== currentPlayer;

    setGameStats({
      isWin: isPlayerWin,
      endType,
      missedWins: 3,
      mistakes: 4,
      blunders: 5
    });

    setShowVictoryModal(true);

  }

  function makeAMove(move: MoveType) {
    if (game.isGameOver()) {
      console.log(`GAME OVER`);
      return null;
    }

    try {
      const result = game.move(move);
      if (result) {
        if (result.captured) {
          const existingCaptured = capturedPieces[game.turn()] ?? [];

          setCapturedPieces((prev) => ({
            ...prev,
            [game.turn()]: [...existingCaptured, result.captured]
          }))
        }

        setPositions(game.fen());
        resetAfterMove();
      }
      return result;
    } catch (e) {
      console.log('e :>> ', e);
      playSound('/sounds/standard/illegal.mp3', { volume: 0.5 });
      return null;
    }
  }

  function getMoveOptions(square: Square) {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionsSquare({});
      return false;
    }

    const newSquares: CustomSquareStyles = {};
    moves.map((move) => {
      const moveTo = game.get(move.to)!;
      const squareTo = game.get(square)!;

      newSquares[move.to] = {
        background:
          moveTo &&
            moveTo.color !== squareTo.color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setOptionsSquare(newSquares);
    return true;
  }

  function onSquareClick(square: Square) {
    // from square
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    // to square
    if (!moveTo) {
      // check if valid move before showing dialog
      const moves = game.moves({
        square: moveFrom,
        verbose: true,
      });
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square
      );
      // not a valid move
      if (!foundMove) {
        // check if clicked on new piece
        const hasMoveOptions = getMoveOptions(square);
        // if new piece, setMoveFrom, otherwise clear moveFrom
        setMoveFrom(hasMoveOptions ? square : null);
        return;
      }

      // valid move
      setMoveTo(square);

      // if promotion move
      if (
        (foundMove.color === "w" &&
          foundMove.piece === "p" &&
          square[1] === "8") ||
        (foundMove.color === "b" &&
          foundMove.piece === "p" &&
          square[1] === "1")
      ) {
        // setShowPromotionDialog(true);
        return;
      }

      // is normal move
      const move = handlePieceDrop(moveFrom, square, `-${foundMove.piece}`);

      // if invalid, setMoveFrom and getMoveOptions
      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }
      return;
    }
  }
  // function onPromotionPieceSelect(piece: Piece) {
  //   // if no piece passed then user has cancelled dialog, don't make move and reset
  //   if (piece) {
  //     makeAMove({
  //       from: moveFrom!,
  //       to: moveTo!,
  //       promotion: piece[1].toLowerCase() ?? "q",
  //     })
  //   }

  //   resetAfterMove();
  //   return true;
  // }

  function resetAfterMove() {
    setMoveFrom(null);
    setMoveTo(null);

    setCustomArrows([]);
  }

  async function getHint() {
    evaluatePosition(game.fen(), 10, (_, bestMove) => {
      const source = bestMove.slice(0, 2) as Square;
      const target = bestMove.slice(2, 4) as Square;

      setCustomArrows([[source, target, 'green']]);
    });
  }

  function handleNewGame() {
    resetBoard();
  }

  function resetBoard() {
    game.reset();

    setPositions(game.fen());
    setShowVictoryModal(false);
  }

  function compMakeMove() {
    evaluatePosition(game.fen(), 8, (_, bestMove) => {
      const source = bestMove.slice(0, 2);
      const target = bestMove.slice(2, 4);

      makeAMove({
        from: source,
        to: target,
        promotion: "q",
      });
    });
  }

  function handlePieceDrop(source: string, target: string, piece: string) {
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

    setTimeout(compMakeMove, 2000);

    return true;
  }

  return (
    <Box px={{ lg: 4, base: 1 }} w={'100%'} h={'100%'}>
      <SimpleGrid columns={{ base: 1, lg: 12 }} gap={4} my={2} h={'100%'} alignItems={{ base: 'stretch', lg: 'center' }}>
        {/* Sidebar */}
        {/* <GridItem colSpan={2}
          bg="whiteAlpha.50"
          borderRadius="lg"
          px={4}
          py={2}>
          <GameSidebar />
        </GridItem> */}

        {/* Move History */}
        {/* <GridItem colSpan={3} bg="whiteAlpha.50" borderRadius="md" p={4} h={'95vh'}>
          <span>Coming soon...</span>
        </GridItem> */}

        <GridItem display={{ base: 'block', lg: 'none' }} colSpan={{ base: 1, lg: 4 }} bg="whiteAlpha.50" borderRadius="md" p={4}>
          <Heading fontSize={'md'}>Position History</Heading>
          <Divider my={2} />
          <Box>Something smalll</Box>
          {/* <ShowPositionHistory history={moveHistory} /> */}
        </GridItem>

        {/* Game Board */}
        <GridItem
          colSpan={{ base: 1, lg: 5 }}
          bg="whiteAlpha.50"
          borderRadius="lg"
          px={{ lg: 4, base: 1 }}
          py={2}
        // maxW={'85vh'}
        >
          <VStack h={'100%'} align={'stretch'}>

            <HStack w={'100%'} align={'center'} justifyContent={'space-between'}>
              <Progress
                w={'100%'}
                value={progressValue}
                bgColor={'whiteAlpha.100'}
                color={'white'}
                borderRadius="md"
              />

              <Text fontSize={'xs'} color={'white'}>{moveQuality}</Text>

              <Text fontSize={'xs'} color={'white'}>{evaluation}s</Text>
            </HStack>
            <PlayerInfo username={'John Doe'} rating={1500} playerColor={'b'} piecesCaptured={capturedPieces['b']} />

            <Box ref={boardContainerRef}>
              <Chessboard
                customPieces={customPieces}
                position={positions}
                boardOrientation={currentPlayer === 'w' ? 'white' : 'black'}
                onPieceDrop={handlePieceDrop}
                onSquareClick={onSquareClick}
                customArrows={customArrows}
                customSquareStyles={{
                  ...optionsSquare
                }}
                customBoardStyle={{
                  borderRadius: "4px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                }}
              />
            </Box>

            <PlayerInfo username={`playerName`} rating={350} playerColor={'w'} piecesCaptured={capturedPieces['w']} />
            <ButtonGroup>
              <Button onClick={getHint}>Get hint</Button>
            </ButtonGroup>
          </VStack>
        </GridItem>

        <GridItem display={{ base: 'none', lg: 'block' }} colSpan={{ base: 1, lg: 4 }} bg="whiteAlpha.50" borderRadius="md" p={4} h={'95vh'}>
          <Heading fontSize={'md'}>Position History</Heading>
          <Divider my={2} />
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

export default PlayerVsComputerChessGame;
