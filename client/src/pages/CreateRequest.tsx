import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateRequest = () => {
  // 1. State'i yeni alanlarla genişlettik
  const [formData, setFormData] = useState({ 
    brand: '', model: '', year: '', 
    version: '', fuel: '', bodyType: '', color: '', // Yeni alanlar
    partName: '', description: '', vin: '' 
  });
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (formData.vin.length === 17) {
      handleVinDecode(formData.vin);
    }
  }, [formData.vin]);

  const handleVinDecode = async (vin: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://db.vin/api/v1/vin/${vin}?api_key=YOUR_API_KEY_IF_NEEDED`);
      const data = await response.json();
      
      console.log("API Yanıtı:", data);

      if (data) {
        // API'den gelen verileri state'e eşleştiriyoruz
        setFormData(prev => ({
          ...prev,
          brand: data.make || data.brand || '',     // Marka
          model: data.model || '',                  // Model
          year: data.year || '',                    // Yıl
          version: data.trim || data.version || '', // Sürüm (1.8T SE)
          fuel: data.fuel_type || data.fuel || '',  // Yakıt (Benzin)
          bodyType: data.body_type || data.style || '', // Kasa (Sedan)
          color: data.color || ''                   // Renk
        }));
      }
    } catch (error) {
      console.error("VIN Hatası:", error);
      alert("Araç bilgileri çekilemedi, lütfen manuel giriniz.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!user.id && !user._id)) {
        alert("Lütfen giriş yapın.");
        navigate('/login');
        return;
    }

    const data = new FormData();
    data.append('userId', user.id || user._id); 
    // Tüm alanları ekliyoruz
    data.append('vin', formData.vin);
    data.append('brand', formData.brand);
    data.append('model', formData.model);
    data.append('year', formData.year);
    data.append('version', formData.version);
    data.append('fuel', formData.fuel);
    data.append('bodyType', formData.bodyType);
    data.append('color', formData.color);
    data.append('partName', formData.partName);
    data.append('description', formData.description);

    if (files) {
      for (let i = 0; i < files.length; i++) {
        data.append('images', files[i]);
      }
    }

    try {
      await axios.post('http://localhost:5000/api/requests', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('✅ Talep oluşturuldu!');
      navigate('/my-requests');
    } catch (err: any) {
      alert('Hata: ' + (err.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => navigate('/dashboard')} className="btn-auto" style={{ background: '#fff', color: '#000', marginBottom: '20px' }}>
            ⬅ VAZGEÇ
        </button>

        <div className="glass-card">
          <h2 style={{ textAlign: 'center' }}>PARÇA TALEBİ OLUŞTUR</h2>
          
          {/* ŞASİ NO GİRİŞİ */}
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Şasi No (VIN)</label>
            <input 
              type="text" 
              placeholder="17 Haneli Şasi No" 
              maxLength={17}
              value={formData.vin}
              onChange={e => setFormData({...formData, vin: e.target.value.toUpperCase()})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--renault-yellow)', fontWeight: 'bold' }} 
            />
            {loading && <span style={{ position: 'absolute', right: '10px', top: '38px', fontSize: '12px' }}>⏳ Veriler Çekiliyor...</span>}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            
            {/* Araç Temel Bilgileri */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="text" placeholder="Marka" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required style={{ padding: '10px' }} />
              <input type="text" placeholder="Model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required style={{ padding: '10px' }} />
            </div>

            {/* Yıl ve Renk */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
               <input type="number" placeholder="Yıl" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} required style={{ padding: '10px' }} />
               <input type="text" placeholder="Renk" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ padding: '10px' }} />
            </div>

            {/* Detaylı Araç Bilgileri (API'den gelenler) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
               <input type="text" placeholder="Motor/Paket (Örn: 1.8T)" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} style={{ padding: '10px', backgroundColor: '#f9f9f9' }} />
               <input type="text" placeholder="Kasa Tipi (Örn: Sedan)" value={formData.bodyType} onChange={e => setFormData({...formData, bodyType: e.target.value})} style={{ padding: '10px', backgroundColor: '#f9f9f9' }} />
            </div>

            <input type="text" placeholder="Yakıt Tipi" value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value})} style={{ padding: '10px', width: '100%' }} />
            
            <hr style={{opacity: 0.2}}/>

            {/* Parça Bilgileri */}
            <input type="text" placeholder="Hangi Parça Lazım?" value={formData.partName} onChange={e => setFormData({...formData, partName: e.target.value})} required style={{ padding: '10px', borderLeft: '5px solid #000' }} />
            
            <textarea placeholder="Ek Açıklama" rows={3} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '10px' }} />
            
            <input type="file" multiple onChange={e => setFiles(e.target.files)} style={{ marginTop: '10px' }} />

            <button type="submit" className="btn-auto" style={{ marginTop: '20px', background: '#000', color: '#fff' }}>
              TALEBİ YAYINLA
            </button>
          </form>
        </div>
    </div>
  );
};

export default CreateRequest;