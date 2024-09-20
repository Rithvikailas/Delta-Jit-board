const mongoose = require('mongoose');

const WorkOrderSchema = new mongoose.Schema({
    workOrder: { type: String, required: true },
    line: { type: String, required: true },
    time: { type: Date, required: true },
    hiMaterial: { type: String, required: true },
    assemblyMaterial: { type: String, required: true },
    packingMaterial: { type: String, required: true },
});

module.exports = mongoose.model('WorkOrder', WorkOrderSchema);
