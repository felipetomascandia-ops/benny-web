import { randomUUID } from "node:crypto";

import { fallbackReviews } from "@/lib/demo-data";
import { getReviewsBucketName, getSupabaseServerClient, hasSupabaseServerCredentials } from "@/lib/supabase";
import type { PublicReview } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function mapReviewRow(row: {
  id: string;
  name: string;
  rating: number;
  comment: string;
  photo_urls: string[] | null;
  created_at: string | null;
}): PublicReview {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    comment: row.comment,
    photoUrls: row.photo_urls || [],
    createdAt: row.created_at || undefined,
  };
}

export async function GET() {
  if (!hasSupabaseServerCredentials()) {
    return Response.json({ reviews: fallbackReviews });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return Response.json({ reviews: fallbackReviews });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id, name, rating, comment, photo_urls, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    return Response.json({ reviews: fallbackReviews });
  }

  return Response.json({
    reviews: data.map(mapReviewRow),
  });
}

export async function POST(request: Request) {
  if (!hasSupabaseServerCredentials()) {
    return Response.json(
      {
        error:
          "Supabase is not configured. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY (also supports NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
      },
      { status: 503 },
    );
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return Response.json({ error: "Supabase is unavailable." }, { status: 503 });
  }

  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const comment = String(formData.get("comment") || "").trim();
  const rating = Number(formData.get("rating") || 0);
  const photoFiles = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!name || !comment || !rating) {
    return Response.json({ error: "Name, rating, and review are required." }, { status: 400 });
  }

  const photoUrls: string[] = [];
  const bucket = getReviewsBucketName();

  for (const file of photoFiles.slice(0, 4)) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `reviews/${Date.now()}-${randomUUID()}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        cacheControl: "3600",
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return Response.json(
        { error: "The photo upload failed. Verify the Supabase bucket configuration." },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    photoUrls.push(publicUrl);
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      approved: true,
      comment,
      name,
      photo_urls: photoUrls,
      rating,
    })
    .select("id, name, rating, comment, photo_urls, created_at")
    .single();

  if (error || !data) {
    return Response.json({ error: "The review could not be saved." }, { status: 500 });
  }

  return Response.json({ review: mapReviewRow(data) }, { status: 201 });
}
