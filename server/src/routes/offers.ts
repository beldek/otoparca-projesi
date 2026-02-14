import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import Offer from '../models/Offer';
import RequestModel from '../models/Request';
import { sendWhatsApp } from '../services/whatsappService';

const router = express.Router();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// 1. TEKLİF GÖNDER (POST /api/offers)
router.post('/', upload.array('images', 3), async (req: Request, res: Response) => {
    try {
        const { requestId, supplierId, price, condition, description } = req.body;
        const files = (req as any).files;
        const imagePaths = files ? files.map((f: any) => '/uploads/' + f.filename) : [];

        const newOffer = new Offer({
            request: requestId,
            supplier: supplierId,
            price: Number(price),
            condition,
            description,
            images: imagePaths,
            status: 'pending' // Varsayılan durum
        });

        const savedOffer = await newOffer.save();

        const targetRequest = await RequestModel.findById(requestId);
        if (targetRequest) {
            targetRequest.offerCount = (targetRequest.offerCount || 0) + 1;
            await targetRequest.save();

            const msg = `🚀 TEKLİF GELDİ!\n\n"${targetRequest.partName}" talebiniz için ${price} TL tutarında bir teklif aldınız.`;
            await sendWhatsApp(msg);
        }

        res.status(201).json(savedOffer);
    } catch (error) {
        console.error("Teklif Hatası:", error);
        res.status(500).json({ message: 'Teklif iletilemedi.' });
    }
});

// 2. TEKLİF ONAYLA (PUT /api/offers/accept/:offerId)
router.put('/accept/:offerId', async (req: Request, res: Response) => {
    try {
        // SONUNA "as any" EKLEDİK: Bu TypeScript'in şikayet etmesini durdurur
        const offer = await Offer.findById(req.params.offerId).populate('request') as any;
        
        if (!offer) return res.status(404).json({ message: 'Teklif bulunamadı.' });

        // Artık burada kırmızı çizgi çıkmayacak
        offer.status = 'accepted'; 
        
        // Eğer modelinde isAccepted varsa bunu da yapabilirsin
        if ('isAccepted' in offer) {
            offer.isAccepted = true;
        }

        await offer.save();

        // İlgili talebi kapat (Request modelini bulup status'u güncelle)
        await RequestModel.findByIdAndUpdate(
            offer.request._id || offer.request, 
            { status: 'completed' }
        );

        res.json({ message: 'Onaylandı ve bildirim gönderildi.' });
    } catch (error) {
        console.error("Onay hatası:", error);
        res.status(500).json({ message: 'Onay hatası.' });
    }
});

// 3. TEKLİFLERİ LİSTELE (GET /api/offers/:requestId)
// DİKKAT: URL'de "request" kelimesi yok, direkt ID bekliyor.
router.get('/:requestId', async (req: Request, res: Response) => {
    try {
        const offers = await Offer.find({ request: req.params.requestId })
            .populate('supplier', 'name companyName phone');
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Teklifler getirilemedi.' });
    }
});

export default router;