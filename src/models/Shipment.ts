import mongoose, { Schema, Document, Model } from 'mongoose';
import { 
  IShipment, 
  IPerson, 
  IAddress, 
  IPackage,
  ShipmentStatus, 
} from '../types';
import {countries}  from "../utils/countries";

// Mongoose document type
export interface IShipmentDocument extends Omit<IShipment, '_id'>, Document {}

// Schema definitions
const PersonSchema = new Schema<IPerson>({
  name:           { type: String, required: true },
  email:          { type: String, required: true, lowercase: true, trim: true },
  phoneNumber:          { type: String, required: true, trim: true },
  address:        { type: String, required: true },  // or rename → addressLine1
  city:           { type: String, required: true },
  country:        { type: String, enum: countries, required: true},
  zipCode:        { type: String },
  companyName:    { type: String },
  alternatePhone: { type: String, trim: true },
}, { _id: false });


const AddressSchema = new Schema<IAddress>({
  address:   { type: String, required: true },
  city:      { type: String, required: true },
  country:   { type: String, enum: countries, required: true},
  zipCode:   { type: String },
}, { _id: false });

//enum: Object.values(Country), 

const PackageSchema = new Schema<IPackage>({
  weightKg:          { type: Number, required: true, min: 0 },
  dimensions:        { type: String, required: true, trim: true },
  description:       { type: String, required: true, trim: true },
  declaredValue:     { type: Number, min: 0 },
  quantity:          { type: Number, min: 1, default: 1 },
  isFragile:         { type: Boolean, default: false },
  requiresSignature: { type: Boolean, default: false },
}, { _id: false });

// Main Shipment Schema
const ShipmentSchema = new Schema<IShipmentDocument>({
  trackingId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  sender: { 
    type: PersonSchema, 
    required: true 
  },
  
  receiver: { 
    type: PersonSchema, 
    required: true 
  },

  package: { 
    type: PackageSchema, 
    required: true 
  },

  origin: { 
    type: AddressSchema, 
    required: true 
  },
  
  destination: { 
    type: AddressSchema, 
    required: true 
  },

  status: {
    type: String,
    enum: Object.values(ShipmentStatus),
    required: true,
    default: ShipmentStatus.InTransit
  },

  currentLocation: {
  type: {
    name:         { type: String, trim: true },
    address:      { type: String, trim: true },
    city:         { type: String, trim: true },
    country:      { type: String, enum: countries },
    zipCode:      { type: String },
    contactName:  { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    arrivedAt:    Date,
    departedAt:   Date,
  },
  required: false,
  _id: false,
}, 

  registeredAt: {
    type: Date,
    default: Date.now,
    required: true
  },

  estimatedDelivery: { 
    type: Date, 
    required: true 
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
ShipmentSchema.index({ trackingId: 1 });
ShipmentSchema.index({ status: 1 });
ShipmentSchema.index({ 'sender.email': 1 });
ShipmentSchema.index({ 'receiver.email': 1 });

// Model
export const Shipment: Model<IShipmentDocument> = mongoose.model<IShipmentDocument>(
  'Shipment', 
  ShipmentSchema
);