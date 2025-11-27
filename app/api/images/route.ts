import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import pool from "@/lib/db"

const headers = {
  "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
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
  "image/x-icon",
]

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM images ORDER BY created_at DESC")
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

    if (!file) {
      return NextResponse.json({ error: "Không có file" }, { status: 400 })
    }

    const isValidImage = file.type.startsWith("image/") || ALLOWED_MIME_TYPES.includes(file.type)
    if (!isValidImage) {
      return NextResponse.json({ error: "File không phải là ảnh hợp lệ" }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    const originalName = file.name.toLowerCase()
    let ext = originalName.split(".").pop() || "jpg"

    // Normalize some extensions
    if (ext === "jpeg") ext = "jpg"

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
    const filePath = path.join(uploadDir, fileName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const dbPath = `/uploads/${fileName}`
    await pool.execute("INSERT INTO images (file_path, original_name) VALUES (?, ?)", [dbPath, file.name])

    return NextResponse.json({ success: true, path: dbPath })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Lỗi upload" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    await pool.execute("DELETE FROM images WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Lỗi xóa" }, { status: 500 })
  }
}
