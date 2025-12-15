import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={{
          elements: {
            card: "shadow-lg border border-border/60 bg-background/95 backdrop-blur",
          },
        }}
        // After successful sign up, Clerk will redirect here
        redirectUrl="/dashboard"
      />
    </div>
  );
}


