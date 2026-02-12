import { useState } from 'react';
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
    role: 'customer' // Varsayılan olarak Müşteri
  });

  const [message, setMessage] = useState('');

  // İnputlar değiştikçe state'i güncelle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form gönderilince çalışacak fonksiyon
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    setMessage('İşleniyor...');

    try {
      // Backend'e istek at
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      setMessage('✅ ' + response.data.message);
      
      // 2 saniye sonra giriş sayfasına (henüz yapmadık ama) yönlendir
      setTimeout(() => navigate('/'), 2000);
      
    } catch (error: any) {
      setMessage('❌ ' + (error.response?.data?.message || 'Bir hata oluştu'));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Kayıt Ol</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input 
          type="text" name="name" placeholder="Ad Soyad" required 
          value={formData.name} onChange={handleChange} 
          style={{ padding: '10px' }}
        />

        <input 
          type="email" name="email" placeholder="E-Posta" required 
          value={formData.email} onChange={handleChange} 
          style={{ padding: '10px' }}
        />

        <input 
          type="password" name="password" placeholder="Şifre" required 
          value={formData.password} onChange={handleChange} 
          style={{ padding: '10px' }}
        />

        <input 
          type="tel" name="phone" placeholder="Telefon (5XX...)" required 
          value={formData.phone} onChange={handleChange} 
          style={{ padding: '10px' }}
        />

        <select name="role" value={formData.role} onChange={handleChange} style={{ padding: '10px' }}>
          <option value="customer">Parça Arıyorum (Müşteri)</option>
          <option value="supplier">Parça Satıyorum (Tedarikçi)</option>
        </select>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Kayıt Ol
        </button>

      </form>

      {message && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
};

export default Register;