import { promises as fs } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const filePath = join(process.cwd(), "public/TOKEN_UTILITY.md");
    const content = await fs.readFile(filePath, "utf-8");
    return Response.json({ content });
  } catch (error) {
    return Response.json({ error: "Failed to read token utility" }, { status: 500 });
  }
}