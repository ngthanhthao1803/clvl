import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["deposit", "full_payment", "split_bill", "refund", "payout"],
      default: "deposit",
    },
    paymentMethod: {
      type: String,
      enum: ["vietqr_escrow", "vietqr_p2p", "mock_bank"],
      default: "vietqr_escrow",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "escrow_held",
        "completed",
        "refunded",
        "forfeited_to_host",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    transferContent: { type: String, required: true, trim: true },
    qrCodeUrl: { type: String, trim: true },
    paidAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
    escrowReleasedAt: { type: Date, default: null },
    refundReason: { type: String, trim: true, default: "" },
    proofImage: { type: String, trim: true, default: "" },
    bankTransactionId: { type: String, trim: true, default: "" },
    gateway: { type: String, trim: true, default: "" },
    payoutBankInfo: {
      bankId: { type: String, trim: true, default: "" },
      bankName: { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "" },
      accountHolder: { type: String, trim: true, default: "" },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

paymentSchema.index({ session: 1, payer: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);
