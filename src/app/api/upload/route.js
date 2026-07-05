import { getSession } from "../../../lib/session";

export const maxDuration = 30;

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

// Supabase Storage'a görsel yükler (public "site-images" bucket'ı gerekli).
// Kullanım: FormData { file } → { url }
export async function POST(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let form;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "FormData bekleniyor." }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file === "string")
    return Response.json({ error: "Dosya bulunamadı." }, { status: 400 });

  if (!ALLOWED.includes(file.type))
    return Response.json({ error: "Nur JPG, PNG oder WebP erlaubt." }, { status: 400 });

  if (file.size > MAX_SIZE)
    return Response.json({ error: "Datei zu groß (max. 8 MB)." }, { status: 400 });

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SECRET_KEY;

  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `uploads/${session.id}/${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const res = await fetch(`${sbUrl}/storage/v1/object/site-images/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sbKey}`,
      apikey: sbKey,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Storage upload hatası:", res.status, text);
    return Response.json(
      { error: `Upload fehlgeschlagen (${res.status}). "site-images" bucket'ının mevcut ve public olduğundan emin olun.` },
      { status: 502 }
    );
  }

  const url = `${sbUrl}/storage/v1/object/public/site-images/${path}`;
  return Response.json({ ok: true, url });
}
