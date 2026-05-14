// Clerk兼容层
// 未配置Clerk Key时返回mock数据，配置后自动切换到真实Clerk

export function useUser() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    // 动态导入真实Clerk
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useUser: clerkUseUser } = require("@clerk/nextjs");
      return clerkUseUser();
    } catch {
      return { isSignedIn: false, isLoaded: true, user: null };
    }
  }
  return { isSignedIn: false, isLoaded: true, user: null };
}

export function useAuth() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useAuth: clerkUseAuth } = require("@clerk/nextjs");
      return clerkUseAuth();
    } catch {
      return { isSignedIn: false, isLoaded: true };
    }
  }
  return { isSignedIn: false, isLoaded: true };
}

// Mock组件
export function SignInButton({ children, ...props }: any) {
  return <button {...props}>{children || "登录"}</button>;
}

export function SignUpButton({ children, ...props }: any) {
  return <button {...props}>{children || "注册"}</button>;
}

export function UserButton(props: any) {
  return <div className="w-8 h-8 rounded-full bg-gray-300" />;
}
