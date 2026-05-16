import { redirect } from "next/navigation";

export default function SignUpPage({ params }: { params: Promise<{ lang: string }> }) {
  // 手机号登录即自动注册，重定向到登录页面
  redirect("/sign-in");
}
