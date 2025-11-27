// app/api/notes/route.ts
import { type NextRequest, NextResponse } from "next/server";

// Lazy load pool
async function getPool() {
  const { default: pool } = await import("@/lib/db");
  return pool;
}

export async function GET() {
  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT * FROM notes ORDER BY position");
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Notes GET error:", error);
    return NextResponse.json({ error: "Lỗi database" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { position, content } = await request.json();
    if (position === undefined || content === undefined) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const pool = await getPool();
    await pool.query("UPDATE notes SET content = ? WHERE position = ?", [content, position]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Notes PUT error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}
