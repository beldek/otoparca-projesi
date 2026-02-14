import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface OfferType {
  _id: string;
  price: number;
  condition: string;
  description: string;
  isAccepted: boolean;
  images: string[];
  request: {
    _id: string;
    partName: string;
    status: string;
    vehicle: { brand: string; model: string; year: number };
  };
  createdAt: string;
}

const SupplierOffers = () => {
  const navigate = useNavigate();
  const [myOffers, setMyOffers] = useState<OfferType[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.id) {
      fetchMyOffers();
    } else {
      navigate('/login');
    }
  }, [user.id, navigate]);

  const fetchMyOffers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://otoparca-api.onrender.com/api/offers/supplier/${user.id}`);
      setMyOffers(res.data);
    } catch (error) {
      console.error("Teklifler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* ÜST PANEL */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            background: '#fff', border: '1px solid #ddd', padding: '10px 15px', 
            borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' 
          }}
        >
          ⬅ Geri
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>TEKLİF GEÇMİŞİM</h2>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Yükleniyor...</p>
      ) : myOffers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>📑</div>
          <p style={{ color: '#666' }}>Henüz hiçbir talebe teklif vermediniz.</p>
          <button className="btn-auto" onClick={() => navigate('/supplier-feed')}>VİTRİNE GİT</button>
        </div>
      ) : (
        myOffers.map((offer) => {
          // Durum Mantığı - Artık isPending değişkeni aşağıda kullanılıyor
          const isWinner = offer.isAccepted;
          const isLost = offer.request?.status === 'completed' && !isWinner;
          const isPending = offer.request?.status === 'active';

          return (
            <div key={offer._id} className="card" style={{ 
              borderLeftColor: isWinner ? '#10b981' : isLost ? '#ef4444' : 'var(--renault-yellow)',
              position: 'relative',
              marginBottom: '16px'
            }}>
              
              {/* ÜST BİLGİ */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--renault-black)' }}>
                    {offer.request?.partName?.toUpperCase() || 'BİLGİ YOK'}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {offer.request?.vehicle?.brand} {offer.request?.vehicle?.model} ({offer.request?.vehicle?.year})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--renault-black)' }}>
                    {offer.price} TL
                  </div>
                  <span style={{ 
                    fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold',
                    backgroundColor: offer.condition === 'new' ? '#dcfce7' : '#f1f5f9',
                    color: offer.condition === 'new' ? '#15803d' : '#475569'
                  }}>
                    {offer.condition === 'new' ? 'SIFIR' : 'ÇIKMA'}
                  </span>
                </div>
              </div>

              {/* TEDARİKÇİ NOTU */}
              {offer.description && (
                <p style={{ fontSize: '13px', color: '#666', margin: '12px 0', fontStyle: 'italic', borderLeft: '2px solid #eee', paddingLeft: '10px' }}>
                  "{offer.description}"
                </p>
              )}

              {/* GÖNDERİLEN RESİMLER */}
              {offer.images && offer.images.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '15px', scrollbarWidth: 'none' }}>
                  {offer.images.map((img, idx) => (
                    <a key={idx} href={`https://otoparca-api.onrender.com${img}`} target="_blank" rel="noreferrer">
                      <img 
                        src={`https://otoparca-api.onrender.com${img}`} 
                        alt="Teklifim" 
                        style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' }} 
                      />
                    </a>
                  ))}
                </div>
              )}

              {/* DURUM ETİKETİ - isPending burada kullanılarak hata giderildi */}
              <div style={{ 
                padding: '12px', 
                borderRadius: '10px', 
                textAlign: 'center', 
                fontSize: '13px', 
                fontWeight: 'bold',
                backgroundColor: isWinner ? '#f0fdf4' : isLost ? '#fef2f2' : isPending ? '#fffbeb' : '#f1f5f9'
              }}>
                {isWinner ? (
                  <span style={{ color: '#166534' }}>🎉 TEKLİFİNİZ ONAYLANDI! Satış başarılı.</span>
                ) : isLost ? (
                  <span style={{ color: '#991b1b' }}>❌ TALEP KAPANDI (Müşteri başka tedarikçiyi seçti)</span>
                ) : isPending ? (
                  <span style={{ color: '#92400e' }}>⏳ BEKLEMEDE (Müşteri değerlendiriyor)</span>
                ) : (
                  <span style={{ color: '#475569' }}>🔍 İŞLEMDE</span>
                )}
              </div>

              <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '10px', color: '#999' }}>
                Tarih: {new Date(offer.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default SupplierOffers;