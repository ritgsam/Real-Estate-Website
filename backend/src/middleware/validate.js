const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const issues = error.issues || error.errors;
    if (issues) {
      const firstMessage = issues[0]?.message || 'Validation failed';
      return res.status(400).json({
        success: false,
        message: firstMessage,
        errors: issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

module.exports = validate;
