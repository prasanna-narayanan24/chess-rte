import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Box,
} from "@chakra-ui/react";
import { TrophyIcon } from "./icons";
import ReactConfetti from 'react-confetti';
import { useRef } from 'react';
import { GameStats } from "../../types/game";
import { createPortal } from 'react-dom';

interface GameEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onRematch: () => void;
  stats: GameStats;
}

export function GameEndModal({
  isOpen,
  onClose,
  onNewGame,
  onRematch,
  stats,
}: GameEndModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <Box position="relative">
        {isOpen && stats.isWin && createPortal(
          <Box
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width="100%"
            height="100%"
            // maxWidth="500px"
            // maxHeight="500px"
            pointerEvents="none"
            zIndex={2000}
          >
            <ReactConfetti
              // width={500}
              // height={500}
              recycle={false}
              colors={['#FFD700', '#FFA500', '#FF6347']}
              numberOfPieces={200}
              gravity={0.1}
            />
          </Box>,
          document.body
        )}
        <ModalContent ref={modalRef} bg="gray.800" color="white" py={6}>
          <ModalBody>
            <VStack spacing={6}>
              <Icon as={TrophyIcon} boxSize={16} color="yellow.400" />
              <Text fontSize="3xl" fontWeight="bold">
                {stats.isWin ? 'You Won!' : stats.endType === 'checkmate' ? 'You Lost!' : 'Drawn!'}
              </Text>

              <HStack spacing={8} justify="center" py={4}>
                <VStack>
                  <Text fontSize="2xl" color="orange.300">{stats.mistakes}</Text>
                  <Text color="gray.400">Mistake</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" color="red.300">{stats.blunders}</Text>
                  <Text color="gray.400">Blunders</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" color="yellow.300">{stats.missedWins}</Text>
                  <Text color="gray.400">Missed Wins</Text>
                </VStack>
              </HStack>

              <Button
                w="100%"
                size="lg"
                colorScheme="green"
                onClick={onNewGame}
              >
                Game Review
              </Button>

              <HStack w="100%" spacing={4}>
                <Button
                  flex={1}
                  variant="outline"
                  onClick={onNewGame}
                >
                  New 10 min
                </Button>
                <Button
                  flex={1}
                  variant="outline"
                  onClick={onRematch}
                >
                  Rematch
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Box>
    </Modal>
  );
}
