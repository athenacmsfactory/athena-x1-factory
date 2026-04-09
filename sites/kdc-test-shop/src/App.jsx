import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Section from './components/Section';
import Footer from './components/Footer';
import Checkout from './components/Checkout';
import Admin from './pages/Admin';
import CartOverlay from './components/CartOverlay';
import { CartProvider } from './components/CartContext';

const Layout = ({ data, children }) => (
  <div className="min-h-screen bg-[var(--color-background)]">
    <Header data={data} />
    <main className="pt-20">{children}</main>
    <Footer data={data} />
    <CartOverlay />
  </div>
);

const App = ({ data }) => (
  <CartProvider>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Layout data={data}><Section data={data} /></Layout>} />
        <Route path="/checkout" element={<Layout data={data}><Checkout /></Layout>} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  </CartProvider>
);
export default App;