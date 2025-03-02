import { HStack, IconButton, Tooltip } from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon, QuestionIcon } from "@chakra-ui/icons";

interface BoardControlsProps {
  onBack: () => void;
  onForward: () => void;
  onHint: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export function BoardControls({
  onBack,
  onForward,
  onHint,
  canGoBack,
  canGoForward
}: BoardControlsProps) {
  return (
    <HStack spacing={2} justify="center" pt={4}>
      <Tooltip label="Previous move">
        <IconButton
          aria-label="Previous move"
          icon={<ArrowBackIcon />}
          onClick={onBack}
          isDisabled={!canGoBack}
          variant="ghost"
          size="lg"
        />
      </Tooltip>
      <Tooltip label="Get hint">
        <IconButton
          aria-label="Get hint"
          icon={<QuestionIcon />}
          onClick={onHint}
          variant="ghost"
          size="lg"
        />
      </Tooltip>
      <Tooltip label="Next move">
        <IconButton
          aria-label="Next move"
          icon={<ArrowForwardIcon />}
          onClick={onForward}
          isDisabled={!canGoForward}
          variant="ghost"
          size="lg"
        />
      </Tooltip>
    </HStack>
  );
}
