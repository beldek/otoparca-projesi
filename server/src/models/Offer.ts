import mongoose, { Schema, Document } from 'mongoose';

// TypeScript için Tip Tanımı (Interface)
export interface IOffer extends Document {
  request: mongoose.Types.ObjectId;
  supplier: mongoose.Types.ObjectId;
  price: number;
  condition: string;
  description: string;
  isAccepted: boolean;
  images: string[]; // <--- İŞTE EKSİK OLAN KISIM BURASIYDI
  createdAt: Date;
}

// Veritabanı Şeması (Schema)
const OfferSchema: Schema = new Schema({
  request: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
  supplier: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  condition: { type: String, required: true }, // 'new' | 'used' | 'refurbished'
  description: { type: String },
  isAccepted: { type: Boolean, default: false },
  
  // Resimlerin Yolları (Örn: ["/uploads/resim1.jpg", "/uploads/resim2.jpg"])
  images: { 
    type: [String], 
    default: [] 
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Modeli Dışarı Aktar (IOffer tipini kullanarak)
export default mongoose.model<IOffer>('Offer', OfferSchema);