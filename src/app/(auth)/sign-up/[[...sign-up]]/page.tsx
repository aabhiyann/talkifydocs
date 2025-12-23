import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={{
          baseTheme: undefined,
          variables: {
            colorBackground: "#000000",
            colorInputBackground: "#1a1a1a",
            colorInputText: "#ffffff",
            colorText: "#ffffff",
            colorTextSecondary: "#a3a3a3",
            colorPrimary: "#3b82f6",
            colorDanger: "#ef4444",
            colorSuccess: "#22c55e",
            colorNeutral: "#737373",
            borderRadius: "0.75rem",
          },
          elements: {
            card: "shadow-xl border border-gray-800 bg-black backdrop-blur",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "border-gray-700 bg-gray-900 text-white hover:bg-gray-800",
            formButtonPrimary: "bg-primary-600 hover:bg-primary-700 text-white",
            formFieldInput: "bg-gray-900 border-gray-700 text-white placeholder:text-gray-500",
            formFieldLabel: "text-gray-300",
            footerActionLink: "text-primary-500 hover:text-primary-400",
            identityPreviewText: "text-white",
            formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-300",
            otpCodeFieldInput: "border-gray-700 bg-gray-900 text-white",
            formResendCodeLink: "text-primary-500 hover:text-primary-400",
            dividerLine: "bg-gray-700",
            dividerText: "text-gray-500",
          },
        }}
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
