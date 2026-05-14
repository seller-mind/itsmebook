import { NextRequest, NextResponse } from "next/server";

// POST /api/upload
// 上传孩子照片 - 使用Supabase Storage（Vercel serverless兼容）
// 注意：未配置Supabase时返回模拟响应，不影响前端开发

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const userId = formData.get("userId") as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "没有上传文件" },
        { status: 400 }
      );
    }

    if (files.length > 3) {
      return NextResponse.json(
        { error: "最多只能上传3张照片" },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `不支持的文件类型: ${file.type}` },
          { status: 400 }
        );
      }

      // 验证文件大小（5MB）
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `文件 ${file.name} 超过5MB限制` },
          { status: 400 }
        );
      }
    }

    // 检查Supabase是否配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      // Mock模式：未配置Supabase时返回模拟响应
      const mockFiles = files.map((file, index) => ({
        id: `mock-${Date.now()}-${index}`,
        filename: `photo-${index + 1}.jpg`,
        url: `https://images.unsplash.com/photo-${1500000000000 + index}?w=400`,
        mock: true,
      }));

      return NextResponse.json({
        success: true,
        data: mockFiles,
        mock: true,
      });
    }

    // 使用Supabase Storage上传
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey!);

    const uploadedFiles: Array<{ id: string; filename: string; url: string }> =
      [];

    for (const file of files) {
      const fileId = crypto.randomUUID();
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${userId || "guest"}/${fileId}.${ext}`;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { error: uploadError } = await supabase.storage
        .from("user-photos")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          { error: "上传失败，请稍后重试" },
          { status: 500 }
        );
      }

      // 获取公开URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-photos").getPublicUrl(filePath);

      uploadedFiles.push({
        id: fileId,
        filename: `${fileId}.${ext}`,
        url: publicUrl,
      });
    }

    return NextResponse.json({
      success: true,
      data: uploadedFiles,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "上传失败，请稍后重试" },
      { status: 500 }
    );
  }
}

// DELETE /api/upload
// 删除上传的照片
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");
    const userId = searchParams.get("userId");

    if (!filePath) {
      return NextResponse.json(
        { error: "缺少文件路径" },
        { status: 400 }
      );
    }

    // 安全检查：防止路径遍历攻击
    if (filePath.includes("..")) {
      return NextResponse.json(
        { error: "无效的文件路径" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      return NextResponse.json({
        success: true,
        message: "文件已删除（mock模式）",
      });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey!);

    const { error } = await supabase.storage
      .from("user-photos")
      .remove([`${userId || "guest"}/${filePath}`]);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "删除失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "文件已删除",
    });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "删除失败，请稍后重试" },
      { status: 500 }
    );
  }
}
