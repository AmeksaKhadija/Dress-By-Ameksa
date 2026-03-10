import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRouter from './routes/AppRouter';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
};

export default App;
