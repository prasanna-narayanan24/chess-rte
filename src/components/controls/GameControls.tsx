import {
  VStack,
  HStack,
  Button,
  Select,
  Box,
  Heading,
  Divider
} from "@chakra-ui/react";

interface GameControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onRequestHint: () => void;
  difficulty: string;
  onDifficultyChange: (level: string) => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function GameControls({
  onUndo,
  onRedo,
  onReset,
  onRequestHint,
  difficulty,
  onDifficultyChange,
  canUndo,
  canRedo
}: GameControlsProps) {
  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Box>
        <Heading size="md" mb={2}>Game Controls</Heading>
        <HStack spacing={2}>
          <Button onClick={onUndo} isDisabled={!canUndo} flex={1}>
            Undo
          </Button>
          <Button onClick={onRedo} isDisabled={!canRedo} flex={1}>
            Redo
          </Button>
        </HStack>
      </Box>

      <Divider />

      <Box>
        <Heading size="sm" mb={2}>Difficulty</Heading>
        <Select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
      </Box>

      <Button colorScheme="blue" onClick={onRequestHint}>
        Get Hint
      </Button>

      <Button colorScheme="red" variant="outline" onClick={onReset}>
        Reset Game
      </Button>
    </VStack>
  );
}
