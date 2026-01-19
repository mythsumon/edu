import type {
  AdminAccount,
  AdminResponseDto,
  AdminDetail,
  InstructorAccount,
  InstructorResponseDto,
  InstructorDetail,
  TeacherAccount,
  TeacherResponseDto,
  TeacherDetail,
} from './account-management.types'

/**
 * Map AdminResponseDto to AdminAccount
 */
export function mapAdminAccount(dto: AdminResponseDto): AdminAccount {
  return {
    id: dto.userId,
    name: dto.name,
    username: dto.username,
    email: dto.email,
    phoneNumber: dto.phone,
  }
}

/**
 * Map InstructorResponseDto to InstructorAccount
 */
export function mapInstructorAccount(dto: InstructorResponseDto): InstructorAccount {
  return {
    id: dto.userId,
    instructorId: dto.instructorId,
    name: dto.name,
    username: dto.username,
    affiliation: dto.affiliation,
    regionId: dto.regionId,
    region: undefined, // Will be populated from mastercode lookup using regionId
    classificationId: dto.classificationId,
    instructorClassification: undefined, // Will be populated from mastercode lookup using classificationId
  }
}

/**
 * Map list of AdminResponseDto to AdminAccount[]
 */
export function mapAdminAccountList(dtos: AdminResponseDto[]): AdminAccount[] {
  return dtos.map(mapAdminAccount)
}

/**
 * Map list of InstructorResponseDto to InstructorAccount[]
 */
export function mapInstructorAccountList(dtos: InstructorResponseDto[]): InstructorAccount[] {
  return dtos.map(mapInstructorAccount)
}

/**
 * Map AdminResponseDto to AdminDetail
 */
export function mapAdminDetail(dto: AdminResponseDto): AdminDetail {
  return {
    id: dto.userId,
    username: dto.username,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    enabled: dto.enabled,
    profilePhoto: dto.profilePhoto,
  }
}

/**
 * Map InstructorResponseDto to InstructorDetail
 */
export function mapInstructorDetail(dto: InstructorResponseDto): InstructorDetail {
  return {
    id: dto.userId,
    instructorId: dto.instructorId,
    username: dto.username,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    gender: dto.gender,
    dob: dto.dob,
    regionId: dto.regionId,
    cityId: dto.cityId,
    street: dto.street,
    detailAddress: dto.detailAddress,
    statusId: dto.statusId,
    classificationId: dto.classificationId,
    affiliation: dto.affiliation,
    enabled: dto.enabled,
  }
}

/**
 * Map TeacherResponseDto to TeacherAccount
 */
export function mapTeacherAccount(dto: TeacherResponseDto): TeacherAccount {
  return {
    id: dto.userId,
    teacherId: dto.teacherId,
    name: dto.name,
    username: dto.username,
    email: dto.email,
    phoneNumber: dto.phone,
  }
}

/**
 * Map list of TeacherResponseDto to TeacherAccount[]
 */
export function mapTeacherAccountList(dtos: TeacherResponseDto[]): TeacherAccount[] {
  return dtos.map(mapTeacherAccount)
}

/**
 * Map TeacherResponseDto to TeacherDetail
 */
export function mapTeacherDetail(dto: TeacherResponseDto): TeacherDetail {
  return {
    id: dto.userId,
    teacherId: dto.teacherId,
    username: dto.username,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    enabled: dto.enabled,
    profilePhoto: dto.profilePhoto,
  }
}
