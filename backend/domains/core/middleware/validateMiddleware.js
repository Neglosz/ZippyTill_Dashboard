const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "fail",
        message: "Validation Error",
        errors: error.errors.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = validate;
