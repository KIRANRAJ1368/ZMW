const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Drop this in after a chain of express-validator checks:
 *   router.post("/x", [body("name").notEmpty()], validate, controller.create)
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  throw ApiError.badRequest("Validation failed", details);
}

module.exports = validate;
