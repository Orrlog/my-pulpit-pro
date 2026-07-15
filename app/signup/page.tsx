import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";
export const metadata = { title: "Create Account | My Pulpit Pro" };
export default function SignupPage() { return <AuthCard title="Create your account." description="Start with secure account access. You will confirm your email before the account is active."><SignupForm /></AuthCard>; }
