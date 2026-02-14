import React, { useState } from 'react'; // React'i buraya ekledik
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // DÜZELTME: e: React.FormEvent<HTMLFormElement> yaptık.
  // Bu sayede "deprecated" hatası almazsın ve TypeScript form elemanı olduğunu anlar.
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Giriş yapılıyor...');

    try {
      // API Adresi (Canlı Render Sunucusu)
      const response = await axios.post('https://otoparca-api.onrender.com/api/auth/login', {
        email,
        password
      });

      setMessage('✅ Giriş Başarılı! Yönlendiriliyorsunuz...');
      
      // Kullanıcı verisini kaydet
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Token varsa kaydet
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // 1 saniye sonra panele git
      setTimeout(() => navigate('/dashboard'), 1000);

    } catch (error: any) {
      console.error("Login Hatası:", error);
      const errorMsg = error.response?.data?.message || 'Sunucuya bağlanılamadı. İnternetinizi kontrol edin.';
      setMessage('❌ ' + errorMsg);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Giriş Yap</h2>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" placeholder="E-Posta Adresiniz" required 
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
        
        <input 
          type="password" placeholder="Şifreniz" required 
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
        />

        <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          Giriş Yap
        </button>
      </form>

      {message && <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: message.startsWith('❌') ? 'red' : 'green' }}>{message}</p>}
      
      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        Hesabın yok mu? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Kayıt Ol</Link>
      </p>
    </div>
  );
};

export default Login;