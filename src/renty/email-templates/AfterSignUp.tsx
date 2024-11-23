interface AfterSignUpProps {
  name: string;
}

export default function AfterSignUp({ name }: AfterSignUpProps) {
  return (
    <div className="bg-white font-sans">
      <div className="max-w-2xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Renty, {name}! 🎉</h1>
          <p className="text-gray-600">We&apos;re excited to have you on board.</p>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-8">
          <a
            href="https://renty.cc/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Get Started
          </a>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p className="mb-2">Need help? Contact our support team at support@renty.cc</p>
          <p> 2024 Renty. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
