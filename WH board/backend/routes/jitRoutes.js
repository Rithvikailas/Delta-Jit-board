const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/WorkOrders');

// Create or Update Work Order
router.post('/update', async (req, res) => {
    const { workOrder, line, time, hiMaterial, assemblyMaterial, packingMaterial } = req.body;

    try {
        const existingWorkOrder = await WorkOrder.findOne({ workOrder });
        if (existingWorkOrder) {
            existingWorkOrder.line = line;
            existingWorkOrder.time = time;
            existingWorkOrder.hiMaterial = hiMaterial;
            existingWorkOrder.assemblyMaterial = assemblyMaterial;
            existingWorkOrder.packingMaterial = packingMaterial;
            await existingWorkOrder.save();
        } else {
            const newWorkOrder = new WorkOrder({ workOrder, line, time, hiMaterial, assemblyMaterial, packingMaterial });
            await newWorkOrder.save();
        }
        res.status(200).json({ message: 'Work Order updated successfully' });
    } catch (error) {
        console.error('Error creating or updating Work Order:', error);
        res.status(500).json({ error: 'Error updating Work Order' });
    }
});

// Get all work orders
router.get('/all', async (req, res) => {
    try {
        const workOrders = await WorkOrder.find({});
        res.status(200).json(workOrders);
    } catch (error) {
        console.error('Error fetching Work Orders:', error);
        res.status(500).json({ error: 'Error fetching Work Orders' });
    }
});

// Delete a work order
router.delete('/delete/:id', async (req, res) => {
    try {
        await WorkOrder.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Work Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting Work Order:', error);
        res.status(500).json({ error: 'Error deleting Work Order' });
    }
});

module.exports = router;
