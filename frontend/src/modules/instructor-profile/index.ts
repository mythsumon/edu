export { InstructorProfilePage } from './view/pages/InstructorProfilePage'
export { 
  useMasterCodeByIdQuery, 
  useMasterCodeByCodeQuery, 
  useMasterCodeChildrenByCodeQuery,
  useMasterCodeGrandChildrenByCodeQuery,
  useInstructorMeQuery,
} from './controller/queries'
export { useUpdateInstructor, usePatchInstructor, usePatchInstructorMe, useUploadSignature } from './controller/mutations'
export { instructorProfileLoader } from './controller/instructor-profile.loader'
export { 
  masterCodeByIdQueryOptions, 
  masterCodeByCodeQueryOptions, 
  masterCodeChildrenByCodeQueryOptions,
  masterCodeGrandChildrenByCodeQueryOptions,
  instructorMeQueryOptions,
} from './controller/instructor-profile.query-options'
export { INSTRUCTOR_PROFILE_ENDPOINTS } from './model/instructor-profile.endpoints'
export type {
  MasterCodeResponseDto,
  InstructorResponseDto,
  InstructorUpdateRequestDto,
  InstructorPatchRequestDto,
  MasterCodeChildrenParams,
} from './model/instructor-profile.types'
