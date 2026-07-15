import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
export const metadata = { title: "Forgot Password | My Pulpit Pro" };
export default function ForgotPasswordPage(){return <AuthCard title="Reset your password." description="Enter your email and we will send a secure reset link."><ForgotPasswordForm /></AuthCard>}
