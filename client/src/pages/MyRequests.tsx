import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id && !user._id) {
        navigate('/login');
        return;
    }
    fetchMyRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyRequests = async () => {
    try {
      const userId = user.id || user._id;
      const res = await axios.get(`https://otoparca-api.onrender.com/api/requests/user/${userId}`);
      setRequests(res.data);
    } catch (err) {
      console.error("Talepler çekilemedi:", err);
    }
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      
      {/* --- YENİ EKLENEN: ANA MENÜYE DÖN BUTONU --- */}
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ 
          marginBottom: '20px', 
          background: '#fff', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '12px', 
          fontWeight: 'bold', 
          cursor: 'pointer', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ⬅ Ana Menü
      </button>

      {/* BAŞLIK VE YENİ TALEP BUTONU */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
           <h2 style={{ fontWeight: 900, margin: 0, color: 'var(--renault-black)' }}>TALEPLERİM</h2>
           <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Oluşturduğunuz parça istekleri</p>
        </div>
        <button 
            onClick={() => navigate('/create-request')} 
            className="btn-auto" 
            style={{ width: 'auto', padding: '12px 20px', fontSize: '14px' }}
        >
          + YENİ TALEP
        </button>
      </div>

      {/* LİSTELEME ALANI */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {requests.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
            <p>Henüz bir parça talebi oluşturmadınız.</p>
            <button onClick={() => navigate('/create-request')} style={{ background: 'none', border: 'none', color: 'var(--renault-yellow)', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
              Hemen Oluşturun &rarr;
            </button>
          </div>
        ) : (
          requests.map((req: any) => (
            <div 
              key={req._id} 
              className="glass-card" 
              onClick={() => navigate(`/request-details/${req._id}`)}
              style={{ 
                  cursor: 'pointer', 
                  transition: '0.2s', 
                  borderLeft: req.status === 'completed' ? '8px solid #22c55e' : '8px solid var(--renault-yellow)' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{req.partName.toUpperCase()}</h3>
                  <div style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>
                    🚗 {req.vehicle.brand} {req.vehicle.model} ({req.vehicle.year})
                  </div>
                  {/* Eğer sürüm/yakıt bilgisi varsa gösterelim */}
                  {req.vehicle.version && (
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                        {req.vehicle.version} - {req.vehicle.fuel}
                    </div>
                  )}
                </div>
                
                <span className="status-badge" style={{ 
                  backgroundColor: req.status === 'completed' ? '#22c55e' : 'var(--renault-yellow)',
                  color: req.status === 'completed' ? '#fff' : '#000'
                }}>
                  {req.status === 'completed' ? 'TAMAMLANDI' : 'BEKLİYOR'}
                </span>
              </div>
              
              <hr style={{ margin: '15px 0', borderColor: 'rgba(0,0,0,0.05)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📩</span>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: req.offerCount > 0 ? '#000' : '#888' }}>
                    {req.offerCount || 0} Teklif Mevcut
                  </span>
                </div>
                <small style={{ color: '#999', fontSize: '12px' }}>
                    {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyRequests;