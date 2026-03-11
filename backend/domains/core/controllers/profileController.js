const profileService = require("../services/profileService");

const profileController = {
  async getProfile(req, res) {
    try {
      const user = req.user; // From authMiddleware
      const data = await profileService.getProfile(user.id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const user = req.user;
      const data = await profileService.updateProfile(user.id, req.body);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = profileController;
