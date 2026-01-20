export const instructorProfileQueryKeys = {
  all: ['instructor-profile'] as const,
  masterCode: () => [...instructorProfileQueryKeys.all, 'master-code'] as const,
  masterCodeById: (id: number) => [...instructorProfileQueryKeys.masterCode(), 'by-id', id] as const,
  masterCodeByCode: (code: string) => [...instructorProfileQueryKeys.masterCode(), 'by-code', code] as const,
  masterCodeChildren: () => [...instructorProfileQueryKeys.masterCode(), 'children'] as const,
  masterCodeChildrenByCode: (code: string, params?: string) => 
    [...instructorProfileQueryKeys.masterCodeChildren(), 'by-code', code, params || ''] as const,
  instructor: () => [...instructorProfileQueryKeys.all, 'instructor'] as const,
  instructorById: (userId: number) => [...instructorProfileQueryKeys.instructor(), userId] as const,
}
