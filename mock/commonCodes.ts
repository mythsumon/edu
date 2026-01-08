// Common Code Mock Data
// This is the single source of truth for common code data

import { Title, Group, GroupKey } from '@/components/admin/common-code/types'

// Title: 지역
export const regionTitle: Title = {
  id: 'title-region',
  name: '지역',
  status: 'Active',
  groupCount: 6,
  createdAt: '2024-01-10',
  updatedAt: '2024-01-15',
}

// Groups: 권역 1~6
export const regionGroups: Group[] = [
  {
    id: 'region-1',
    titleId: 'title-region',
    name: '권역 1',
    code: '1',
    status: 'Active',
    valueCount: 3,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'region-2',
    titleId: 'title-region',
    name: '권역 2',
    code: '2',
    status: 'Active',
    valueCount: 4,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'region-3',
    titleId: 'title-region',
    name: '권역 3',
    code: '3',
    status: 'Active',
    valueCount: 1,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'region-4',
    titleId: 'title-region',
    name: '권역 4',
    code: '4',
    status: 'Active',
    valueCount: 5,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'region-5',
    titleId: 'title-region',
    name: '권역 5',
    code: '5',
    status: 'Active',
    valueCount: 3,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'region-6',
    titleId: 'title-region',
    name: '권역 6',
    code: '6',
    status: 'Active',
    valueCount: 1,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Group Keys: 지역별 도시/지역
export const regionGroupKeys: GroupKey[] = [
  // 권역 1: 수도권
  {
    id: 'key-region-1-1',
    groupId: 'region-1',
    label: '서울',
    value: 'SEOUL',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-1-2',
    groupId: 'region-1',
    label: '인천',
    value: 'INCHEON',
    sortOrder: 2,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-1-3',
    groupId: 'region-1',
    label: '경기',
    value: 'GYEONGGI',
    sortOrder: 3,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  // 권역 2: 충청
  {
    id: 'key-region-2-1',
    groupId: 'region-2',
    label: '대전',
    value: 'DAEJEON',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-2-2',
    groupId: 'region-2',
    label: '세종',
    value: 'SEJONG',
    sortOrder: 2,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-2-3',
    groupId: 'region-2',
    label: '충북',
    value: 'CHUNGBUK',
    sortOrder: 3,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-2-4',
    groupId: 'region-2',
    label: '충남',
    value: 'CHUNGNAM',
    sortOrder: 4,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  // 권역 3: 강원
  {
    id: 'key-region-3-1',
    groupId: 'region-3',
    label: '강원',
    value: 'GANGWON',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  // 권역 4: 경상
  {
    id: 'key-region-4-1',
    groupId: 'region-4',
    label: '부산',
    value: 'BUSAN',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-4-2',
    groupId: 'region-4',
    label: '대구',
    value: 'DAEGU',
    sortOrder: 2,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-4-3',
    groupId: 'region-4',
    label: '울산',
    value: 'ULSAN',
    sortOrder: 3,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-4-4',
    groupId: 'region-4',
    label: '경북',
    value: 'GYEONGBUK',
    sortOrder: 4,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-4-5',
    groupId: 'region-4',
    label: '경남',
    value: 'GYEONGNAM',
    sortOrder: 5,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  // 권역 5: 전라
  {
    id: 'key-region-5-1',
    groupId: 'region-5',
    label: '광주',
    value: 'GWANGJU',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-5-2',
    groupId: 'region-5',
    label: '전북',
    value: 'JEONBUK',
    sortOrder: 2,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-region-5-3',
    groupId: 'region-5',
    label: '전남',
    value: 'JEONNAM',
    sortOrder: 3,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  // 권역 6: 제주
  {
    id: 'key-region-6-1',
    groupId: 'region-6',
    label: '제주',
    value: 'JEJU',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Title: 교육기관_대분류
export const institutionMainCategoryTitle: Title = {
  id: 'title-institution-main',
  name: '교육기관_대분류',
  status: 'Active',
  groupCount: 1,
  createdAt: '2024-01-10',
  updatedAt: '2024-01-15',
}

// Groups: 대분류 (단일 그룹)
export const institutionMainCategoryGroups: Group[] = [
  {
    id: 'institution-main-group',
    titleId: 'title-institution-main',
    name: '대분류',
    code: 'MAIN',
    status: 'Active',
    valueCount: 3,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Group Keys: 대분류 값들
export const institutionMainCategoryKeys: GroupKey[] = [
  {
    id: 'key-main-1',
    groupId: 'institution-main-group',
    label: '찾아가는교육',
    value: 'VISITING',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-main-2',
    groupId: 'institution-main-group',
    label: '센터교육',
    value: 'CENTER',
    sortOrder: 2,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-main-3',
    groupId: 'institution-main-group',
    label: '기타',
    value: 'OTHER',
    sortOrder: 3,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Title: 교육기관_1분류
export const institutionSubCategory1Title: Title = {
  id: 'title-institution-sub1',
  name: '교육기관_1분류',
  status: 'Active',
  groupCount: 1,
  createdAt: '2024-01-10',
  updatedAt: '2024-01-15',
}

// Groups: 1분류 (단일 그룹)
export const institutionSubCategory1Groups: Group[] = [
  {
    id: 'institution-sub1-group',
    titleId: 'title-institution-sub1',
    name: '1분류',
    code: 'SUB1',
    status: 'Active',
    valueCount: 2,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Group Keys: 1분류 값들
export const institutionSubCategory1Keys: GroupKey[] = [
  {
    id: 'key-sub1-1',
    groupId: 'institution-sub1-group',
    label: '북부',
    value: 'NORTH',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-sub1-2',
    groupId: 'institution-sub1-group',
    label: '남부',
    value: 'SOUTH',
    sortOrder: 2,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Title: 교육기관_2분류
export const institutionSubCategory2Title: Title = {
  id: 'title-institution-sub2',
  name: '교육기관_2분류',
  status: 'Active',
  groupCount: 1,
  createdAt: '2024-01-10',
  updatedAt: '2024-01-15',
}

// Groups: 2분류 (단일 그룹)
export const institutionSubCategory2Groups: Group[] = [
  {
    id: 'institution-sub2-group',
    titleId: 'title-institution-sub2',
    name: '2분류',
    code: 'SUB2',
    status: 'Active',
    valueCount: 10,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Group Keys: 2분류 값들
export const institutionSubCategory2Keys: GroupKey[] = [
  {
    id: 'key-sub2-1',
    groupId: 'institution-sub2-group',
    label: '일반학교',
    value: 'GENERAL_SCHOOL',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-sub2-2',
    groupId: 'institution-sub2-group',
    label: '특수학교',
    value: 'SPECIAL_SCHOOL',
    sortOrder: 2,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-sub2-3',
    groupId: 'institution-sub2-group',
    label: '일반학교 내 특수학급',
    value: 'SPECIAL_CLASS',
    sortOrder: 3,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-sub2-4',
    groupId: 'institution-sub2-group',
    label: '도서벽지',
    value: 'REMOTE_AREA',
    sortOrder: 4,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-sub2-5',
    groupId: 'institution-sub2-group',
    label: '지역아동센터',
    value: 'CHILDREN_CENTER',
    sortOrder: 5,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-sub2-6',
    groupId: 'institution-sub2-group',
    label: '기타',
    value: 'OTHER',
    sortOrder: 6,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-sub2-7',
    groupId: 'institution-sub2-group',
    label: '기타(농어촌)',
    value: 'OTHER_RURAL',
    sortOrder: 7,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-sub2-8',
    groupId: 'institution-sub2-group',
    label: '기타(연계거점)',
    value: 'OTHER_HUB',
    sortOrder: 8,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-sub2-9',
    groupId: 'institution-sub2-group',
    label: '기타(다함께돌봄센터)',
    value: 'OTHER_CARE',
    sortOrder: 9,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-sub2-10',
    groupId: 'institution-sub2-group',
    label: '기타(도서관)',
    value: 'OTHER_LIBRARY',
    sortOrder: 10,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Title: 프로그램_차시
export const programSessionTitle: Title = {
  id: 'title-program-session',
  name: '프로그램_차시',
  status: 'Active',
  groupCount: 1,
  createdAt: '2024-01-10',
  updatedAt: '2024-01-15',
}

// Group: DEFAULT
export const programSessionGroups: Group[] = [
  {
    id: 'group-program-session-default',
    titleId: 'title-program-session',
    name: 'DEFAULT',
    code: 'DEFAULT',
    status: 'Active',
    valueCount: 5,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Group Keys: 프로그램_차시
export const programSessionGroupKeys: GroupKey[] = [
  {
    id: 'key-program-session-8',
    groupId: 'group-program-session-default',
    label: '8차시',
    value: '8',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-program-session-16',
    groupId: 'group-program-session-default',
    label: '16차시',
    value: '16',
    sortOrder: 2,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-program-session-50',
    groupId: 'group-program-session-default',
    label: '50차시',
    value: '50',
    sortOrder: 3,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-program-session-agree',
    groupId: 'group-program-session-default',
    label: '협의',
    value: 'AGREE',
    sortOrder: 4,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-program-session-etc',
    groupId: 'group-program-session-default',
    label: '기타',
    value: 'ETC',
    sortOrder: 5,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Title: 프로그램_유형
export const programTypeTitle: Title = {
  id: 'title-program-type',
  name: '프로그램_유형',
  status: 'Active',
  groupCount: 1,
  createdAt: '2024-01-10',
  updatedAt: '2024-01-15',
}

// Group: DEFAULT
export const programTypeGroups: Group[] = [
  {
    id: 'group-program-type-default',
    titleId: 'title-program-type',
    name: 'DEFAULT',
    code: 'DEFAULT',
    status: 'Active',
    valueCount: 3,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Group Keys: 프로그램_유형
export const programTypeGroupKeys: GroupKey[] = [
  {
    id: 'key-program-type-block',
    groupId: 'group-program-type-default',
    label: '블록코딩',
    value: 'BLOCK',
    sortOrder: 1,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-program-type-text',
    groupId: 'group-program-type-default',
    label: '텍스트코딩',
    value: 'TEXT',
    sortOrder: 2,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'key-program-type-agree',
    groupId: 'group-program-type-default',
    label: '협의',
    value: 'AGREE',
    sortOrder: 3,
    enabled: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
]

// Combined data for Common Code page
export const commonCodeData = {
  titles: [
    regionTitle,
    institutionMainCategoryTitle,
    institutionSubCategory1Title,
    institutionSubCategory2Title,
    programSessionTitle,
    programTypeTitle,
  ],
  groups: [
    ...regionGroups,
    ...institutionMainCategoryGroups,
    ...institutionSubCategory1Groups,
    ...institutionSubCategory2Groups,
    ...programSessionGroups,
    ...programTypeGroups,
  ],
  groupKeys: [
    ...regionGroupKeys,
    ...institutionMainCategoryKeys,
    ...institutionSubCategory1Keys,
    ...institutionSubCategory2Keys,
    ...programSessionGroupKeys,
    ...programTypeGroupKeys,
  ],
}



