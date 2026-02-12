import mongoose ,{Schema} from "mongoose";
import { IUser } from "../types";

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  
  role: { 
    type: String, 
    enum: ['customer', 'supplier', 'admin'], 
    default: 'customer' 
  },

  // Şirket detayları (Sadece 'supplier' ise dolu olabilir)
  companyDetails: {
    companyName: { type: String },
    city: { type: String },
    taxNumber: { type: String }
  }
}, { timestamps: true });


export default mongoose.model<IUser>('User',UserSchema);