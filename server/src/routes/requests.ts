import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import RequestModel from '../models/Request';
import Offer from '../models/Offer';
import { sendWhatsApp } from '../services/whatsappService';

const router = express.Router();

// --- MULTER YAPILANDIRMASI (Resim Yükleme) ---
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// ------------------------------------------
// 1. TALEP OLUŞTUR (POST /api/requests)
// ------------------------------------------
router.post('/', upload.array('images', 3), async (req: Request, res: Response) => {
    try {
        // Frontend'den gelen tüm detaylı araç bilgilerini alıyoruz
        const { 
            userId, 
            brand, model, year, 
            vin, version, fuel, bodyType, color, // Yeni alanlar
            partName, description 
        } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'Kullanıcı kimliği eksik.' });
        }

        const files = (req as any).files;
        const imagePaths = files ? files.map((f: any) => '/uploads/' + f.filename) : [];

        // Yeni talep nesnesini oluştur
        const newRequest = new RequestModel({
            user: userId, 
            vehicle: {
                brand,
                model,
                year: Number(year),
                vin: vin || '',           // Şasi No
                version: version || '',   // 1.6 TDI vb.
                fuel: fuel || '',         // Benzin/Dizel
                bodyType: bodyType || '', // Sedan/HB
                color: color || ''        // Renk
            },
            partName,
            description,
            images: imagePaths,
            status: 'active',
            offerCount: 0
        });

        const savedRequest = await newRequest.save();

        // --- WHATSAPP BİLDİRİMİ: TEDARİKÇİYE ---
        // Mesajı daha detaylı hale getirdik
        const detailText = version ? `(${version} - ${fuel})` : '';
        const msg = `📢 YENİ TALEP!\n\nAraç: ${brand} ${model} ${year} ${detailText}\nParça: "${partName}"\n\nTeklif vermek için sisteme girin! 🚀`;
        
        await sendWhatsApp(msg);

        res.status(201).json(savedRequest);
    } catch (error: any) {
        console.error("Talep Kayıt Hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
    }
});

// ------------------------------------------
// 2. TÜM TALEPLERİ LİSTELE (Tedarikçi Feed'i)
// ------------------------------------------
router.get('/', async (req: Request, res: Response) => {
    try {
        const requests = await RequestModel.find().sort({ createdAt: -1 }).lean();
        
        // Her talep için teklif sayısını ve ortalama fiyatı hesapla
        const requestsWithDetails = await Promise.all(requests.map(async (request: any) => {
            const offers = await Offer.find({ request: request._id });
            const total = offers.reduce((acc, offer) => acc + offer.price, 0);
            const avg = offers.length > 0 ? (total / offers.length).toFixed(2) : "0";
            
            return { 
                ...request, 
                offerCount: offers.length,
                averagePrice: avg 
            };
        }));
        
        res.json(requestsWithDetails);
    } catch (error) {
        res.status(500).json({ message: 'Talepler getirilemedi.' });
    }
});

// ------------------------------------------
// 3. KULLANICIYA ÖZEL TALEPLER (Müşteri Paneli)
// ------------------------------------------
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        
        const requests = await RequestModel.find({ user: userId }).sort({ createdAt: -1 }).lean();

        const requestsWithOffers = await Promise.all(requests.map(async (request: any) => {
            const count = await Offer.countDocuments({ request: request._id });
            return { ...request, offerCount: count };
        }));

        res.json(requestsWithOffers);
    } catch (error) {
        console.error("Kullanıcı talepleri hatası:", error);
        res.status(500).json({ message: 'Talepleriniz yüklenemedi.' });
    }
});

// ------------------------------------------
// 4. TEK BİR TALEP DETAYI (Detay Sayfası)
// ------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const request = await RequestModel.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Talep bulunamadı.' });
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Talep detayı getirilemedi.' });
    }
});

export default router;