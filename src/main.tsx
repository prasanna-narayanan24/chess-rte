import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ChessApp from './App.tsx'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
})

createRoot(document.getElementById('chess-game')!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ChessApp />
    </ChakraProvider>
  </StrictMode>,
)
