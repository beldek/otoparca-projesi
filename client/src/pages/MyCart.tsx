import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface OrderType {
  _id: string;
  price: number;
  condition: string;
  description: string;
  images: string[];
  request: any; // Backend'den gelen parça detayları
  isAccepted: boolean;
}

const MyCart = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.id) {
      fetchOrders();
    } else {
      navigate('/login');
    }
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // 1. Önce müşterinin tüm taleplerini alıyoruz
      const reqRes = await axios.get(`http://localhost:5000/api/requests/user/${user.id}`);
      const myRequests = reqRes.data;

      // 2. Her talep için teklifleri çekiyoruz
      const offerPromises = myRequests.map((req: any) => 
        axios.get(`http://localhost:5000/api/offers/${req._id}`)
      );
      
      const responses = await Promise.all(offerPromises);
      
      // 3. Gelen tüm teklifler içinden sadece ONAYLANMIŞ olanları ayıklıyoruz
      // Ve talep detaylarını (partName vs.) manuel eşleştiriyoruz
      const acceptedOffers = responses.flatMap((res, index) => {
        return res.data
          .filter((off: any) => off.isAccepted === true)
          .map((off: any) => ({
            ...off,
            request: myRequests[index] // Parça bilgisini buraya ekliyoruz
          }));
      });

      setOrders(acceptedOffers);
    } catch (error) {
      console.error("Sipariş çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* ÜST PANEL - Geri butonu düzeltildi */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            background: '#fff', border: '1px solid #ddd', padding: '10px', 
            borderRadius: '8px', cursor: 'pointer', fontSize: '16px' 
          }}
        >
          ⬅ Geri Dön
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>SİPARİŞLERİM</h2>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Yükleniyor...</p>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛒</div>
          <p style={{ color: 'var(--gear-gray)' }}>Henüz onaylanmış bir siparişiniz yok.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="card" style={{ borderLeftColor: '#10b981', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--garage-black)' }}>
                  {order.request?.partName?.toUpperCase() || 'PARÇA BİLGİSİ YOK'}
                </h4>
                <div style={{ fontSize: '13px', color: 'var(--gear-gray)', marginTop: '4px' }}>
                   {order.request?.vehicle?.brand} {order.request?.vehicle?.model}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981' }}>{order.price} TL</div>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 'bold' }}>ÖDEME BEKLİYOR</span>
              </div>
            </div>

            {/* Resimler varsa göster */}
            {order.images && order.images.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '15px', overflowX: 'auto' }}>
                {order.images.map((img, idx) => (
                  <img key={idx} src={`http://localhost:5000${img}`} 
                       style={{ width: '70px', height: '70px', borderRadius: '6px', objectFit: 'cover' }} />
                ))}
              </div>
            )}

            {/* Durum Kartı */}
            <div style={{ 
              marginTop: '15px', padding: '12px', backgroundColor: '#f0fdf4', 
              borderRadius: '8px', border: '1px solid #bbf7d0'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534' }}>DURUM:</div>
              <div style={{ fontSize: '13px', color: '#166534', marginTop: '5px' }}>
                🚀 <strong>Hazırlanıyor:</strong> Satıcı kargo paketi hazırlıyor. Operatörümüz sizi arayacaktır.
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyCart;