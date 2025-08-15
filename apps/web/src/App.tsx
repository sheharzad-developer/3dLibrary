
import { AppProviders } from './app/providers';
import { AppRoutes } from './app/routes';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

function App() {
  return (
    <AppProviders>
      <Navigation />
      <AppRoutes />
      <Footer />
    </AppProviders>
  );
}

export default App;
