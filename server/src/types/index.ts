import { Document,Types } from "mongoose";



export interface   IUser extends Document{
    name :string;
    email: string;
    password?:string;
    phone :string;
    role: 'customer' | 'supplier' | 'admin';

    companyDetails?:{
        companyName:string;
        city:string;
        taxNumber:string;
    };

    createdAt:Date;
    updatedAt:Date;
}

export interface IRequest extends Document{

    customer :Types.ObjectId | IUser;

    vehicle:{
        brand :string;
        model:string;
        year :number;
        fuelType :'diesel' | 'gasoline' | 'lpg' | 'electric'| 'hybrit';
        vin?:string;
    }
    partName:string;
    description?:string;
    photos: string[];
    status: 'active' | 'completed' | 'cancelled';
    offerCount :number;

    createdAt:Date;
    updateAt:Date;
}


export interface IOffer extends Document{

    request:Types.ObjectId | IRequest;
    supplier: Types.ObjectId | IUser;
    price: number;
    currency: 'TRY' | 'USD' | 'EUR';
    condition: 'new' | 'used' | 'refurbished';
    description?: string; 
    photos: string[];
    isAccepted: boolean;
    createdAt: Date;
    updatedAt: Date;


}
