import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface OfferType {
  _id: string;
  supplier: { name: string }; 
  price: number;
  condition: string;
  description: string;
  images: string[];
  isAccepted: boolean;
}

const RequestDetails = () => {
  const { id } = useParams(); // URL'den ID'yi alır
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [offers, setOffers] = useState<OfferType[]>([]);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      // 1. Talebin detayını çek
      const reqRes = await axios.get(`http://localhost:5000/api/requests/${id}`);
      setRequest(reqRes.data);

      // 2. Bu talebe gelen teklifleri çek
      const offRes = await axios.get(`http://localhost:5000/api/offers/${id}`);
      setOffers(offRes.data);
    } catch (error) {
      console.error("Veri hatası:", error);
    }
  };

  const handleAccept = async (offerId: string, price: number) => {
    const confirm = window.confirm(`${price} TL'lik teklifi onaylıyor musun?`);
    if (!confirm) return;

    try {
      await axios.put(`http://localhost:5000/api/offers/accept/${offerId}`);
      alert("✅ Teklif onaylandı! Tedarikçiye WhatsApp bildirimi gitti.");
      fetchDetails(); // Sayfayı yenile
    } catch (error) {
      alert("Hata oluştu.");
    }
  };

  if (!request) return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;

  return (
    <div className="container" style={{ padding: '20px' }}>
      
      {/* GERİ BUTONU */}
      <button onClick={() => navigate('/my-requests')}
        style={{ marginBottom: '20px', background: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        ⬅ Listeye Dön
      </button>

      {/* TALEP DETAYI */}
      <div className="glass-card" style={{ marginBottom: '30px', borderLeft: '8px solid var(--renault-yellow)' }}>
        <h2 style={{ margin: 0 }}>{request.partName.toUpperCase()}</h2>
        <p>{request.vehicle.brand} {request.vehicle.model} ({request.vehicle.year})</p>
        <span className="status-badge" style={{ backgroundColor: request.status === 'completed' ? '#22c55e' : 'var(--renault-yellow)', color: request.status === 'completed' ? '#fff' : '#000' }}>
            {request.status === 'completed' ? 'TAMAMLANDI' : 'AÇIK TALEP'}
        </span>
      </div>

      {/* TEKLİFLER */}
      <h3>GELEN TEKLİFLER ({offers.length})</h3>
      <div style={{ display: 'grid', gap: '20px' }}>
        {offers.length === 0 ? <p>Henüz teklif yok.</p> : offers.map((offer) => (
          <div key={offer._id} className="glass-card" style={{ border: offer.isAccepted ? '2px solid #22c55e' : '1px solid #ddd', backgroundColor: offer.isAccepted ? '#dcfce7' : 'rgba(255,255,255,0.7)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong>🏢 {offer.supplier?.name || 'Tedarikçi'}</strong>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{offer.price} TL</span>
            </div>
            
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>
               {offer.condition === 'new' ? 'Sıfır Parça' : 'Çıkma Parça'} | Not: {offer.description}
            </div>

            {/* BUTONLAR */}
            {offer.isAccepted ? (
               <button disabled style={{ width: '100%', padding: '10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px' }}>✅ SİPARİŞ ONAYLANDI</button>
            ) : request.status === 'completed' ? (
               <button disabled style={{ width: '100%', padding: '10px', background: '#ccc', color: '#666', border: 'none', borderRadius: '8px' }}>🔒 BU TALEP KAPANDI</button>
            ) : (
               <button onClick={() => handleAccept(offer._id, offer.price)} className="btn-auto" style={{ width: '100%', background: '#000', color: '#fff' }}>TEKLİFİ ONAYLA</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestDetails;