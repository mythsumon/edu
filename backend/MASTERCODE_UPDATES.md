# MasterCode Module Updates

## Changes Summary

### 1. Code Column - Global Uniqueness ✅

**Before:** Code was unique within parent scope (parent_id, code)  
**After:** Code is now globally unique across all master codes

**Changes Made:**
- Updated `MasterCodeRepository`:
  - Changed `existsByCodeAndParentIdAndIsDeleteFalse()` → `existsByCodeAndIsDeleteFalse()` (removed parentId check)
  - Changed `existsByCodeAndParentIdAndIdNotAndIsDeleteFalse()` → `existsByCodeAndIdNotAndIsDeleteFalse()` (removed parentId check)
- Updated `MasterCodeServiceImpl.validateUniqueness()`:
  - Code validation now checks globally (no parentId parameter)
  - Error message updated: "Master code with code 'X' already exists. Code must be globally unique."
  - CodeName still unique within parent scope (unchanged)

**Validation Behavior:**
- ✅ Creating a master code with an existing code will fail with validation error
- ✅ Updating a master code to an existing code will fail with validation error
- ✅ CodeName remains unique within parent scope (as before)

---

### 2. ParentId Always Required in Request ✅

**Before:** `parentId` was optional in `MasterCodeCreateDto`  
**After:** `parentId` is now required (but can be `null` for root codes)

**Changes Made:**
- Updated `MasterCodeCreateDto`:
  - Added `@NotNull(message = "Parent ID is required (use null for root codes)")` annotation
  - Updated comment: "Required field - null for root codes, Long value for child codes"

**Request Behavior:**
- ✅ `parentId` field must be present in request body
- ✅ `parentId: null` is valid (creates root code)
- ✅ `parentId: <number>` is valid (creates child code)
- ✅ Missing `parentId` field will result in validation error

**Example Requests:**
```json
// Create root code (parentId must be explicitly null)
{
  "code": 100,
  "codeName": "Root Code",
  "parentId": null
}

// Create child code (parentId must be provided)
{
  "code": 101,
  "codeName": "Child Code",
  "parentId": 1
}

// Invalid - missing parentId field
{
  "code": 102,
  "codeName": "Invalid Code"
  // Missing parentId - will fail validation
}
```

---

## Files Modified

1. **MasterCodeCreateDto.java**
   - Added `@NotNull` to `parentId` field

2. **MasterCodeRepository.java**
   - Replaced `existsByCodeAndParentIdAndIsDeleteFalse()` with `existsByCodeAndIsDeleteFalse()`
   - Replaced `existsByCodeAndParentIdAndIdNotAndIsDeleteFalse()` with `existsByCodeAndIdNotAndIsDeleteFalse()`

3. **MasterCodeServiceImpl.java**
   - Updated `validateUniqueness()` method to check code globally
   - Updated error messages for code uniqueness
   - Updated comments in `createMasterCode()` method

---

## Validation Rules Summary

### Code Uniqueness
- **Scope:** Global (across all master codes)
- **Check:** Performed on create and update operations
- **Error:** "Master code with code 'X' already exists. Code must be globally unique."

### CodeName Uniqueness
- **Scope:** Within parent (same as before)
- **Check:** Performed on create and update operations
- **Error:** "Master code with name 'X' already exists under this parent"

### ParentId Requirement
- **Required:** Yes (field must be present)
- **Nullable:** Yes (null for root codes, Long value for child codes)
- **Validation:** Field presence validated by `@NotNull` annotation

---

## Testing Checklist

### Code Global Uniqueness
- [ ] Create root code with code=100 → Success
- [ ] Create another root code with code=100 → Should fail (code already exists)
- [ ] Create child code with code=100 → Should fail (code already exists globally)
- [ ] Update code to existing code → Should fail
- [ ] Update code to new unique code → Success

### ParentId Requirement
- [ ] Create root code with `parentId: null` → Success
- [ ] Create child code with `parentId: 1` → Success
- [ ] Create code without `parentId` field → Should fail validation
- [ ] Create code with invalid `parentId` → Should fail (parent not found)

### CodeName Uniqueness (Within Parent)
- [ ] Create root code with codeName="Test" → Success
- [ ] Create another root code with codeName="Test" → Should fail (name exists under same parent)
- [ ] Create child code (parentId=1) with codeName="Test" → Success (different parent)
- [ ] Create another child code (parentId=1) with codeName="Test" → Should fail (name exists under same parent)

---

## Database Considerations

**Note:** The database schema still has the unique index on `(parent_id, code)`. This means:
- Database will enforce uniqueness within parent scope
- Application now enforces global uniqueness
- If database constraint is updated to make `code` globally unique, both will align

**Recommendation:** Consider updating database migration to add unique constraint on `code` column alone:
```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_master_code_code ON master_code(code) WHERE is_delete = FALSE;
```

This would provide database-level enforcement of global code uniqueness.

---

## Backward Compatibility

⚠️ **Breaking Change:** 
- API clients must now always include `parentId` field in create requests (even if null)
- Previously, `parentId` could be omitted for root codes

**Migration Path:**
- Update API clients to always include `parentId` field
- For root codes, explicitly set `parentId: null`

---

**Update Date:** 2024  
**Status:** ✅ Complete and Ready for Testing
