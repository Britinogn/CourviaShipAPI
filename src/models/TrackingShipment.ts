import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITrackingShipment, ShipmentStatus } from '../types';
import { countries } from '../utils/countries';

export interface ITrackingDocument extends Omit<ITrackingShipment, '_id'>, Document {}

const SenderPersonSchema = new Schema({
    name:   { type: String, required: true, trim: true },
    city:   { type: String, required: true },
    country: { type: String, enum: countries, required: true },
}, { _id: false });

const ReceiverMinimalSchema = new Schema({
    name:   { type: String, required: true, trim: true },
    phoneNumber:  { type: String, required: true, trim: true },
    city:   { type: String, required: true },
    country: { type: String, enum: countries, required: true },
}, { _id: false });

const DestinationSchema = new Schema({
    address:   { type: String, required: true },
    city:      { type: String, required: true },
    country:   { type: String, enum: countries, required: true },
    zipCode:   { type: String },
}, { _id: false });

const TrackingSchema = new Schema<ITrackingDocument>({
    trackingId: {
        type: String,
        //type: Schema.Types.ObjectId, 
        ref: 'Shipment',
        required: true,
        unique: true,
        index: true,
    },

    // NEW: Reference to the main Shipment document
    // shipment: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Shipment',           // ← must match the model name you used in mongoose.model('Shipment', ...)
    //     required: true,
    //     index: true,
    // },

    sender: {
        type: SenderPersonSchema,
        required: true,
    },

    receiver: {
        type: ReceiverMinimalSchema,
        required: true,
    },

    status: {
        type: String,
        enum: Object.values(ShipmentStatus),
        required: true,
    },

    destination: {
        type: DestinationSchema,
        required: true,
    },

    registeredAt: {
        type: Date,
        default: Date.now,
        required: true,
    },

    estimatedDelivery: {
        type: Date,
        required: true,
    },

    currentLocation: {
        type: {
            name:         { type: String, trim: true },
            address:      { type: String, trim: true },
            city:         { type: String, required: true },
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

}, {
    timestamps: true,
    collection: 'trackings',   // clearer name
});

TrackingSchema.index({ trackingId: 1 });
TrackingSchema.index({ status: 1 });

export const Tracking: Model<ITrackingDocument> = mongoose.model<ITrackingDocument>(
    'Tracking', 
    TrackingSchema
);