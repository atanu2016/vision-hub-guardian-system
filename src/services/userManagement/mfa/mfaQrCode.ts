
/**
 * Generates a QR code URL for MFA enrollment
 */
export async function generateQrCodeUrl(
  email: string | undefined,
  secret: string
): Promise<string> {
  try {
    // Create OTP auth URL (RFC 6238)
    const appName = 'VisionHub';
    const userIdentifier = email || 'user';
    const otpAuthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userIdentifier)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
    
    // Use a QR code generation API
    // In a production app, consider using a local QR code generator
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
