import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, IconButton, Container } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { getTheme } from './theme/vortexTheme';
import TicketForm from './components/TicketForm';
import './styles/vortex-theme.css';

function App() {
  const [mode, setMode] = useState('light');

  // Update CSS variables when mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          transition: 'background-color 0.3s, color 0.3s'
        }}
      >
        <AppBar position="static" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
              VORTEX SUPPORT
            </Typography>
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
          <TicketForm />
        </Container>

        <Box component="footer" sx={{ py: 3, textAlign: 'center', opacity: 0.7 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Vortex Support System. Powered by Ayersiservia Tech.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
