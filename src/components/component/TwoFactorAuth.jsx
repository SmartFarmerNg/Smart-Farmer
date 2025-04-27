import { useState } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const TwoFactorAuth = () => {
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const accent = localStorage.getItem('accent') || '#0FA280';

    const auth = getAuth();

    const sendOTP = async () => {
        setError('');
        setMessage('');

        try {
            const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
            });

            const confirmation = await signInWithPhoneNumber(auth, phone, recaptcha);
            setVerificationId(confirmation.verificationId);
            setOtpSent(true);
            setMessage('OTP sent to your phone');
        } catch (err) {
            console.error(err);
            setError('Failed to send OTP: ' + err.message);
        }
    };

    const verifyOTP = async () => {
        try {
            const credential = await auth.PhoneAuthProvider.credential(verificationId, otp);
            await auth.currentUser.linkWithCredential(credential);
            setMessage('Two-factor authentication enabled');
            setOtpSent(false);
            setPhone('');
            setOtp('');
        } catch (err) {
            console.error(err);
            setError('Invalid OTP or linking failed');
        }
    };

    return (
        <div className="mt-10">
            <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication (2FA)</h3>
            <p className="text-sm text-gray-200 mb-4">
                Add an extra layer of security to your account by enabling 2FA via your phone number.
            </p>

            <div className="space-y-3">
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full bg-white/10 border border-white/10 p-3 rounded-lg text-white placeholder-gray-200"
                />

                {otpSent && (
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="w-full bg-white/10 border border-white/10 p-3 rounded-lg text-white placeholder-gray-200"
                    />
                )}

                {error && <p className="text-red-400 text-sm">{error}</p>}
                {message && <p className="text-green-400 text-sm">{message}</p>}

                {!otpSent ? (
                    <button
                        onClick={sendOTP}
                        className="bg-white hover:bg-white/70 transition-colors text-white py-2 px-4 rounded-lg font-medium"
                        style={{ backgroundColor: accent }}
                    >
                        Send OTP
                    </button>
                ) : (
                    <button
                        onClick={verifyOTP}
                        className="bg-green-600 hover:bg-green-700 transition-colors text-white py-2 px-4 rounded-lg font-medium"
                    >
                        Verify OTP
                    </button>
                )}
            </div>

            <div id="recaptcha-container"></div>
        </div>
    );
};

export default TwoFactorAuth;
