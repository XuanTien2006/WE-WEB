import { NextResponse } from "next/server"
import pool from "@/lib/db"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

// GET - Lấy ngày bắt đầu
export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT setting_value FROM settings WHERE setting_key = 'start_date'",
    )

    if (rows.length > 0) {
      return NextResponse.json(
        {
          startDate: rows[0].setting_value,
        },
        {
          headers: { "Cache-Control": "no-cache" },
        },
      )
    }

    return NextResponse.json({ startDate: null })
  } catch (error) {
    console.error("Error fetching start date:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// POST - Lưu ngày bắt đầu
export async function POST(req: Request) {
  try {
    const { startDate } = await req.json()

    // Sử dụng UPSERT
    await pool.execute<ResultSetHeader>(
      `INSERT INTO settings (setting_key, setting_value) 
       VALUES ('start_date', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [startDate],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving start date:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
