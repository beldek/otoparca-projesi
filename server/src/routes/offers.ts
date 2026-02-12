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
            images: imagePaths
        });

        const savedOffer = await newOffer.save();

        const targetRequest = await RequestModel.findById(requestId) as any;
        if (targetRequest) {
            targetRequest.offerCount = (targetRequest.offerCount || 0) + 1;
            await targetRequest.save();

            // --- WHATSAPP BİLDİRİMİ: MÜŞTERİYE ---
            const msg = `🚀 TEKLİF GELDİ!\n\n"${targetRequest.partName}" talebiniz için ${price} TL tutarında bir teklif aldınız. Detaylar için uygulamayı kontrol edin!`;
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
        const offer = await Offer.findById(req.params.offerId).populate('request');
        if (!offer) return res.status(404).json({ message: 'Teklif bulunamadı.' });

        offer.isAccepted = true;
        await offer.save();

        const request = await RequestModel.findByIdAndUpdate(
            offer.request, 
            { status: 'completed' },
            { new: true }
        ) as any;

        // --- WHATSAPP BİLDİRİMİ: TEDARİKÇİYE ---
        const msg = `✅ TEKLİFİNİZ ONAYLANDI!\n\n${offer.price} TL tutarındaki teklifiniz müşteri tarafından ONAYLANDI. Parçayı hazırlamaya başlayabilirsiniz. Bereketli olsun! 📦`;
        await sendWhatsApp(msg);

        res.json({ message: 'Onaylandı ve bildirim gönderildi.' });
    } catch (error) {
        res.status(500).json({ message: 'Onay hatası.' });
    }
});

router.get('/:requestId', async (req: Request, res: Response) => {
    try {
        const offers = await Offer.find({ request: req.params.requestId }).populate('supplier', 'name');
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Teklifler getirilemedi.' });
    }
});

export default router;