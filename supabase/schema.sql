-- ============ CONTRACTS BUCKET ============
DROP POLICY IF EXISTS "Allow uploads contracts" ON storage.objects;
CREATE POLICY "Allow uploads contracts"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'contracts');

DROP POLICY IF EXISTS "Allow reads contracts" ON storage.objects;
CREATE POLICY "Allow reads contracts"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'contracts');

-- ============ INVOICES BUCKET ============
DROP POLICY IF EXISTS "Allow uploads invoices" ON storage.objects;
CREATE POLICY "Allow uploads invoices"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'invoices');

DROP POLICY IF EXISTS "Allow reads invoices" ON storage.objects;
CREATE POLICY "Allow reads invoices"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'invoices');

-- ============ REVIEW-PHOTOS BUCKET ============
DROP POLICY IF EXISTS "Allow uploads review-photos" ON storage.objects;
CREATE POLICY "Allow uploads review-photos"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Allow reads review-photos" ON storage.objects;
CREATE POLICY "Allow reads review-photos"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'review-photos');