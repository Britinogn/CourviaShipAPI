import { ObjectId } from "mongoose";
import {Country}  from "../utils/countries";

// Enums for better type safety
export enum ShipmentStatus {
  Registered = "Registered",
  PickedUp = "PickedUp",
  InTransit = "InTransit",
  EnRoute = "EnRoute",
  InCustoms = "InCustoms",
  AtHub = "AtHub",
  OutForDelivery = "OutForDelivery",
  Delivered = "Delivered",
  Delayed = "Delayed",
  Cancelled = "Cancelled",
  Exception = "Exception"
}

export enum NotificationType {
  Email = "email",
  Sms = "sms"
}

export enum NotificationStatus {
  Pending = "pending",
  Sent = "sent",
  Failed = "failed"
}

export interface IUser {
  _id: string | ObjectId;
  username: string;
  email: string;
  password: string;
}

export interface IPerson extends IAddress{
  name: string;
  email: string;
  phone: string;
  companyName?: string;          
  alternatePhone?: string;
}

// Address for person (origin/destination)
export interface IAddress {
  address: string;
  city: string;
  country: Country;
  zipCode?: string;
}


// Package information
export interface IPackage {
  weightKg: number;          // in kg
  dimensions: string;      // e.g., "30x20x15 cm"
  description: string;
  declaredValue?: number;       // in sender's currency
  quantity?: number;               // ← added: useful for multiple identical items
  isFragile?: boolean;
  requiresSignature?: boolean;
}

// Shipment interface
export interface IShipment {
  _id?: string | ObjectId;
  trackingId: string;
  
  sender: IPerson;
  receiver: IPerson;

  package: IPackage;

  origin: IAddress;         // pickup location
  destination: IAddress;    // delivery location    

  status: ShipmentStatus;      

  registeredAt: Date; 
  estimatedDelivery: Date;

  currentLocation?: ITrackingLocation;
}

// Tracking shipment interface
export interface ITrackingShipment {
  trackingId: string;             
  sender: Pick<IPerson, "name" | "city" | "country">; 
  receiver: Pick<IPerson, "name" | "city" | "phone" | "country">;

  status: ShipmentStatus;      
  destination: IAddress;
  country: Country;
  currentLocation?: ITrackingLocation;
  note?: string;

  registeredAt: Date;
  estimatedDelivery: Date; 
}


export interface INotification {
  _id?: string | ObjectId;
  trackingId: string;
  type: NotificationType;
  recipient: string;       // email or phone
  message: string;
  sentAt: Date;
  status: NotificationStatus;
}

export interface ITrackingLocation {
  name?: string;                  
  address?: string;
  city: string;
  country: Country;
  zipCode?: string;
  contactName?: string;
  contactPhone?: string;
  arrivedAt?: Date;
  departedAt?: Date;
}