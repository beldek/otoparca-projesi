import mongoose, { Schema, Document } from 'mongoose';

export interface IRequest extends Document {
  user: mongoose.Types.ObjectId;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    vin?: string;       
    version?: string;   // EKLENDİ (Paket/Motor)
    fuel?: string;      // EKLENDİ
    bodyType?: string;  // EKLENDİ
    color?: string;     // EKLENDİ
  };
  partName: string;
  description: string;
  images: string[];
  status: 'active' | 'completed' | 'cancelled';
  offerCount: number;
}

const RequestSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    vin: { type: String },
    version: { type: String },   // <--- Veritabanı alanı açıldı
    fuel: { type: String },      // <--- Veritabanı alanı açıldı
    bodyType: { type: String },  // <--- Veritabanı alanı açıldı
    color: { type: String }      // <--- Veritabanı alanı açıldı
  },
  partName: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  status: { type: String, default: 'active' },
  offerCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IRequest>('Request', RequestSchema);