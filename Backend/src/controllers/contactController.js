const { ContactSubmission } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");
const { getPagination, buildMeta } = require("../utils/pagination");

async function create(req, res) {
  const submission = await ContactSubmission.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || null,
    subject: req.body.subject || null,
    message: req.body.message,
    status: "new"
  });
  return sendSuccess(res, {
    statusCode: 201,
    message: "Thanks — we'll get back to you shortly.",
    data: { id: submission.id }
  });
}

async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const { rows, count } = await ContactSubmission.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset
  });
  return sendSuccess(res, { data: rows, meta: buildMeta({ page, limit, count }) });
}

async function getById(req, res) {
  const submission = await ContactSubmission.findByPk(req.params.id);
  if (!submission) throw ApiError.notFound("Submission not found");
  if (submission.status === "new") {
    submission.status = "read";
    await submission.save();
  }
  return sendSuccess(res, { data: submission });
}

async function updateStatus(req, res) {
  const submission = await ContactSubmission.findByPk(req.params.id);
  if (!submission) throw ApiError.notFound("Submission not found");
  submission.status = req.body.status;
  await submission.save();
  return sendSuccess(res, { data: submission });
}

async function remove(req, res) {
  const submission = await ContactSubmission.findByPk(req.params.id);
  if (!submission) throw ApiError.notFound("Submission not found");
  await submission.destroy();
  return sendSuccess(res, { message: "Submission deleted" });
}

module.exports = { create, list, getById, updateStatus, remove };
