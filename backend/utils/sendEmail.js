import nodemailer from "nodemailer";

/**
 * Gửi email sử dụng Nodemailer.
 *
 * @param {object} options - Tùy chọn gửi email.
 * @param {string} options.email - Địa chỉ email người nhận.
 * @param {string} options.subject - Chủ đề email.
 * @param {string} options.message - Nội dung email (dạng HTML).
 */
const sendEmail = async (options) => {
  // 1. Tạo một 'transporter' (Đối tượng cấu hình dịch vụ mail)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // Kiểm tra port để xác định secure:
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App Password)
    },
  }); // 2. Định nghĩa các tùy chọn email

  const mailOptions = {
    from: process.env.EMAIL_FROM, // Hiển thị tên người gửi
    to: options.email,
    subject: options.subject,
    html: options.message,
  }; // 3. Gửi email

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email đã gửi thành công");
  } catch (error) {
    console.error(
      `❌ LỖI GỬI EMAIL: ${error.message}. Kiểm tra EMAIL_HOST, PORT và PASS.`
    );
  }
};

export default sendEmail;
