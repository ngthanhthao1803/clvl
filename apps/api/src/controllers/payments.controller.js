import * as paymentsService from "../services/payments.service.js";

export async function getBanksController(req, res, next) {
  try {
    const banks = paymentsService.getBanksList();
    res.json({ success: true, data: { banks } });
  } catch (error) {
    next(error);
  }
}

export async function createDepositOrderController(req, res, next) {
  try {
    const { sessionId } = req.body;
    const userId = req.user.sub;
    const result = await paymentsService.createDepositOrder({ sessionId, userId });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function confirmEscrowPaymentController(req, res, next) {
  try {
    const { orderCode } = req.body;
    const userId = req.user.sub;
    const result = await paymentsService.confirmEscrowPayment({ orderCode, userId });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function cancelBookingWithRefundController(req, res, next) {
  try {
    const { sessionId, reason } = req.body;
    const userId = req.user.sub;
    const result = await paymentsService.cancelBookingWithRefund({ sessionId, userId, reason });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function checkInController(req, res, next) {
  try {
    const { sessionId, checkInCode } = req.body;
    const userId = req.user.sub;
    const result = await paymentsService.checkInPlayer({ sessionId, userId, checkInCode });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function markNoShowController(req, res, next) {
  try {
    const { sessionId, targetUserId } = req.body;
    const hostId = req.user.sub;
    const result = await paymentsService.markPlayerNoShow({ sessionId, hostId, targetUserId });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function reportDisputeController(req, res, next) {
  try {
    const { sessionId, type, reason, evidenceImages } = req.body;
    const reporterId = req.user.sub;
    const result = await paymentsService.reportDispute({
      sessionId,
      reporterId,
      type,
      reason,
      evidenceImages,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function releasePayoutController(req, res, next) {
  try {
    const { sessionId } = req.body;
    const hostId = req.user.sub;
    const result = await paymentsService.releasePayoutToHost({ sessionId, hostId });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getSessionPaymentsController(req, res, next) {
  try {
    const { sessionId } = req.params;
    const payments = await paymentsService.getSessionPayments(sessionId);
    res.json({ success: true, data: { payments } });
  } catch (error) {
    next(error);
  }
}
