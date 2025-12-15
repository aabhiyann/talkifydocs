import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            card: "shadow-lg border border-border/60 bg-background/95 backdrop-blur",
          },
        }}
        // After successful sign in, Clerk will redirect here
        redirectUrl="/dashboard"
      />
    </div>
  );
}


