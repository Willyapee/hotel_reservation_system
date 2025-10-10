// controllers/servicesController.js
import MsServices from '../models/msServices.js';

// GET ALL SERVICES
export const getAllServices = async (req, res) => {
    try {
        const services = await MsServices.findAll({
            order: [['name', 'ASC']]
        });
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET SERVICE BY ID
export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await MsServices.findByPk(id);
        
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        
        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// CREATE SERVICE (admin only)
export const createService = async (req, res) => {
    try {
        const { name, desc, service_price, unit } = req.body;
        
        const service = await MsServices.create({
            name,
            desc,
            service_price,
            unit
        });
        
        res.status(201).json({ message: "Service created successfully", service });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};