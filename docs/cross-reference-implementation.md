# Cross-Reference Implementation Guide

This document outlines the implementation plan for adding cross-referencing functionality to the parts catalog system.

## Database Schema Changes

### New Models

```prisma
model PartNumber {
  id          Int      @id @default(autoincrement())
  number      String   @unique
  type        String   // OEM, Aftermarket, etc.
  product     Product  @relation(fields: [productId], references: [id])
  productId   Int
  manufacturer String  // Manufacturer of this specific part number
  isOriginal  Boolean @default(false)  // Whether this is the original/primary part number
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Cross reference relationships
  crossReferencesTo    CrossReference[] @relation("SourcePartNumber")
  crossReferencesFrom  CrossReference[] @relation("TargetPartNumber")
}

model CrossReference {
  id                Int         @id @default(autoincrement())
  sourcePartNumber  PartNumber  @relation("SourcePartNumber", fields: [sourcePartNumberId], references: [id])
  sourcePartNumberId Int
  targetPartNumber  PartNumber  @relation("TargetPartNumber", fields: [targetPartNumberId], references: [id])
  targetPartNumberId Int
  confidenceLevel   Int?        // Optional: indicate how confident we are in this cross-reference (e.g., 1-100)
  notes             String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@unique([sourcePartNumberId, targetPartNumberId])  // Prevent duplicate cross-references
}
```

### Modifications to Existing Product Model

```prisma
model Product {
  // ... existing fields ...
  partNumbers      PartNumber[]
  // ... rest of existing fields ...
}
```

## Implementation Steps

1. **Database Migration**
   ```bash
   npx prisma migrate dev --name add_cross_reference_support
   ```

2. **Example Usage Code**

```typescript
// Create a product with part numbers
const product = await prisma.product.create({
  data: {
    name: "Brake Pad",
    description: "High performance brake pad",
    price: 99.99,
    stock: 100,
    brandId: 1,
    modelId: 1,
    categoryId: 1,
    partNumbers: {
      create: {
        number: "BP-123",
        type: "OEM",
        manufacturer: "Toyota",
        isOriginal: true
      }
    }
  }
});

// Add cross-references
const crossReference = await prisma.crossReference.create({
  data: {
    sourcePartNumberId: 1, // Original part number ID
    targetPartNumberId: 2, // Compatible part number ID
    confidenceLevel: 100,
    notes: "Direct replacement"
  }
});
```

3. **Query Example**

```typescript
// Query product with all cross-references
const productWithCrossRefs = await prisma.product.findUnique({
  where: { id: 1 },
  include: {
    partNumbers: {
      include: {
        crossReferencesTo: {
          include: {
            targetPartNumber: true
          }
        },
        crossReferencesFrom: {
          include: {
            sourcePartNumber: true
          }
        }
      }
    }
  }
});
```

4. **API Endpoint Implementation**

```typescript
// Get all cross-references for a part number
router.get('/cross-references/:partNumber', async (req, res) => {
  try {
    const { partNumber } = req.params;
    
    const partWithCrossRefs = await prisma.partNumber.findUnique({
      where: { number: partNumber },
      include: {
        product: true,
        crossReferencesTo: {
          include: {
            targetPartNumber: {
              include: { product: true }
            }
          }
        },
        crossReferencesFrom: {
          include: {
            sourcePartNumber: {
              include: { product: true }
            }
          }
        }
      }
    });

    if (!partWithCrossRefs) {
      return res.status(404).json({ error: 'Part number not found' });
    }

    // Combine both directions of cross-references
    const allCrossReferences = [
      ...partWithCrossRefs.crossReferencesTo.map(cr => ({
        partNumber: cr.targetPartNumber.number,
        manufacturer: cr.targetPartNumber.manufacturer,
        product: cr.targetPartNumber.product,
        confidenceLevel: cr.confidenceLevel,
        notes: cr.notes
      })),
      ...partWithCrossRefs.crossReferencesFrom.map(cr => ({
        partNumber: cr.sourcePartNumber.number,
        manufacturer: cr.sourcePartNumber.manufacturer,
        product: cr.sourcePartNumber.product,
        confidenceLevel: cr.confidenceLevel,
        notes: cr.notes
      }))
    ];

    res.json({
      partNumber: partWithCrossRefs.number,
      product: partWithCrossRefs.product,
      crossReferences: allCrossReferences
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cross-references' });
  }
});
```

## Key Features

1. Multiple part numbers per product
2. Support for both OEM and aftermarket parts
3. Confidence level system for cross-references
4. Manufacturer tracking
5. Notes and documentation support
6. Bi-directional querying capability

## Implementation Benefits

1. Clear distinction between different part types
2. Easy filtering in database queries
3. Flexibility for future expansion
4. Maintains data integrity
5. Simple to implement in both frontend and backend

## Next Steps

1. Create a new branch for implementation
2. Apply database migrations
3. Implement API endpoints
4. Add frontend components for cross-reference display
5. Add search functionality for cross-references
6. Implement cross-reference management in admin panel 