export { InstructorProfilePage } from './view/pages/InstructorProfilePage'
export { 
  useMasterCodeByIdQuery, 
  useMasterCodeByCodeQuery, 
  useMasterCodeChildrenByCodeQuery,
  useMasterCodeGrandChildrenByCodeQuery,
} from './controller/queries'
export { useUpdateInstructor, usePatchInstructor } from './controller/mutations'
export { instructorProfileLoader } from './controller/instructor-profile.loader'
export { 
  masterCodeByIdQueryOptions, 
  masterCodeByCodeQueryOptions, 
  masterCodeChildrenByCodeQueryOptions,
  masterCodeGrandChildrenByCodeQueryOptions,
} from './controller/instructor-profile.query-options'
export { INSTRUCTOR_PROFILE_ENDPOINTS } from './model/instructor-profile.endpoints'
export type {
  MasterCodeResponseDto,
  InstructorResponseDto,
  InstructorUpdateRequestDto,
  InstructorPatchRequestDto,
  MasterCodeChildrenParams,
} from './model/instructor-profile.types'
