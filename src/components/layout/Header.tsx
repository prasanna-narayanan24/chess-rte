import {
  Box,
  Card,
  CardBody,
  Flex,
  Switch,
  Text,
  VStack
} from "@chakra-ui/react";
import { GameMode } from "../../types/game";

interface HeaderProps {
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
}

export function Header({ gameMode, onGameModeChange }: HeaderProps) {
  return (
    <Card variant="outline" bg="whiteAlpha.50" mb={4}>
      <CardBody p={3}>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" fontWeight="bold">
              Chess Learning
            </Text>

            <Text fontSize={'xs'}>v0.0.1</Text>
          </Flex>

          <Box>
            <Flex align="center" justify="space-between" fontSize="xs">
              <Text>Play</Text>
              <Switch
                size="sm"
                isChecked={gameMode === "learning"}
                onChange={() => onGameModeChange(gameMode === "learning" ? "play" : "learning")}
              />
              <Text>Learn</Text>
            </Flex>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}
