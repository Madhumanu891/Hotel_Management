// Welcome email — sent when a new guest registers
const welcomeEmail = (name) => ({
  subject: `Welcome to ${process.env.FROM_NAME || 'NexoraHotels'}!`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #6d28d9; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">NexoralHotels</h1>
        <p style="color: #ddd6fe; margin: 8px 0 0;">Your premium stay experience</p>
      </div>

      <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1e1b4b;">Welcome, ${name}!</h2>
        <p style="color: #374151; line-height: 1.6;">
          Your account has been created successfully. You can now book rooms,
          manage your reservations, and earn loyalty points with every stay.
        </p>

        <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="color: #6d28d9; margin-top: 0;">Your Loyalty Benefits</h3>
          <ul style="color: #374151; line-height: 1.8;">
            <li>Earn <strong>10 points</strong> for every ₹100 spent</li>
            <li><strong>Silver tier</strong> at 500 points — early check-in</li>
            <li><strong>Gold tier</strong> at 1000 points — free breakfast</li>
            <li><strong>Platinum tier</strong> at 2000 points — suite upgrades</li>
          </ul>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          If you did not create this account, please ignore this email.
        </p>
      </div>
    </div>
  `,
});



// Password reset email — sent when user requests password reset
const passwordResetEmail = (resetURL) => ({
  subject: 'Password Reset Request',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #6d28d9; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">NexoralHotels</h1>
      </div>

      <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1e1b4b;">Reset Your Password</h2>
        <p style="color: #374151; line-height: 1.6;">
          You requested a password reset. Click the button below to set a new password.
          This link expires in <strong>10 minutes</strong>.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetURL}"
             style="background: #6d28d9; color: white; padding: 14px 32px;
                    border-radius: 6px; text-decoration: none; font-weight: bold;
                    font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="color: #374151; font-size: 14px;">
          Or copy this link into your browser:
        </p>
        <p style="color: #6d28d9; font-size: 13px; word-break: break-all;">
          ${resetURL}
        </p>

        <p style="color: #6b7280; font-size: 13px; margin-top: 32px;">
          If you did not request this, ignore this email. Your password will not change.
        </p>
      </div>
    </div>
  `,
});

module.exports = { welcomeEmail, passwordResetEmail };