// Common Code Store - In-memory store for common code data
// TODO: Replace with API calls when backend is available

import { Title, Group, GroupKey } from '@/components/admin/common-code/types'
import { commonCodeData } from '@/mock/commonCodes'

// In-memory store (will be replaced with API calls)
let store = {
  titles: [...commonCodeData.titles],
  groups: [...commonCodeData.groups],
  groupKeys: [...commonCodeData.groupKeys],
}

/**
 * Get all titles
 * @returns Array of all titles
 */
export function getTitles(): Title[] {
  return store.titles.filter((title) => title.status === 'Active')
}

/**
 * Get groups by title ID
 * @param titleId - The title ID to filter groups
 * @returns Array of groups belonging to the title
 */
export function getGroupsByTitleId(titleId: string): Group[] {
  return store.groups.filter(
    (group) => group.titleId === titleId && group.status === 'Active'
  )
}

/**
 * Get keys by group ID
 * @param groupId - The group ID to filter keys
 * @returns Array of keys belonging to the group
 */
export function getKeysByGroupId(groupId: string): GroupKey[] {
  return store.groupKeys
    .filter((key) => key.groupId === groupId && key.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get a group by ID
 * @param groupId - The group ID
 * @returns Group object or undefined
 */
export function getGroupById(groupId: string): Group | undefined {
  return store.groups.find((group) => group.id === groupId)
}

/**
 * Get a key by ID
 * @param keyId - The key ID
 * @returns GroupKey object or undefined
 */
export function getKeyById(keyId: string): GroupKey | undefined {
  return store.groupKeys.find((key) => key.id === keyId)
}

/**
 * Get a title by ID
 * @param titleId - The title ID
 * @returns Title object or undefined
 */
export function getTitleById(titleId: string): Title | undefined {
  return store.titles.find((title) => title.id === titleId)
}

/**
 * Search titles by name
 * @param searchText - Search text
 * @returns Filtered array of titles
 */
export function searchTitles(searchText: string): Title[] {
  const lowerSearch = searchText.toLowerCase()
  return store.titles.filter(
    (title) =>
      title.status === 'Active' &&
      title.name.toLowerCase().includes(lowerSearch)
  )
}

/**
 * Search groups by name or code
 * @param titleId - The title ID to filter groups
 * @param searchText - Search text
 * @returns Filtered array of groups
 */
export function searchGroups(titleId: string, searchText: string): Group[] {
  const lowerSearch = searchText.toLowerCase()
  return store.groups.filter(
    (group) =>
      group.titleId === titleId &&
      group.status === 'Active' &&
      (group.name.toLowerCase().includes(lowerSearch) ||
        group.code.toLowerCase().includes(lowerSearch))
  )
}

/**
 * Search keys by label or value
 * @param groupId - The group ID to filter keys
 * @param searchText - Search text
 * @returns Filtered array of keys
 */
export function searchKeys(groupId: string, searchText: string): GroupKey[] {
  const lowerSearch = searchText.toLowerCase()
  return store.groupKeys
    .filter(
      (key) =>
        key.groupId === groupId &&
        key.enabled &&
        (key.label.toLowerCase().includes(lowerSearch) ||
          key.value.toLowerCase().includes(lowerSearch))
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

// For development: Allow updating the store (will be removed when API is connected)
export function updateStore(updates: {
  titles?: Title[]
  groups?: Group[]
  groupKeys?: GroupKey[]
}) {
  if (updates.titles) store.titles = updates.titles
  if (updates.groups) store.groups = updates.groups
  if (updates.groupKeys) store.groupKeys = updates.groupKeys
}

// Reset store to initial data
export function resetStore() {
  store = {
    titles: [...commonCodeData.titles],
    groups: [...commonCodeData.groups],
    groupKeys: [...commonCodeData.groupKeys],
  }
}

/**
 * Get program session codes (차시)
 * @returns Array of enabled session keys sorted by sortOrder
 */
export function getProgramSessionCodes(): GroupKey[] {
  const title = store.titles.find((t) => t.name === '프로그램_차시' && t.status === 'Active')
  if (!title) return []

  const group = store.groups.find(
    (g) => g.titleId === title.id && g.name === 'DEFAULT' && g.status === 'Active'
  )
  if (!group) return []

  return store.groupKeys
    .filter((key) => key.groupId === group.id && key.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get program type codes (프로그램 유형)
 * @returns Array of enabled type keys sorted by sortOrder
 */
export function getProgramTypeCodes(): GroupKey[] {
  const title = store.titles.find((t) => t.name === '프로그램_유형' && t.status === 'Active')
  if (!title) return []

  const group = store.groups.find(
    (g) => g.titleId === title.id && g.name === 'DEFAULT' && g.status === 'Active'
  )
  if (!group) return []

  return store.groupKeys
    .filter((key) => key.groupId === group.id && key.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get a program session key by value
 * @param value - The value to search for
 * @returns GroupKey or undefined
 */
export function getProgramSessionByValue(value: string): GroupKey | undefined {
  const codes = getProgramSessionCodes()
  return codes.find((key) => key.value === value)
}

/**
 * Get a program type key by value
 * @param value - The value to search for
 * @returns GroupKey or undefined
 */
export function getProgramTypeByValue(value: string): GroupKey | undefined {
  const codes = getProgramTypeCodes()
  return codes.find((key) => key.value === value)
}

/**
 * Get institution main category codes (대분류)
 * @returns Array of enabled main category keys sorted by sortOrder
 */
export function getInstitutionMainCategoryCodes(): GroupKey[] {
  const title = store.titles.find((t) => t.name === '교육기관_대분류' && t.status === 'Active')
  if (!title) return []

  const group = store.groups.find(
    (g) => g.titleId === title.id && g.status === 'Active'
  )
  if (!group) return []

  return store.groupKeys
    .filter((key) => key.groupId === group.id && key.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get institution sub category 1 codes (1분류)
 * @returns Array of enabled sub category 1 keys sorted by sortOrder
 */
export function getInstitutionSubCategory1Codes(): GroupKey[] {
  const title = store.titles.find((t) => t.name === '교육기관_1분류' && t.status === 'Active')
  if (!title) return []

  const group = store.groups.find(
    (g) => g.titleId === title.id && g.status === 'Active'
  )
  if (!group) return []

  return store.groupKeys
    .filter((key) => key.groupId === group.id && key.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get institution sub category 2 codes (2분류)
 * @returns Array of enabled sub category 2 keys sorted by sortOrder
 */
export function getInstitutionSubCategory2Codes(): GroupKey[] {
  const title = store.titles.find((t) => t.name === '교육기관_2분류' && t.status === 'Active')
  if (!title) return []

  const group = store.groups.find(
    (g) => g.titleId === title.id && g.status === 'Active'
  )
  if (!group) return []

  return store.groupKeys
    .filter((key) => key.groupId === group.id && key.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get school level type codes (학교급_구분)
 * @returns Array of enabled school level type keys sorted by sortOrder
 */
export function getSchoolLevelTypeCodes(): GroupKey[] {
  const title = store.titles.find((t) => t.name === '학교급_구분' && t.status === 'Active')
  if (!title) return []

  const group = store.groups.find(
    (g) => g.titleId === title.id && g.status === 'Active'
  )
  if (!group) return []

  return store.groupKeys
    .filter((key) => key.groupId === group.id && key.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get institution main category key by value
 * @param value - The value to search for
 * @returns GroupKey or undefined
 */
export function getInstitutionMainCategoryByValue(value: string): GroupKey | undefined {
  const codes = getInstitutionMainCategoryCodes()
  return codes.find((key) => key.value === value || key.label === value)
}

/**
 * Get institution sub category 1 key by value
 * @param value - The value to search for
 * @returns GroupKey or undefined
 */
export function getInstitutionSubCategory1ByValue(value: string): GroupKey | undefined {
  const codes = getInstitutionSubCategory1Codes()
  return codes.find((key) => key.value === value || key.label === value)
}

/**
 * Get institution sub category 2 key by value
 * @param value - The value to search for
 * @returns GroupKey or undefined
 */
export function getInstitutionSubCategory2ByValue(value: string): GroupKey | undefined {
  const codes = getInstitutionSubCategory2Codes()
  return codes.find((key) => key.value === value || key.label === value)
}

/**
 * Get school level type key by value
 * @param value - The value to search for
 * @returns GroupKey or undefined
 */
export function getSchoolLevelTypeByValue(value: string): GroupKey | undefined {
  const codes = getSchoolLevelTypeCodes()
  return codes.find((key) => key.value === value || key.label === value)
}



