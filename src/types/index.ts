import { ObjectId } from "mongoose";
import {Country}  from "../utils/countries";

// Enums for better type safety
export enum ShipmentStatus {
  PickedUp = "PickedUp",
  InTransit = "InTransit",
  EnRoute = "EnRoute",
  InCustoms = "InCustoms",
  AtHub = "AtHub",
  OutForDelivery = "OutForDelivery",
  Delivered = "Delivered",
  Delayed = "Delayed",
  Cancelled = "Cancelled"
}

export enum NotificationType {
  Email = "email"
}

export enum NotificationStatus {
  Pending = "pending",
  Sent = "sent",
  Failed = "failed"
}

// Country enum - adjust based on your actual countries
// export enum Country {
//   US = "United States",
//   UK = "United Kingdom",
//   CA = "Canada",
//   NG = "Nigeria",
//   // Add more countries as needed
// }

export interface IUser {
  _id: string | ObjectId;
  username: string;
  email: string;
  password: string;
}

// Address for hubs (origin/destination)
export interface IHubAddress {
  address: string;
  city: string;
  country: Country;
  zipCode: string;
}

// Personal sender/receiver information
export interface IPersonInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: Country;
  zipCode: string;
}

// Package information

export interface IPackage {
  weight: number;          // in kg
  dimensions: string;      // e.g., "30x20x15 cm"
  description: string;
  declaredValue?: number;
}

// Shipment interface
export interface IShipment {
  _id?: string | ObjectId;
  trackingCode: string;
  
  sender: IPersonInfo;
  receiver: IPersonInfo;

  package: IPackage;

  origin: IHubAddress;         // warehouse/hub
  destination: IHubAddress;    // warehouse/hub

  status: ShipmentStatus;      // current status (Registered, InTransit, etc.)

  sentAt?: Date; 
  estimatedDelivery: Date;
}

// Tracking event interface
export interface ITrackingEvent {
  _id?: string | ObjectId;
  shipmentId: string;
  status: ShipmentStatus;
  city: string;
  country: Country;
  note?: string;
  timestamp: Date;
}

export interface INotification {
  _id?: string | ObjectId;
  shipmentId: string;
  type: NotificationType;
  recipient: string;       // email or phone
  message: string;
  sentAt?: Date;
  status: NotificationStatus;
}

export interface ITrackingLocation {
  hubName?: string;
  address?: string;
  city: string;
  country: Country;
  zipCode?: string;
  contactName?: string;
  contactPhone?: string;
}