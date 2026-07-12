import { NextResponse } from "next/server";

const RESULT_SERVICE_URL = "https://nounupdate.com/get-result-url.php";
const OFFICIAL_RESULT_HOST = "erp.nou.edu.ng";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { matricNo?: unknown };
    const matricNo = typeof body.matricNo === "string" ? body.matricNo.toUpperCase().replace(/[^A-Z0-9/-]/g, "") : "";

    if (matricNo.length < 6 || matricNo.length > 30) {
      return NextResponse.json({ success: false, message: "Enter a valid matriculation number." }, { status: 400, headers: noIndexHeaders() });
    }

    const upstream = await fetch(RESULT_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ matric_no: matricNo }),
      cache: "no-store",
    });
    const data = (await upstream.json()) as { success?: boolean; final_url?: unknown; message?: string };

    if (!upstream.ok || !data.success || typeof data.final_url !== "string") {
      return NextResponse.json({ success: false, message: data.message || "No result link was returned." }, { status: 502, headers: noIndexHeaders() });
    }

    const finalUrl = new URL(data.final_url);
    if (finalUrl.protocol !== "https:" || finalUrl.hostname !== OFFICIAL_RESULT_HOST) {
      return NextResponse.json({ success: false, message: "The result service returned an unsafe destination." }, { status: 502, headers: noIndexHeaders() });
    }

    return NextResponse.json({ success: true, finalUrl: finalUrl.toString() }, { headers: noIndexHeaders() });
  } catch {
    return NextResponse.json({ success: false, message: "The result service is unavailable. Try again shortly." }, { status: 502, headers: noIndexHeaders() });
  }
}

function noIndexHeaders() {
  return { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" };
}
