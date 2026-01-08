import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { mantineTheme } from './lib/mantine-theme';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

const App = () => (
  <MantineProvider theme={mantineTheme}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </MantineProvider>
);

export default App;
