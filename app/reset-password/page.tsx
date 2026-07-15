import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
export const metadata = { title: "Reset Password | My Pulpit Pro" };
export default function ResetPasswordPage(){return <AuthCard title="Choose a new password." description="Use the secure session from your reset email to update your password."><ResetPasswordForm /></AuthCard>}
