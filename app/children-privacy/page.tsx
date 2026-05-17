import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "儿童隐私保护",
  description: "是我呀关于儿童隐私保护的说明",
};

export default function ChildrenPrivacyPage() {
  // 本产品不收集儿童信息，儿童隐私保护说明已整合至隐私政策
  redirect("/privacy");
}
