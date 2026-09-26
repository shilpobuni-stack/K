import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Shop, { AboutPage, ShadesPage } from './pages/Shop';
import Admin from './pages/Admin';
import { EmptyState } from './components/UI';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container not-found">
      <EmptyState title="এই পাতাটি খুঁজে পাওয়া যায়নি" text="চলুন, আপনার শখের ঠিকানায় ফিরে যাই।">
        <Link className="button primary" to="/">
          হোমে ফিরে যান
        </Link>
      </EmptyState>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="shades" element={<ShadesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin" element={<Admin />} />
          <Route path="admin/:section" element={<Admin />} />
          <Route path="admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
}
