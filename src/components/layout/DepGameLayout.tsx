import { Box, GridItem, useBreakpointValue, SimpleGrid } from "@chakra-ui/react";
import { ReactNode } from "react";

interface GameLayoutProps {
  sidebar: ReactNode;
  board: ReactNode;
  info: ReactNode;
  analysis?: ReactNode;
}

export function GameLayout({ sidebar, board, info, analysis }: GameLayoutProps) {
  const isVertical = useBreakpointValue({ base: true, lg: false });
  console.log('isVertical :>> ', isVertical);

  if (isVertical) {
    return (
      <SimpleGrid
        h="calc(100vh - 60px)"
        gap={4}
        p={4}
      >
        <GridItem>
          {sidebar}
        </GridItem>
        <GridItem display="flex" flexDirection="column" gap={4}>
          <Box flex={1} display="flex" alignItems="center" justifyContent="center">
            {/* {board} */}
          </Box>
          {/* {controls} */}
        </GridItem>
        <GridItem bg="whiteAlpha.50" borderRadius="md" overflowY="auto">
          {info}
        </GridItem>
        <GridItem bg="whiteAlpha.50" borderRadius="md" p={4}>
          {analysis}
        </GridItem>
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid h="calc(100vh - 60px)" columns={{ base: 1, lg: 12 }} gap={4} p={4}>
      <GridItem colSpan={{ base: 1, lg: 1 }}>
        {sidebar}
      </GridItem>
      <GridItem colSpan={{ base: 1, lg: 7 }}  display="flex"  flexDir="column" >
        <Box flex={1}>
          {board}
        </Box>
      </GridItem>
      <GridItem colSpan={{ base: 1, lg: 2 }} bg="whiteAlpha.50" borderRadius="md" p={4}>
        {info}
      </GridItem>
      <GridItem colSpan={{ base: 1, lg: 2 }} bg="whiteAlpha.50" borderRadius="md" p={4}>
        {analysis}
      </GridItem>
    </SimpleGrid>
  );
}
