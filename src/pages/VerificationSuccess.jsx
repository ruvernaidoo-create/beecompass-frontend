import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function VerificationSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setEmail(session.user.email);
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 3000);
        } else {
          setStatus('already-verified');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center">
        
        {status === 'verifying' && (
          <>
            <div className="animate-spin text-4xl mb-4">🐝</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying...</h1>
            <p className="text-gray-600">Setting up your BEEcompass account</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Email Verified!</h1>
            <p className="text-gray-700 mb-4">
              Welcome to <strong>BEEcompass</strong>! 🐝
            </p>
            <p className="text-gray-600 mb-6">
              Your email <strong>{email}</strong> has been verified.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to dashboard in 3 seconds...
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded-lg transition"
            >
              Go to Dashboard Now
            </button>
          </>
        )}

        {status === 'already-verified' && (
          <>
            <div className="text-5xl mb-4">ℹ️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Already Verified</h1>
            <p className="text-gray-600 mb-6">
              Your email is already verified. Ready to get started?
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded-lg transition"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">
              Something went wrong. Please try again or contact support.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Back to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
}
