import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface RequestType {
  _id: string;
  vehicle: { brand: string; model: string; year: number };
  partName: string;
  description: string;
  images: string[];
  offerCount: number;
  status: string;
  createdAt: string;
  averagePrice?: string; // Backend'den gelen ortalama fiyat
}

const SupplierFeed = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestType[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Modal ve Form State
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(null);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('used');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (user.role && user.role !== 'supplier' && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchRequests();
  }, [user.role, navigate]);

  const fetchRequests = () => {
    axios.get('http://localhost:5000/api/requests')
      .then(res => setRequests(res.data))
      .catch(err => console.error(err));
  };

  const openModal = (req: RequestType) => {
    setSelectedRequest(req);
    setPrice('');
    setCondition('used');
    setDescription('');
    setSelectedFiles(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return alert("Lütfen fiyat belirtin!");

    const formData = new FormData();
    formData.append('requestId', selectedRequest!._id);
    formData.append('supplierId', user.id);
    formData.append('price', price);
    formData.append('condition', condition);
    formData.append('description', description);

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
      }
    }

    try {
      await axios.post('http://localhost:5000/api/offers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('✅ Teklifiniz başarıyla iletildi!');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      alert('Hata: Teklif gönderilemedi.');
    }
  };

  return (
    <div className="container">
      {/* ÜST PANEL */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: '#fff', border: '1px solid #ddd', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ⬅ Geri
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>PARÇA VİTRİNİ</h2>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {requests.map((req) => (
          <div key={req._id} className="card" style={{ 
            opacity: req.status === 'completed' ? 0.7 : 1,
            borderLeftColor: req.status === 'completed' ? '#64748b' : 'var(--renault-yellow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{req.partName.toUpperCase()}</h3>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#444', marginTop: '4px' }}>
                  {req.vehicle.brand} {req.vehicle.model} ({req.vehicle.year})
                </div>
              </div>
              <span className="status-badge" style={{ backgroundColor: req.status === 'completed' ? '#64748b' : 'var(--renault-yellow)' }}>
                {req.status === 'completed' ? 'KAPANDI' : 'AÇIK'}
              </span>
            </div>

            <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic', margin: '12px 0' }}>
              "{req.description || 'Açıklama yok.'}"
            </p>

            {/* MÜŞTERİNİN YÜKLEDİĞİ RESİMLER */}
            {req.images && req.images.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>📸 Müşterinin Gönderdiği Görseller:</div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                  {req.images.map((img, idx) => (
                    <a key={idx} href={`http://localhost:5000${img}`} target="_blank" rel="noreferrer">
                      <img 
                        src={`http://localhost:5000${img}`} 
                        alt="Talep" 
                        style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' }} 
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* BUTON ALANI */}
            {req.status === 'completed' ? (
              <div style={{ textAlign: 'center', padding: '10px', background: '#eee', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', color: '#666' }}>
                🔒 BU TALEP İÇİN ANLAŞMA SAĞLANDI
              </div>
            ) : (
              <button onClick={() => openModal(req)} className="btn-auto">TEKLİF VER</button>
            )}
            
            <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '12px', color: '#888' }}>
              📢 {req.offerCount} Teklif Alındı
            </div>
          </div>
        ))}
      </div>

      {/* TEKLİF VERME MODALI */}
      {selectedRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', borderLeft: 'none', borderTop: '8px solid var(--renault-yellow)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Teklif Gönder</h3>
            
            {/* PİYASA ANALİZİ BİLGİ KUTUSU */}
            <div style={{ 
              backgroundColor: '#fefce8', border: '1px solid #fef08a', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' 
            }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <div style={{ fontSize: '13px', color: '#854d0e' }}>
                <strong>Piyasa Analizi:</strong> Bu parça için ortalama fiyat: 
                <span style={{ fontSize: '15px', fontWeight: '900', marginLeft: '5px' }}>
                  {Number(selectedRequest.averagePrice) > 0 ? `${selectedRequest.averagePrice} TL` : "Henüz teklif yok."}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Fiyat Teklifiniz (TL)</div>
              <input type="number" placeholder="Örn: 1500" required value={price} onChange={e => setPrice(e.target.value)} />
              
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Parça Durumu</div>
              <select value={condition} onChange={e => setCondition(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '2px solid #eee', width: '100%' }}>
                <option value="used">🛠️ Çıkma Parça</option>
                <option value="new">✨ Sıfır / Yeni Parça</option>
              </select>

              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Ek Notlar</div>
              <textarea placeholder="Garanti süresi, kargo durumu vb..." value={description} onChange={e => setDescription(e.target.value)} />

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>📸 Parça Görselleri (Max 3)</label>
                <input type="file" multiple accept="image/*" onChange={e => setSelectedFiles(e.target.files)} style={{ fontSize: '12px', width: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedRequest(null)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: '#eee' }}>İPTAL</button>
                <button type="submit" className="btn-auto" style={{ flex: 1 }}>GÖNDER 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierFeed;