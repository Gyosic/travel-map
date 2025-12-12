import nodemailer from "nodemailer";

// Gmail SMTP Transporter 생성
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * 이메일 인증 메일 발송
 * @param email 수신자 이메일
 * @param token 인증 토큰
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.SITE_BASEURL}/auth/verify-email?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "이메일 인증을 완료해주세요",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">이메일 인증</h2>
          <p>안녕하세요!</p>
          <p>회원가입을 완료하려면 아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #4CAF50;
                      color: white;
                      padding: 12px 24px;
                      text-decoration: none;
                      border-radius: 4px;
                      display: inline-block;">
              이메일 인증하기
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:
          </p>
          <p style="color: #999; font-size: 12px; word-break: break-all;">
            ${verificationUrl}
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            이 링크는 24시간 동안 유효합니다.
          </p>
          <p style="color: #999; font-size: 12px;">
            본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.
          </p>
        </div>
      `,
    });

    return info;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("이메일 발송에 실패했습니다.");
  }
}
