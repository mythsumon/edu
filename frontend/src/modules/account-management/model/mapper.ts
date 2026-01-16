import type {
  AdminAccount,
  AdminResponseDto,
  InstructorAccount,
  InstructorResponseDto,
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
