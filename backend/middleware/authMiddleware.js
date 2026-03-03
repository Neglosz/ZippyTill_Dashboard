const { supabase } = require("../config/supabase");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Auth] Missing or invalid authorization header");
      return res.status(401).json({ error: "Missing or invalid authorization token" });
    }

    const token = authHeader.split(" ")[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("[Auth] Supabase getUser error:", error?.message || "No user found");
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("[Auth] Middleware Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = authMiddleware;
