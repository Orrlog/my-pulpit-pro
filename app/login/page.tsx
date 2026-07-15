import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
export const metadata = { title: "Log In | My Pulpit Pro" };
export default function LoginPage() { return <AuthCard title="Log in to your preparation desk." description="Access your sermon workflow while keeping your existing local drafts in this browser."><Suspense><LoginForm /></Suspense></AuthCard>; }
