import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { connectDb } from "../src/config/db.js";
import { User } from "../src/models/User.js";

async function run() {
  await connectDb();

  const targetEmail = process.argv[2]?.trim().toLowerCase();
  const targetPassword = process.argv[3]?.trim();

  if (targetEmail) {
    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.log(`\n⚠️  Không tìm thấy tài khoản với email: ${targetEmail}`);
      console.log(`➡️  Đang tiến hành tạo tài khoản Admin mới với email này...`);
      user = new User({
        email: targetEmail,
        name: "Admin " + targetEmail.split("@")[0],
        password: targetPassword || "AdminPassword123!",
        role: "admin",
        isActive: true,
        isVerifiedHost: true,
        skillLevel: "Pro",
        reputation: 100,
        city: "Hồ Chí Minh",
        firebaseUid: `local_admin_${Date.now()}`,
      });
      await user.save();
      console.log(`\n🎉 THÀNH CÔNG: Đã tạo tài khoản Quản Trị Viên tối cao!`);
      console.log(`-----------------------------------------------`);
      console.log(`📧 Email:    ${user.email}`);
      console.log(`🔑 Mật khẩu: ${targetPassword || "AdminPassword123!"}`);
      console.log(`👑 Vai trò:  ${user.role} (Quyền hạn lớn nhất)`);
      console.log(`-----------------------------------------------\n`);
    } else {
      user.role = "admin";
      user.isActive = true;
      user.isVerifiedHost = true;
      if (targetPassword) {
        user.password = targetPassword;
      }
      await user.save();
      console.log(`\n🎉 THÀNH CÔNG: Đã nâng cấp tài khoản thành Quản Trị Viên tối cao!`);
      console.log(`-----------------------------------------------`);
      console.log(`👤 Tên:      ${user.name}`);
      console.log(`📧 Email:    ${user.email}`);
      console.log(`👑 Vai trò:  ${user.role} (Quyền hạn lớn nhất)`);
      console.log(`⚡ Kích hoạt: Có`);
      if (targetPassword) {
        console.log(`🔑 Mật khẩu đã đặt lại: ${targetPassword}`);
      }
      console.log(`-----------------------------------------------\n`);
    }
  } else {
    // Không truyền tham số -> Tạo hoặc cập nhật tài khoản admin mặc định: admin@clvl.vn
    const defaultEmail = "admin@clvl.vn";
    const defaultPassword = "AdminPassword123!";
    let admin = await User.findOne({ email: defaultEmail });

    if (admin) {
      admin.role = "admin";
      admin.isActive = true;
      admin.isVerifiedHost = true;
      admin.password = defaultPassword;
      await admin.save();
      console.log(`\n✅ Đã cập nhật tài khoản Admin mặc định sẵn có!`);
    } else {
      admin = new User({
        name: "Quản Trị Viên Tối Cao",
        email: defaultEmail,
        password: defaultPassword,
        phone: "0988888888",
        role: "admin",
        isActive: true,
        isVerifiedHost: true,
        skillLevel: "Pro",
        reputation: 100,
        city: "Hồ Chí Minh",
        firebaseUid: `local_superadmin_${Date.now()}`,
      });
      await admin.save();
      console.log(`\n🎉 THÀNH CÔNG: Đã khởi tạo tài khoản Quản Trị Viên mặc định!`);
    }

    console.log(`-----------------------------------------------`);
    console.log(`🛡️ THÔNG TIN TÀI KHOẢN ADMIN CAO NHẤT:`);
    console.log(`📧 Email:    ${defaultEmail}`);
    console.log(`🔑 Mật khẩu: ${defaultPassword}`);
    console.log(`👑 Vai trò:  admin (Toàn quyền quản trị hệ thống)`);
    console.log(`-----------------------------------------------\n`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("Lỗi khi tạo tài khoản admin:", err);
  process.exit(1);
});
