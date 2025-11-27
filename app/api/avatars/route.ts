import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import pool from "@/lib/db"

const headers = {
  "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/tiff",
]

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM avatars ORDER BY position")
    return NextResponse.json(rows, { headers })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Lỗi kết nối database" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const position = formData.get("position") as string

    if (!file || !position) {
      return NextResponse.json({ error: "Thiếu file hoặc position" }, { status: 400 })
    }

    const isValidImage = file.type.startsWith("image/") || ALLOWED_MIME_TYPES.includes(file.type)
    if (!isValidImage) {
      return NextResponse.json({ error: "File không phải là ảnh hợp lệ" }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")
    await mkdir(uploadDir, { recursive: true })

    const originalName = file.name.toLowerCase()
    let ext = originalName.split(".").pop() || "jpg"

    // Normalize some extensions
    if (ext === "jpeg") ext = "jpg"

    const fileName = `${position}-${Date.now()}.${ext}`
    const filePath = path.join(uploadDir, fileName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const dbPath = `/uploads/avatars/${fileName}`

    await pool.execute(
      `INSERT INTO avatars (position, file_path) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE file_path = VALUES(file_path)`,
      [position, dbPath],
    )

    return NextResponse.json({ success: true, path: dbPath })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Lỗi upload" }, { status: 500 })
  }
}
