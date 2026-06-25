CREATE INDEX IF NOT EXISTS "Shop_city_idx" ON "Shop"("city");
CREATE INDEX IF NOT EXISTS "Shop_lat_lng_idx" ON "Shop"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "Shop_approvalStatus_lat_idx" ON "Shop"("approvalStatus", "latitude");
