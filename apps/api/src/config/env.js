import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "JWT_SECRET", "CLIENT_ORIGIN"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientOrigin: process.env.CLIENT_ORIGIN,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY ?? "",
  escrowBankBin: process.env.ESCROW_BANK_BIN ?? "970426",
  escrowBankName: process.env.ESCROW_BANK_NAME ?? "MSB (Ngân hàng Hàng Hải)",
  escrowBankShortName: process.env.ESCROW_BANK_SHORT_NAME ?? "MSB",
  escrowAccountNo: process.env.ESCROW_ACCOUNT_NO ?? "04201015822962",
  escrowAccountName: process.env.ESCROW_ACCOUNT_NAME ?? "HOÀNG HỮU TOÀN",
  payosClientId: process.env.PAYOS_CLIENT_ID ?? "",
  payosApiKey: process.env.PAYOS_API_KEY ?? "",
  payosChecksumKey: process.env.PAYOS_CHECKSUM_KEY ?? "",
};
