import { CheckCircle } from 'lucide-react';

interface VerifySuccessProps {
  onNavigate: (page: string) => void;
}

export const VerifySuccess = ({ onNavigate }: VerifySuccessProps) => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-[#FAF6F1] to-[#E8D5C4]/30 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-12 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle className="text-white" size={80} strokeWidth={3} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#264025] mb-6">
            Email Verified Successfully!
          </h1>

          <p className="text-xl text-[#82896E] mb-8 leading-relaxed">
            Your email has been verified. You can now sign in to your account and start booking appointments.
          </p>

          <div className="bg-gradient-to-br from-[#DDCBB7]/30 to-[#E8D5C4]/20 rounded-2xl p-8 mb-10 border-2 border-[#DDCBB7]">
            <h2 className="text-2xl font-bold text-[#264025] mb-4">What's Next?</h2>
            <ul className="text-left space-y-3 text-[#82896E]">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#C17B5C] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#264025] font-medium">Sign in with your email and password</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#C17B5C] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#264025] font-medium">Browse our services and choose your treatment</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#C17B5C] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#264025] font-medium">Book your appointment with just a few clicks</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate('auth')}
            className="w-full bg-gradient-to-r from-[#AD6B4B] to-[#C17B5C] text-white px-10 py-5 rounded-full text-xl font-bold hover:from-[#7B4B36] hover:to-[#AD6B4B] transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Sign In to Your Account
          </button>

          <div className="mt-6">
            <button
              onClick={() => onNavigate('home')}
              className="text-[#AD6B4B] hover:text-[#7B4B36] font-semibold transition-colors duration-300"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
