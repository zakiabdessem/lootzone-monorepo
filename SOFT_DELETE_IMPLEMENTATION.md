# Soft Delete Implementation for Products

## Overview
This implementation provides **soft delete** functionality for products, meaning products are never permanently removed from the database. Instead, they are marked as inactive (`isActive = false`), which hides them from the storefront while preserving all data for potential restoration.

## Security Benefit
✅ **Protection against critical access**: Even if someone gains unauthorized access to the admin dashboard, they cannot permanently delete products. All "deleted" products can be easily restored.

---

## Backend Implementation (TRPC API)

### Location
`apps/trpc-app/src/server/api/routers/product.ts`

### New Endpoints

#### 1. Single Product Soft Delete
```typescript
delete: adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Sets isActive = false
    await ctx.db.product.update({
      where: { id: input.id },
      data: { isActive: false },
    });
    return { success: true, id: input.id };
  })
```

**Usage:**
```typescript
const result = await trpc.product.delete.mutate({ id: "product-id" });
```

#### 2. Bulk Product Soft Delete
```typescript
bulkDelete: adminProcedure
  .input(z.object({ ids: z.array(z.string()).min(1).max(100) }))
  .mutation(async ({ input, ctx }) => {
    // Sets isActive = false for multiple products
    const result = await ctx.db.product.updateMany({
      where: { id: { in: input.ids } },
      data: { isActive: false },
    });
    return { success: true, count: result.count, ids: input.ids };
  })
```

**Usage:**
```typescript
const result = await trpc.product.bulkDelete.mutate({ 
  ids: ["id1", "id2", "id3"] 
});
```

#### 3. Restore Single Product
```typescript
restore: adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Sets isActive = true
    await ctx.db.product.update({
      where: { id: input.id },
      data: { isActive: true },
    });
    return { success: true, id: input.id };
  })
```

#### 4. Bulk Restore Products
```typescript
bulkRestore: adminProcedure
  .input(z.object({ ids: z.array(z.string()).min(1).max(100) }))
  .mutation(async ({ input, ctx }) => {
    // Sets isActive = true for multiple products
    const result = await ctx.db.product.updateMany({
      where: { id: { in: input.ids } },
      data: { isActive: true },
    });
    return { success: true, count: result.count, ids: input.ids };
  })
```

---

## Frontend Implementation (Admin Dashboard)

### Location
`apps/admin/src/app/(dashboard)/products/page.tsx`

### Features Added

#### 1. **Single Product Delete Button**
- Red delete icon button on each product row
- Opens confirmation dialog before deleting
- Shows loading state during deletion
- Disabled state while operation is in progress

#### 2. **Bulk Delete (Toolbar)**
- Delete button appears when products are selected
- Opens bulk confirmation dialog
- Shows count of selected products
- Processes multiple deletions in one API call

#### 3. **Confirmation Dialogs**
- **Single Delete Dialog**: Shows product title and confirmation message
- **Bulk Delete Dialog**: Shows count of selected products
- Both explain that it's a soft delete and products can be restored
- Cancel and Delete buttons with loading states

#### 4. **Success/Error Notifications**
- Snackbar notifications for all operations
- Success message: "Product soft deleted successfully"
- Bulk success: "X product(s) soft deleted successfully"
- Error messages with detailed error information
- Auto-dismisses after 6 seconds

---

## Database Schema

### Existing Field Used
```prisma
model Product {
  id          String   @id @default(cuid())
  // ... other fields
  isActive    Boolean  @default(true)
  // ... other fields
}
```

- **`isActive = true`**: Product is visible on storefront
- **`isActive = false`**: Product is soft deleted (hidden but preserved)

---

## User Flow

### Deleting a Single Product
1. Admin clicks delete icon (🗑️) on product row
2. Confirmation dialog appears with product name
3. Admin clicks "Delete" button
4. Product is marked as inactive
5. Success notification appears
6. Product list refreshes automatically

### Bulk Deleting Products
1. Admin selects multiple products using checkboxes
2. Delete button appears in toolbar
3. Admin clicks delete button
4. Bulk confirmation dialog shows count
5. Admin confirms deletion
6. All selected products marked as inactive
7. Success notification with count appears
8. Selection clears and list refreshes

### Restoring Products (Future Enhancement)
- Add a "Show Deleted Products" filter/tab
- Display soft-deleted products with "Restore" button
- Use `restore` or `bulkRestore` mutations

---

## Benefits

### ✅ Safety
- **No data loss**: All product data, variants, images, and relationships are preserved
- **Easy recovery**: Products can be restored with a single API call
- **Audit trail**: All products remain in database with their history

### ✅ Security
- **Limited damage**: Unauthorized access cannot permanently delete data
- **Quick recovery**: Accidental deletions can be reversed immediately
- **Business continuity**: No risk of losing critical product information

### ✅ User Experience
- **Clear feedback**: Dialogs explain what soft delete means
- **Confirmation required**: Prevents accidental deletions
- **Visual indicators**: Loading states and success/error messages
- **Bulk operations**: Efficient management of multiple products

---

## Testing

### Test Single Delete
1. Navigate to Products page in admin
2. Click delete icon on any product
3. Confirm deletion
4. Verify product disappears from list
5. Check database: `isActive` should be `false`
6. Verify product is hidden on storefront

### Test Bulk Delete
1. Select 3-5 products using checkboxes
2. Click delete button in toolbar
3. Confirm bulk deletion
4. Verify all selected products disappear
5. Check database: All should have `isActive = false`
6. Verify success message shows correct count

### Test Restore (if implemented)
1. Filter to show deleted products
2. Click restore button
3. Verify product reappears in active list
4. Check database: `isActive` should be `true`
5. Verify product is visible on storefront again

---

## Future Enhancements

### Recommended Features
1. **Deleted Products View**
   - Add tab/filter to view soft-deleted products
   - Show deletion date/time
   - Bulk restore functionality

2. **Automatic Cleanup**
   - Optional: Auto-delete products after X days of being inactive
   - Configurable retention period
   - Warning before permanent deletion

3. **Deletion History**
   - Track who deleted products and when
   - Add `deletedBy` and `deletedAt` fields
   - Admin activity log

4. **Soft Delete for Other Entities**
   - Apply same pattern to Categories
   - Apply to Product Variants
   - Apply to User accounts

---

## API Reference

### TRPC Endpoints

| Endpoint | Method | Input | Output | Description |
|----------|--------|-------|--------|-------------|
| `product.delete` | Mutation | `{ id: string }` | `{ success: boolean, id: string }` | Soft delete single product |
| `product.bulkDelete` | Mutation | `{ ids: string[] }` | `{ success: boolean, count: number, ids: string[] }` | Soft delete multiple products |
| `product.restore` | Mutation | `{ id: string }` | `{ success: boolean, id: string }` | Restore single product |
| `product.bulkRestore` | Mutation | `{ ids: string[] }` | `{ success: boolean, count: number, ids: string[] }` | Restore multiple products |

---

## Notes

- All mutations require **admin privileges** (`adminProcedure`)
- Maximum 100 products per bulk operation (rate limiting)
- Products with `isActive = false` are automatically filtered from public queries
- Existing `toggleActive` mutation can also be used for manual activation/deactivation
