import mongoose, { Schema, Document, Model } from 'mongoose';
import { 
  IShipment, 
  IPersonInfo, 
  IHubAddress, 
  IPackage,
  ShipmentStatus, 
} from '../types';
import {Country}  from "../utils/countries";

// Mongoose document type
export interface IShipmentDocument extends Omit<IShipment, '_id'>, Document {}

// Schema definitions
const PersonInfoSchema = new Schema<IPersonInfo>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true }
}, { _id: false });

const HubAddressSchema = new Schema<IHubAddress>({
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true }
}, { _id: false });

//enum: Object.values(Country), 

const PackageSchema = new Schema<IPackage>({
  weight: { type: Number, required: true, min: 0 },
  dimensions: { type: String, required: true },
  description: { type: String, required: true },
  declaredValue: { type: Number, min: 0 }
}, { _id: false });

// Main Shipment Schema
const ShipmentSchema = new Schema<IShipmentDocument>({
  trackingCode: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  sender: { 
    type: PersonInfoSchema, 
    required: true 
  },
  
  receiver: { 
    type: PersonInfoSchema, 
    required: true 
  },

  package: { 
    type: PackageSchema, 
    required: true 
  },

  origin: { 
    type: HubAddressSchema, 
    required: true 
  },
  
  destination: { 
    type: HubAddressSchema, 
    required: true 
  },

  status: {
    type: String,
    enum: Object.values(ShipmentStatus),
    required: true,
    default: ShipmentStatus.PickedUp
  },

  estimatedDelivery: { 
    type: Date, 
    required: true 
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
ShipmentSchema.index({ trackingCode: 1 });
ShipmentSchema.index({ status: 1 });
ShipmentSchema.index({ 'sender.email': 1 });
ShipmentSchema.index({ 'receiver.email': 1 });

// Model
export const Shipment: Model<IShipmentDocument> = mongoose.model<IShipmentDocument>(
  'Shipment', 
  ShipmentSchema
);