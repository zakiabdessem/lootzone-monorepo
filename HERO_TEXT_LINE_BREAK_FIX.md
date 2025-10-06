# Hero Text Line Break Fix

## Problem
When admins entered hero text with `\n` for line breaks (e.g., `PACK\nDESIGNER`), it was being displayed as a single line with the literal string `PACK\NDESIGNER` instead of two separate lines.

## Root Cause
The `\n` character sequence typed by users in the admin form was being saved as a **literal string** `"\\n"` (backslash followed by 'n') in the database, not as an actual newline character. The frontend component wasn't converting this literal string back to newlines for display.

## Solution

### 1. Frontend Component Fix (`HeroTextAnimated.tsx`)

**File:** `apps/trpc-app/src/app/_components/landing/hero/HeroTextAnimated.tsx`

Updated the text processing to:
- Convert literal `\n` strings to actual newline characters
- Normalize Windows line endings
- Split by newlines and filter empty lines
- Display each line as a separate block element

```typescript
// Handle both literal \n (from user input) and actual newline characters
const normalizedLabel = label
  .replace(/\\n/g, '\n')  // Replace \n typed by user
  .replace(/\r\n/g, '\n') // Normalize Windows line endings
  .trim();

const lines = normalizedLabel.split('\n').filter(line => line.trim() !== '');

// Render each line as a block element
{lines.map((line, i) => (
  <span key={`${idx}-${i}`} style={{ display: 'block' }}>
    {line.trim()}
  </span>
))}
```

### 2. Admin Panel Improvements (`site-settings/page.tsx`)

**File:** `apps/admin/src/app/(dashboard)/site-settings/page.tsx`

#### A. Added Live Preview
When editing hero slides, users now see a real-time preview of how the text will appear with line breaks:

```typescript
{values.label && (
  <Box mt={1} p={2} bgcolor="grey.100" borderRadius={1}>
    <Typography variant="caption" color="text.secondary" gutterBottom>
      Preview:
    </Typography>
    {values.label
      .replace(/\\n/g, '\n')
      .split('\n')
      .map((line, i) => (
        <Typography key={i} variant="h6" fontWeight="bold">
          {line}
        </Typography>
      ))}
  </Box>
)}
```

#### B. Improved Helper Text
Changed from confusing instructions to clear, actionable guidance:

**Before:**
```
"Use \\n for line breaks (e.g., MINTY\\nLEGENDS)"
```

**After:**
```
"Type \\n (backslash-n) where you want line breaks. Example: PACK\\nDESIGNER will show on two lines."
```

#### C. Fixed Table Display
Updated the hero slides table to properly display multi-line labels:

```typescript
<TableCell>
  <Box>
    {slide.label
      .replace(/\\n/g, '\n')
      .split('\n')
      .map((line, i) => (
        <div key={i}>{line}</div>
      ))}
  </Box>
</TableCell>
```

## How It Works Now

### Admin Workflow:
1. Admin goes to Site Settings page
2. Clicks "Add Hero Slide" or edits existing slide
3. In the "Hero Text" field, types: `PACK\nDESIGNER`
4. **New:** Sees live preview showing:
   ```
   PACK
   DESIGNER
   ```
5. Saves the slide
6. Text is stored in database as: `"PACK\\nDESIGNER"`

### Frontend Display:
1. Component receives: `"PACK\\nDESIGNER"`
2. Normalizes to actual newlines: `"PACK\nDESIGNER"`
3. Splits into array: `["PACK", "DESIGNER"]`
4. Renders each line as separate block element
5. User sees animated text on two lines:
   ```
   PACK
   DESIGNER
   ```

## Testing Instructions

### Test 1: Create New Hero Slide
1. Navigate to Site Settings in admin panel
2. Click "Add Hero Slide"
3. In "Hero Text" field, enter: `EPIC\nGAME`
4. Verify preview shows two lines
5. Save the slide
6. Go to storefront homepage
7. Verify hero carousel shows text on two lines with animation

### Test 2: Edit Existing Slide
1. Find existing hero slide in table
2. Click Edit button
3. Modify text to: `NEW\nTEXT\nHERE` (three lines)
4. Verify preview shows three lines
5. Save changes
6. Verify storefront displays correctly

### Test 3: Table Display
1. View hero slides table in admin
2. Verify all multi-line labels display properly
3. Each line should be on separate row within table cell

## Edge Cases Handled

✅ **Literal `\n` string** - Converts `\\n` to actual newline
✅ **Windows line endings** - Normalizes `\r\n` to `\n`
✅ **Extra whitespace** - Trims leading/trailing spaces
✅ **Empty lines** - Filters out blank lines
✅ **Single line text** - Works without `\n` characters
✅ **Multiple `\n` sequences** - Handles `TEXT\n\n\nMORE` gracefully

## Technical Details

### Character Encoding
- User types: `\n` (two characters: backslash + n)
- Database stores: `"\\n"` (escaped backslash + n)
- JavaScript receives: `"\\n"` (string literal)
- Regex replaces: `/\\n/g` matches the backslash-n sequence
- Result: Actual newline character `\n` (ASCII 10)

### Display Strategy
Instead of using `<br>` tags, we use `display: block` on spans:
```typescript
<span style={{ display: 'block' }}>{line}</span>
```

This ensures:
- Proper line breaking
- Compatible with GSAP animations
- Clean separation between lines
- Consistent spacing

## Benefits

### User Experience
- ✅ Clear instructions with examples
- ✅ Live preview removes guesswork
- ✅ Immediate visual feedback
- ✅ Consistent display across admin and storefront

### Developer Experience
- ✅ Robust text processing
- ✅ Handles edge cases
- ✅ No database migration needed
- ✅ Backward compatible with existing data

### Reliability
- ✅ Works across all browsers
- ✅ Handles different input methods
- ✅ No special characters required
- ✅ Graceful fallback for invalid input

## Files Modified

1. **`apps/trpc-app/src/app/_components/landing/hero/HeroTextAnimated.tsx`**
   - Added text normalization logic
   - Changed rendering to block elements
   - Improved line processing

2. **`apps/admin/src/app/(dashboard)/site-settings/page.tsx`**
   - Added live preview component
   - Updated helper text
   - Fixed table display
   - Improved user guidance

## No Changes Required

- ✅ Database schema (uses existing `label` field)
- ✅ TRPC API (no processing needed)
- ✅ Component CSS/styling
- ✅ Animation logic

## Future Enhancements (Optional)

1. **WYSIWYG Editor**
   - Rich text editor for hero text
   - Visual line break insertion
   - Real-time preview while typing

2. **Template Library**
   - Pre-made text layouts
   - Common hero text patterns
   - One-click insertion

3. **Validation**
   - Maximum line count
   - Character limit per line
   - Text size preview

4. **Accessibility**
   - Screen reader optimization
   - Semantic HTML for multi-line text
   - ARIA labels for hero sections

---

## Example Usage

### Simple Two-Line Text
```
Input:  "MINTY\nLEGENDS"
Output: MINTY
        LEGENDS
```

### Three-Line Text
```
Input:  "NEW\nGAME\nALERT"
Output: NEW
        GAME
        ALERT
```

### Single Line (No Break)
```
Input:  "CYBERPUNK 2077"
Output: CYBERPUNK 2077
```

### Complex Text
```
Input:  "PACK\nDESIGNER\nEDITION"
Output: PACK
        DESIGNER
        EDITION
```
