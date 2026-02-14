import React, { useState } from 'react'; // React importu eklendi
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  
  // Form verilerini tutan State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer', // Varsayılan olarak Müşteri
    companyName: ''   // Tedarikçi seçilirse diye boş bir alan ekleyelim
  });

  const [message, setMessage] = useState('');

  // İnputlar değiştikçe state'i güncelle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form gönderilince çalışacak fonksiyon
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setMessage('Kayıt işlemi yapılıyor...');

    try {
      // 🚨 KRİTİK DÜZELTME: Render üzerindeki canlı backend adresini yazdık
      const response = await axios.post('https://otoparca-api.onrender.com/api/auth/register', formData);
      
      setMessage('✅ ' + response.data.message);
      
      // Başarılı olursa 2 saniye sonra Giriş (Login) sayfasına yönlendir
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (error: any) {
      console.error("Kayıt Hatası:", error);
      const errorMsg = error.response?.data?.message || 'Bir hata oluştu, lütfen tekrar deneyin.';
      setMessage('❌ ' + errorMsg);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Kayıt Ol</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input 
          type="text" name="name" placeholder="Ad Soyad" required 
          value={formData.name} onChange={handleChange} 
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
        />

        <input 
          type="email" name="email" placeholder="E-Posta Adresi" required 
          value={formData.email} onChange={handleChange} 
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
        />

        <input 
          type="password" name="password" placeholder="Şifre" required 
          value={formData.password} onChange={handleChange} 
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
        />

        <input 
          type="tel" name="phone" placeholder="Telefon (5XX...)" required 
          value={formData.phone} onChange={handleChange} 
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '14px', color: '#555' }}>Hesap Türü:</label>
          <select name="role" value={formData.role} onChange={handleChange} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff' }}>
            <option value="customer">Parça Arıyorum (Müşteri)</option>
            <option value="supplier">Parça Satıyorum (Tedarikçi)</option>
          </select>
        </div>

        {/* Sadece Tedarikçi seçilirse Şirket Adı sorabiliriz (Opsiyonel) */}
        {formData.role === 'supplier' && (
           <input 
           type="text" name="companyName" placeholder="Firma / Dükkan Adı"
           value={formData.companyName} onChange={handleChange} 
           style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
         />
        )}

        <button type="submit" style={{ padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          Kayıt Ol
        </button>

      </form>

      {message && <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: message.startsWith('❌') ? 'red' : 'green' }}>{message}</p>}
      
      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        Zaten hesabın var mı? <a href="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Giriş Yap</a>
      </p>
    </div>
  );
};

export default Register;