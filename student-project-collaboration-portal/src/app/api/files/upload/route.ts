import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectFiles } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const groupId = formData.get("groupId") as string;
    const projectId = formData.get("projectId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Try Cloudinary upload
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    let fileUrl = "";
    let publicId = "";

    if (cloudName && apiKey && apiSecret) {
      try {
        const { v2: cloudinary } = await import("cloudinary");
        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: "auto", folder: "projectlink" }, (err, result) => {
              if (err) reject(err);
              else resolve(result as { secure_url: string; public_id: string });
            })
            .end(buffer);
        });

        fileUrl = result.secure_url;
        publicId = result.public_id;
      } catch (cloudErr) {
        console.error("Cloudinary error:", cloudErr);
        // Fallback to data URL for demo
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        fileUrl = `data:${file.type};base64,${base64.slice(0, 100)}...`;
        publicId = `local_${Date.now()}`;
      }
    } else {
      // Demo mode - store file metadata without actual upload
      fileUrl = `/api/files/placeholder?name=${encodeURIComponent(file.name)}`;
      publicId = `demo_${Date.now()}`;
    }

    const [savedFile] = await db
      .insert(projectFiles)
      .values({
        projectId: projectId || null,
        groupId: groupId || null,
        uploadedById: session.id,
        fileName: file.name,
        fileUrl,
        fileType: file.type,
        fileSize: file.size,
        publicId,
      })
      .returning();

    return NextResponse.json({ file: savedFile }, { status: 201 });
  } catch (error) {
    console.error("Upload file error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
