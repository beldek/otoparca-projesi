import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Rota Dosyalarını İçe Aktar (Senin dosya isimlerinle uyumlu)
import authRoutes from './routes/auth';
import requestRoutes from './routes/requests';
import offerRoutes from './routes/offers'; // Eğer offer.ts varsa
// import whatsappRoutes from './routes/whatsapp'; // Eğer ayrı bir dosya yaptıysan

// .env dosyasındaki verileri yükle
dotenv.config();

const app = express();

// --- 1. PORT AYARI (Render için Kritik) ---
// Render bize bir PORT verirse onu kullan, vermezse 5000'i kullan.
const PORT = process.env.PORT || 5000;

// --- 2. CORS AYARI (Frontend Erişimi İçin) ---
app.use(cors({
    // Güvenlik için sadece kendi frontend sitene izin verebilirsin
    // Şimdilik '*' diyerek herkese açıyoruz ki hata alma.
    // Canlıya geçince buraya Vercel linkini yazacağız: ['https://otoparca.vercel.app']
    origin: '*', 
    credentials: true
}));

// JSON verilerini okuyabilmek için
app.use(express.json());

// --- 3. RESİM DOSYALARINI DIŞARI AÇMA ---
// Yüklenen resimlerin (uploads klasörü) tarayıcıda görünebilmesi için:
// 'uploads' klasörünü statik olarak sunuyoruz.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- 4. VERİTABANI BAĞLANTISI (Güvenli Yöntem) ---
// Şifreyi kodun içine YAZMIYORUZ. process.env'den çekiyoruz.
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("HATALI KONFİGÜRASYON: MONGO_URI .env dosyasında bulunamadı!");
    process.exit(1); // Bağlantı yoksa sunucuyu durdur
}

mongoose.connect(mongoURI)
    .then(() => console.log('✅ MongoDB Bağlantısı Başarılı!'))
    .catch((err) => console.error('❌ MongoDB Bağlantı Hatası:', err));

// --- 5. ROTALARI TANIMLA ---
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/offers', offerRoutes); 

// Ana Sayfa Test Rotası (Render'da sitenin çalıştığını görmek için)
app.get('/', (req, res) => {
    res.send('Oto Parça API Sunucusu Çalışıyor! 🚀');
});

// --- 6. SUNUCUYU BAŞLAT ---
app.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
});