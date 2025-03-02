import {
  VStack,
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  HStack,
  Icon,
  Button,
} from "@chakra-ui/react";
import { RepeatIcon, QuestionIcon } from "@chakra-ui/icons";

interface InfoPanelProps {
  moveHistory: Array<{
    moveNumber: number;
    white: string;
    black: string;
  }>;
}

export function InfoPanel({ moveHistory }: InfoPanelProps) {
  return (
    <VStack spacing={6} align="stretch" overflow={'scroll'}>
      {/* Character Message */}
      <Box bg="gray.700" p={4} borderRadius="md">
        <HStack spacing={4}>
          <Box
            w="50px"
            h="50px"
            borderRadius="full"
            bg="gray.600"
            flexShrink={0}
          />
          <Text>I know it's hard playing me in chess but it's hard to be good at everything.</Text>
        </HStack>
      </Box>

      {/* Opening Information */}
      <Box>
        <HStack justify="space-between" mb={2} px={2}>
          <Heading size="md">Move History</Heading>
          <HStack>
            <Button size="sm" variant="ghost">
              <Icon as={RepeatIcon} />
            </Button>
            <Button size="sm" variant="ghost">
              <Icon as={QuestionIcon} />
            </Button>
          </HStack>
        </HStack>

        {/* Move History */}
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th isNumeric w="40px">#</Th>
              <Th>White</Th>
              <Th>Black</Th>
            </Tr>
          </Thead>
          <Tbody>
            {moveHistory.map((move) => (
              <Tr key={move.moveNumber}>
                <Td isNumeric>{move.moveNumber}.</Td>
                <Td>{move.white}</Td>
                <Td>{move.black}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
}
