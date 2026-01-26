// services/dashboardService.ts
import { Shipment } from "../models/Shipment";
import { ShipmentStatus } from "../types";

// ─── GET TOTAL SHIPMENTS COUNT ───
export const getTotalShipmentsCount = async () => {
    const total = await Shipment.countDocuments();
    return {
        success: true,
        data: { total },
    };
};

// ─── GET SHIPMENTS BY STATUS ───
export const getShipmentsByStatus = async () => {
    const statuses = Object.values(ShipmentStatus);
    
    const statusCounts = await Promise.all(
        statuses.map(async (status) => {
            const count = await Shipment.countDocuments({ status });
            return { status, count };
        })
    );

    const total = statusCounts.reduce((sum, item) => sum + item.count, 0);

    return {
        success: true,
        data: {
            byStatus: statusCounts,
            total,
        },
    };
};

// ─── GET RECENT SHIPMENTS ───
export const getRecentShipments = async (limit: number = 10) => {
    const shipments = await Shipment.find()
        .select("trackingId status sender.name receiver.name receiver.city receiver.country estimatedDelivery createdAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return {
        success: true,
        data: {
            shipments,
            count: shipments.length,
        },
    };
};

// ─── GET SHIPMENTS BY COUNTRY ───
export const getShipmentsByCountry = async () => {
    // Top origin countries
    const topOrigins = await Shipment.aggregate([
        {
            $group: {
                _id: "$origin.country",
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
            $project: {
                _id: 0,
                country: "$_id",
                count: 1,
            },
        },
    ]);

    // Top destination countries
    const topDestinations = await Shipment.aggregate([
        {
            $group: {
                _id: "$destination.country",
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
            $project: {
                _id: 0,
                country: "$_id",
                count: 1,
            },
        },
    ]);

    return {
        success: true,
        data: {
            topOrigins,
            topDestinations,
        },
    };
};

// ─── GET SHIPMENTS BY TIME PERIOD ───
export const getShipmentsByTimePeriod = async () => {
    const now = new Date();
    
    // Today (start of day to now)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const today = await Shipment.countDocuments({
        createdAt: { $gte: startOfToday },
    });

    // This week (Monday to now)
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const thisWeek = await Shipment.countDocuments({
        createdAt: { $gte: startOfWeek },
    });

    // This month (1st of month to now)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = await Shipment.countDocuments({
        createdAt: { $gte: startOfMonth },
    });

    // Last 30 days
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);
    const last30 = await Shipment.countDocuments({
        createdAt: { $gte: last30Days },
    });

    return {
        success: true,
        data: {
            today,
            thisWeek,
            thisMonth,
            last30Days: last30,
        },
    };
};

// ─── GET POPULAR ROUTES ───
export const getPopularRoutes = async (limit: number = 10) => {
    const routes = await Shipment.aggregate([
        {
            $group: {
                _id: {
                    origin: "$origin.country",
                    destination: "$destination.country",
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
            $project: {
                _id: 0,
                route: {
                    $concat: ["$_id.origin", " → ", "$_id.destination"],
                },
                origin: "$_id.origin",
                destination: "$_id.destination",
                count: 1,
            },
        },
    ]);

    return {
        success: true,
        data: {
            routes,
            count: routes.length,
        },
    };
};

// ─── GET DASHBOARD OVERVIEW (ALL STATS) ───
export const getDashboardOverview = async () => {
    const [
        totalCount,
        statusBreakdown,
        recentShipments,
        countryStats,
        timePeriodStats,
        popularRoutes,
    ] = await Promise.all([
        getTotalShipmentsCount(),
        getShipmentsByStatus(),
        getRecentShipments(10),
        getShipmentsByCountry(),
        getShipmentsByTimePeriod(),
        getPopularRoutes(10),
    ]);

    return {
        success: true,
        data: {
            totalShipments: totalCount.data.total,
            shipmentsByStatus: statusBreakdown.data.byStatus,
            recentShipments: recentShipments.data.shipments,
            topOrigins: countryStats.data.topOrigins,
            topDestinations: countryStats.data.topDestinations,
            timePeriod: timePeriodStats.data,
            popularRoutes: popularRoutes.data.routes,
        },
    };
};

export default {
    getTotalShipmentsCount,
    getShipmentsByStatus,
    getRecentShipments,
    getShipmentsByCountry,
    getShipmentsByTimePeriod,
    getPopularRoutes,
    getDashboardOverview,
};