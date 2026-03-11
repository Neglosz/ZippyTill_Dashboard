const taxService = require("../services/taxService");

const taxController = {
    async getTaxSummary(req, res) {
        try {
            const { branchId, year, period } = req.query;
            const data = await taxService.getTaxSummary(
                branchId,
                year || new Date().getFullYear(),
                period,
            );
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = taxController;
