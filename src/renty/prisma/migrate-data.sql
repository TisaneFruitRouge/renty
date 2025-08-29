-- Migration script to preserve data when moving to lease system
-- This script should be run BEFORE applying the Prisma schema changes

BEGIN;

-- Create lease records for properties that have tenants
INSERT INTO lease (
    id,
    "propertyId",
    "startDate", 
    "endDate",
    "rentAmount",
    "depositAmount",
    charges,
    "leaseType",
    "isFurnished",
    "paymentFrequency",
    currency,
    status,
    notes,
    "createdAt",
    "updatedAt"
)
SELECT 
    CONCAT('lease_', gen_random_uuid()),
    p.id,
    COALESCE(p."rentedSince", p."createdAt", NOW()),
    NULL, -- endDate
    COALESCE(
        CAST(p."rentDetails"->>'baseRent' AS DECIMAL), 
        0
    ) as "rentAmount",
    p."depositAmount",
    COALESCE(
        CAST(p."rentDetails"->>'charges' AS DECIMAL), 
        0
    ) as charges,
    CASE 
        WHEN tenant_count.count > 1 THEN 'COLOCATION'::enum_lease_leasetype
        ELSE 'INDIVIDUAL'::enum_lease_leasetype
    END as "leaseType",
    COALESCE(p."isFurnished", false),
    COALESCE(p."paymentFrequency", 'monthly'),
    COALESCE(p.currency, 'EUR'),
    'ACTIVE'::enum_lease_leasestatus,
    CONCAT('Migrated from property: ', p.title),
    NOW(),
    NOW()
FROM property p
INNER JOIN (
    SELECT 
        "propertyId",
        COUNT(*) as count
    FROM tenant 
    WHERE "propertyId" IS NOT NULL
    GROUP BY "propertyId"
) tenant_count ON p.id = tenant_count."propertyId";

-- Update tenants to reference the new leases
UPDATE tenant 
SET "leaseId" = l.id
FROM lease l
WHERE tenant."propertyId" = l."propertyId"
AND tenant."propertyId" IS NOT NULL;

-- Verify the migration worked
DO $$
DECLARE
    tenant_count INTEGER;
    lease_count INTEGER;
    unlinked_tenants INTEGER;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM tenant WHERE "propertyId" IS NOT NULL;
    SELECT COUNT(*) INTO lease_count FROM lease;
    SELECT COUNT(*) INTO unlinked_tenants FROM tenant WHERE "propertyId" IS NOT NULL AND "leaseId" IS NULL;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE 'Tenants with property assignments: %', tenant_count;
    RAISE NOTICE 'Leases created: %', lease_count;
    RAISE NOTICE 'Tenants still unlinked: %', unlinked_tenants;
    
    IF unlinked_tenants > 0 THEN
        RAISE EXCEPTION 'Migration failed: % tenants are still unlinked to leases', unlinked_tenants;
    END IF;
END $$;

COMMIT;

-- Show final state
SELECT 
    p.title as property_title,
    l.id as lease_id,
    l."leaseType",
    l."rentAmount",
    l.charges,
    COUNT(t.id) as tenant_count,
    STRING_AGG(t."firstName" || ' ' || t."lastName", ', ') as tenants
FROM property p
LEFT JOIN lease l ON p.id = l."propertyId"
LEFT JOIN tenant t ON l.id = t."leaseId"
GROUP BY p.id, p.title, l.id, l."leaseType", l."rentAmount", l.charges
ORDER BY p.title;