import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

interface Offer {
  _id: string;
  price: number;
  description: string;
  condition: string;
  images: string[];
  status: string;
  supplier: {
    name: string;
    companyName?: string;
    phone?: string;
  };
}

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      // ID TEMİZLEME: Başındaki gereksiz metinleri atar
      const cleanId = id?.includes(':') ? id.split(':')[1] : id;
      
      // DOĞRU URL: Backend'deki router.get('/:requestId') ile uyumlu
      const res = await axios.get(`https://otoparca-api.onrender.com/api/offers/${cleanId}`);
      setOffers(res.data);
    } catch (err) {
      console.error("Teklifler çekilirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOffers();
  }, [id]);

  const handleAccept = async (offerId: string) => {
    if (!window.confirm("Bu teklifi onaylıyor musunuz?")) return;

    try {
      // Backend PUT /api/offers/accept/:offerId bekliyor
      await axios.put(`https://otoparca-api.onrender.com/api/offers/accept/${offerId}`);
      alert("✅ Teklif onaylandı!");
      fetchOffers(); // Listeyi yenile
    } catch (err) {
      alert("Hata: Onay işlemi başarısız.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>⬅ Geri Dön</button>
      <h2>Gelen Teklifler</h2>

      {loading ? <p>Yükleniyor...</p> : offers.length === 0 ? <p>Henüz teklif yok.</p> : (
        offers.map(offer => {
          const isAccepted = offer.status === 'accepted' || (offer as any).isAccepted;
          
          return (
            <div key={offer._id} style={{ 
              border: isAccepted ? '2px solid green' : '1px solid #ddd', 
              padding: '15px', borderRadius: '10px', marginBottom: '10px',
              backgroundColor: isAccepted ? '#f0fff0' : '#fff'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>{offer.price} TL</div>
              <p>{offer.description}</p>
              
              {/* Resimler */}
              <div style={{ display: 'flex', gap: '5px', margin: '10px 0' }}>
                {offer.images?.map((img, i) => (
                  <img key={i} src={`https://otoparca-api.onrender.com${img}`} width="60" height="60" style={{ objectFit: 'cover', borderRadius: '5px' }} />
                ))}
              </div>

              <div style={{ fontSize: '13px', color: '#666' }}>
                Satıcı: {offer.supplier?.companyName || offer.supplier?.name}
              </div>

              {isAccepted ? (
                <div style={{ marginTop: '10px', fontWeight: 'bold', color: 'darkgreen' }}>
                  ✅ ONAYLANDI - Tel: {offer.supplier?.phone || "İletişime geçiniz"}
                </div>
              ) : (
                <button 
                  onClick={() => handleAccept(offer._id)}
                  style={{ marginTop: '10px', backgroundColor: '#000', color: '#fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Teklifi Onayla (Satın Al)
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default RequestDetails;