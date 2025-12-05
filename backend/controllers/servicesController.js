import MsServices from '../models/msServices.js';

export const getAllServices = async (req, res) => {
	try {
		const services = await MsServices.findAll({
			order: [['name', 'ASC']],
		});
		res.json(services);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const getServiceById = async (req, res) => {
	try {
		const { id } = req.params;
		const service = await MsServices.findByPk(id);

		if (!service) {
			return res.status(404).json({ message: 'Service not found' });
		}

		res.json(service);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const createService = async (req, res) => {
	try {
		const { name, desc, service_price, unit } = req.body;

		const service = await MsServices.create({
			name,
			desc,
			service_price,
			unit,
		});

		res.status(201).json({ message: 'Service created successfully', service });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const updateService = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, desc, service_price, unit } = req.body;

		const service = await MsServices.findByPk(id);

		if (!service) {
			return res.status(404).json({ message: 'Service not found' });
		}

		await service.update({
			name,
			desc,
			service_price,
			unit,
		});

		res.json({ message: 'Service updated successfully', service });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const deleteServices = async (req, res) => {
	try {
		const { id } = req.params;
		const service = await MsServices.findByPk(id);

		if (!service) {
			return res.status(404).json({ message: 'Service not found' });
		}
		await service.destroy();
		res.json({ message: 'Service deleted successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};
