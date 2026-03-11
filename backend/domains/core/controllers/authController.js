const authService = require("../services/authService");

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      res.json(data);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  async logout(req, res) {
    try {
      await authService.logout();
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCurrentUser(req, res) {
    try {
      const user = await authService.getCurrentUser();
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = authController;
