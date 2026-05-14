import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServerKey = supabaseServiceRoleKey || supabasePublishableKey;

export function hasSupabaseServerCredentials() {
  return Boolean(supabaseUrl && supabaseServerKey);
}

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServerKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServerKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getReviewsBucketName() {
  return process.env.SUPABASE_REVIEWS_BUCKET || "review-photos";
}

export function getInvoicesBucketName() {
  return process.env.SUPABASE_INVOICES_BUCKET || "invoices";
}
