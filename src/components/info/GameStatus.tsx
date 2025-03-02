import {
  Box,
  VStack,
  Text,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
} from "@chakra-ui/react";
import { GameState } from "../../types/game";

interface GameStatusProps {
  gameState: GameState;
  evaluation: number;
}

export function GameStatus({ gameState, evaluation }: GameStatusProps) {
  const getStatusBadge = () => {
    if (gameState.isCheckmate) {
      return <Badge colorScheme="red">Checkmate</Badge>;
    }
    if (gameState.isCheck) {
      return <Badge colorScheme="orange">Check</Badge>;
    }
    if (gameState.isStalemate) {
      return <Badge colorScheme="gray">Stalemate</Badge>;
    }
    return null;
  };

  const getEvaluationColor = () => {
    if (evaluation > 0) return "green.500";
    if (evaluation < 0) return "red.500";
    return "gray.500";
  };

  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Box>
        <Text fontWeight="bold" mb={2}>Game Status</Text>
        <HStack spacing={2}>
          {getStatusBadge()}
          <Badge colorScheme={gameState.turn === "w" ? "gray" : "black"}>
            {gameState.turn === "w" ? "White to move" : "Black to move"}
          </Badge>
          <Badge colorScheme="blue">{gameState.gamePhase}</Badge>
        </HStack>
      </Box>

      <Box>
        <Text fontWeight="bold" mb={2}>Position Evaluation</Text>
        <Stat>
          <StatLabel>Advantage</StatLabel>
          <StatNumber color={getEvaluationColor()}>
            {Math.abs(evaluation).toFixed(1)}
          </StatNumber>
          <StatHelpText>
            {evaluation > 0 ? "White is better" : evaluation < 0 ? "Black is better" : "Equal position"}
          </StatHelpText>
        </Stat>
        <Progress
          value={50 + (evaluation * 5)} // Convert evaluation to 0-100 scale
          min={0}
          max={100}
          colorScheme={evaluation > 0 ? "green" : "red"}
          mt={2}
        />
      </Box>
    </VStack>
  );
}
