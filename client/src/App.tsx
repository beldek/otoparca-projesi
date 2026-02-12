import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Sayfa Bileşenleri
import Register from './pages/Register';
import Login from './pages/Login';
import CreateRequest from './pages/CreateRequest';
import SupplierFeed from './pages/SupplierFeed';
import MyRequests from './pages/MyRequests';
import MyCart from './pages/MyCart';
import SupplierOffers from './pages/SupplierOffers';
import RequestDetails from './pages/RequestDetails'; // <--- 1. Burayı ekledik

// ------------------------------------------------
// DASHBOARD (ANA PANEL) BİLEŞENİ
// ------------------------------------------------
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      
      {/* ÜST PANEL */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '24px 0',
        marginBottom: '10px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', margin: 0, color: 'var(--garage-black)', fontWeight: 800 }}>
            HOŞ GELDİN, {user.name.toUpperCase()}
          </h1>
          <span style={{ fontSize: '12px', color: 'var(--gear-gray)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {user.role === 'supplier' ? 'YETKİLİ TEDARİKÇİ' : 'MÜŞTERİ PANELİ'}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            background: '#fff', 
            border: '2px solid #e2e8f0', 
            borderRadius: '12px', 
            width: '45px', 
            height: '45px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '18px',
            boxShadow: 'var(--shadow-soft)',
            cursor: 'pointer'
          }}
        >
          🚪
        </button>
      </div>

      {/* IZGARA MENÜ */}
      <div className="grid-menu" style={{ marginTop: '10px' }}>
        
        {/* --- MÜŞTERİ PANELİ --- */}
        {(user.role === 'customer' || user.role === 'admin') && (
          <>
            <div className="card" onClick={() => navigate('/create-request')} 
                 style={{ borderLeftColor: 'var(--headlight-blue)', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--garage-black)', fontWeight: 700 }}>TALEP AÇ</h4>
            </div>

            <div className="card" onClick={() => navigate('/my-requests')} 
                 style={{ borderLeftColor: 'var(--oil-orange)', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--garage-black)', fontWeight: 700 }}>TALEPLERİM</h4>
            </div>

            <div className="card" onClick={() => navigate('/my-cart')} 
                 style={{ borderLeftColor: '#10b981', textAlign: 'center', cursor: 'pointer', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🛒</div>
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--garage-black)', fontWeight: 700 }}>SEPETİM</h4>
              <p style={{ fontSize: '11px', color: 'var(--gear-gray)', marginTop: '5px' }}>Siparişlerinizin durumunu takip edin.</p>
            </div>
          </>
        )}

        {/* --- TEDARİKÇİ PANELİ --- */}
        {(user.role === 'supplier' || user.role === 'admin') && (
          <>
            <div className="card" onClick={() => navigate('/supplier-feed')} 
                 style={{ borderLeftColor: 'var(--dashboard-red)', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--garage-black)', fontWeight: 700 }}>AÇIK TALEPLER</h4>
            </div>

            <div className="card" onClick={() => navigate('/supplier-offers')} 
                 style={{ borderLeftColor: '#6366f1', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--garage-black)', fontWeight: 700 }}>TEKLİFLERİM</h4>
              <p style={{ fontSize: '11px', color: 'var(--gear-gray)', marginTop: '5px' }}>
                Gönderdiğiniz tüm teklifler.
              </p>
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.4, fontSize: '10px', letterSpacing: '1px', fontWeight: 'bold' }}>
        OTO PARÇA SİSTEMİ v1.0
      </div>
    </div>
  );
};

// ------------------------------------------------
// ROTALAR
// ------------------------------------------------
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-request" element={<CreateRequest />} />
        <Route path="/supplier-feed" element={<SupplierFeed />} />
        <Route path="/my-requests" element={<MyRequests />} />
        {/* 2. Teklif detaylarını görmek için bu rotayı ekledik */}
        <Route path="/request-details/:id" element={<RequestDetails />} /> 
        <Route path="/my-cart" element={<MyCart />} />
        <Route path="/supplier-offers" element={<SupplierOffers />} />
      </Routes>
    </Router>
  );
}

export default App;