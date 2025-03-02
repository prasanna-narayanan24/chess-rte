import { Box, Heading, Text, HStack, VStack, Progress } from "@chakra-ui/react";

interface AnalysisPanelProps {
  evaluation?: number;
  depth?: number;
  bestMove?: string;
  position?: string;
}

export function AnalysisPanel({ evaluation = 0, depth = 0, bestMove = '', position = '' }: AnalysisPanelProps) {
  const normalizedEval = Math.min(Math.max(evaluation, -5), 5); // Clamp between -5 and 5
  const progressValue = ((normalizedEval + 5) / 10) * 100; // Convert to 0-100 range

  return (
    <VStack align="stretch" spacing={4} h="100%">
      <Heading size="md">Position Analysis</Heading>
      
      <HStack justify="space-between" align="center">
        <Text fontWeight="bold" color={evaluation > 0 ? "green.400" : "red.400"}>
          {evaluation > 0 ? '+' : ''}{evaluation.toFixed(1)}
        </Text>
        <Progress 
          value={progressValue} 
          size="sm" 
          width="200px"
          colorScheme={evaluation > 0 ? "green" : "red"}
        />
      </HStack>

      <Box>
        <Text fontWeight="bold" mb={1}>Best Move</Text>
        <Text fontSize="lg" fontFamily="monospace">
          {bestMove || 'Analyzing...'}
        </Text>
      </Box>

      <Box>
        <Text fontWeight="bold" mb={1}>Current Position</Text>
        <Text fontSize="sm" color="gray.400">
          {position || 'Starting Position'}
        </Text>
      </Box>

      <Box mt="auto">
        <Text fontSize="sm" color="gray.500">
          Depth: {depth}
        </Text>
      </Box>
    </VStack>
  );
}
