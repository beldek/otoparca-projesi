import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Giriş yapılıyor...');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      setMessage('✅ ' + response.data.message);
      
      // Kullanıcı bilgisini tarayıcı hafızasına (LocalStorage) kaydet
      // Böylece sayfayı yenilese bile "giriş yapmış" sayılacak.
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // 1 saniye sonra Panle yönlendir (Henüz yapmadık ama yapacağız)
      setTimeout(() => navigate('/dashboard'), 1000);

    } catch (error: any) {
      setMessage('❌ ' + (error.response?.data?.message || 'Giriş Başarısız'));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Giriş Yap</h2>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" placeholder="E-Posta" required 
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px' }}
        />
        
        <input 
          type="password" placeholder="Şifre" required 
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px' }}
        />

        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
          Giriş Yap
        </button>
      </form>

      {message && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
      
      <p style={{ marginTop: '20px' }}>
        Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
      </p>
    </div>
  );
};

export default Login;