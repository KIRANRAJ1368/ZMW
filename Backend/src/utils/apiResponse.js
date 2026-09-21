/**
 * Consistent success envelope for every endpoint:
 *   { success: true, data, meta? }
 * Keeping this in one place means every controller returns the same shape.
 */
function sendSuccess(res, { statusCode = 200, data = null, meta = null, message = null } = {}) {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
