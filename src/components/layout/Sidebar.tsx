import { VStack, Button, Icon, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { FaChessBoard, FaBook, FaChartLine, FaCog } from "react-icons/fa";

interface SidebarProps {
  onNavigate: (route: string) => void;
  activeRoute?: string;
}

export function Sidebar({ onNavigate, activeRoute = "play" }: SidebarProps) {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const menuItems = [
    { icon: FaChessBoard, label: "Play", route: "play" },
    { icon: FaBook, label: "Learn", route: "learn" },
    { icon: FaChartLine, label: "Analysis", route: "analysis" },
    { icon: FaCog, label: "Settings", route: "settings" },
  ];

  return (
    <VStack
      h="100%"
      py={4}
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      spacing={4}
      align="center"
      minW="60px"
    >
      {menuItems.map(({ icon, label, route }) => (
        <Tooltip key={route} label={label} placement="right">
          <Button
            variant="ghost"
            p={3}
            onClick={() => onNavigate(route)}
            aria-label={label}
            isActive={activeRoute === route}
            _active={{
              bg: "blue.100",
              color: "blue.600",
            }}
          >
            <Icon as={icon} boxSize={5} />
          </Button>
        </Tooltip>
      ))}
    </VStack>
  );
}
