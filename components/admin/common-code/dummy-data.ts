import { Title, Group, GroupKey } from './types'
import { commonCodeData } from '@/mock/commonCodes'

// Dummy data for development
// TODO: Replace with API calls when backend is available
// Using region data from commonCodes.ts as the primary data source
export const dummyTitles: Title[] = commonCodeData.titles

export const dummyGroups: Group[] = commonCodeData.groups

export const dummyGroupKeys: GroupKey[] = commonCodeData.groupKeys




