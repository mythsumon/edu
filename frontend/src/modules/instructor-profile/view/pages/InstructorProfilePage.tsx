import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Edit, Save, X } from 'lucide-react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import type { UserResponseDto } from '@/modules/auth/model/auth.types'
import { useUiStore } from '@/shared/stores/ui.store'
import { masterCodeChildrenByCodeQueryOptions } from '../../controller/instructor-profile.query-options'
import { transformArrayToObjectByKey } from '@/shared/lib/convertor'
import { InstructorProfileDetailView } from '../components/InstructorProfileDetailView'
import { InstructorProfileEditView } from '../components/InstructorProfileEditView'

export const InstructorProfilePage = () => {
  const { t } = useTranslation()
  const { language } = useUiStore()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserResponseDto | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Get loader data (prefetched master codes)
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof import('../../controller/instructor-profile.loader').instructorProfileLoader>>

  // Use the prefetched data from loader - the data is already in the cache from ensureQueryData
  const { data: instructorStatus } = useQuery({
    ...masterCodeChildrenByCodeQueryOptions('100', {
      page: 0,
      size: 100,
    }),
    initialData: loaderData.instructorStatus,
  })

  const { data: instructorClassification } = useQuery({
    ...masterCodeChildrenByCodeQueryOptions('200', {
      page: 0,
      size: 100,
    }),
    initialData: loaderData.instructorClassification,
  })

  const { data: instructorRegion } = useQuery({
    ...masterCodeChildrenByCodeQueryOptions('1300', {
      page: 0,
      size: 100,
    }),
    initialData: loaderData.instructorRegion,
  })

  const { data: instructorCity } = useQuery({
    ...masterCodeChildrenByCodeQueryOptions('1400', {
      page: 0,
      size: 100,
    }),
    initialData: loaderData.instructorCity,
  })

  // Create maps for quick lookup
  const statusMasterCodeMap = useMemo(() => {
    if (!instructorStatus?.items) return {}
    return transformArrayToObjectByKey(instructorStatus.items, 'id')
  }, [instructorStatus?.items])

  const classificationMasterCodeMap = useMemo(() => {
    if (!instructorClassification?.items) return {}
    return transformArrayToObjectByKey(instructorClassification.items, 'id')
  }, [instructorClassification?.items])

  const cityMasterCodeMap = useMemo(() => {
    if (!instructorCity?.items) return {}
    return transformArrayToObjectByKey(instructorCity.items, 'id')
  }, [instructorCity?.items])

  const regionMasterCodeMap = useMemo(() => {
    if (!instructorRegion?.items) return {}
    return transformArrayToObjectByKey(instructorRegion.items, 'id')
  }, [instructorRegion?.items])

  // Get current user from localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER)
      if (userStr) {
        const user: UserResponseDto = JSON.parse(userStr)
        setCurrentUser(user)
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error)
    }
  }, [])

  // Static instructor data from user object
  const instructor = useMemo(() => {
    if (currentUser?.instructor) {
      return {
        id: currentUser.id,
        name: currentUser.instructor.name || currentUser.username || 'Instructor',
        email: currentUser.instructor.email || '',
        phone: currentUser.instructor.phone || '',
        gender: currentUser.instructor.gender || '',
        dob: currentUser.instructor.dob || '',
        regionId: (currentUser.instructor as Record<string, unknown>)?.regionId as number | undefined,
        cityId: (currentUser.instructor as Record<string, unknown>)?.cityId as number | undefined,
        statusId: (currentUser.instructor as Record<string, unknown>)?.statusId as number | undefined,
        classificationId: (currentUser.instructor as Record<string, unknown>)?.classificationId as number | undefined,
        street: currentUser.instructor.street || '',
        detailAddress: currentUser.instructor.detailAddress || '',
        profilePhoto: undefined,
        signature: (currentUser.instructor as Record<string, unknown>)?.signature as string | undefined,
      }
    }
    return {
      id: currentUser?.id || 0,
      name: currentUser?.username || 'Instructor',
      email: '',
      phone: '',
      gender: '',
      dob: '',
      regionId: undefined,
      cityId: undefined,
      statusId: undefined,
      classificationId: undefined,
      street: '',
      detailAddress: '',
      profilePhoto: undefined,
      signature: undefined,
    }
  }, [currentUser])

  // Transform regions from master code data (Code 1300)
  const regions = useMemo<Array<{ id: number; codeName: string }>>(() => {
    return instructorRegion?.items?.map((item) => ({
      id: item.id,
      codeName: item.codeName,
    })) || []
  }, [instructorRegion?.items])

  // Transform cities from master code data (Code 1400)
  const cities = useMemo<Array<{ id: number; codeName: string }>>(() => {
    return instructorCity?.items?.map((item) => ({
      id: item.id,
      codeName: item.codeName,
    })) || []
  }, [instructorCity?.items])

  const isLoadingRegions = false

  // Get region name from map using instructor's regionId
  const regionName = useMemo(() => {
    if (instructor.regionId && regionMasterCodeMap[instructor.regionId]) {
      return regionMasterCodeMap[instructor.regionId].codeName
    }
    return '-'
  }, [instructor.regionId, regionMasterCodeMap])
  
  // Get city name from map using instructor's cityId
  const cityName = useMemo(() => {
    if (instructor.cityId && cityMasterCodeMap[instructor.cityId]) {
      return cityMasterCodeMap[instructor.cityId].codeName
    }
    return '-'
  }, [instructor.cityId, cityMasterCodeMap])

  // Get status name from map using instructor's statusId
  const statusName = useMemo(() => {
    if (instructor.statusId && statusMasterCodeMap[instructor.statusId]) {
      return statusMasterCodeMap[instructor.statusId].codeName
    }
    return '-'
  }, [instructor.statusId, statusMasterCodeMap])

  // Get classification name from map using instructor's classificationId
  const classificationName = useMemo(() => {
    if (instructor.classificationId && classificationMasterCodeMap[instructor.classificationId]) {
      return classificationMasterCodeMap[instructor.classificationId].codeName
    }
    return '-'
  }, [instructor.classificationId, classificationMasterCodeMap])


  const handleSuccess = () => {
    setIsEditMode(false)
  }

  const handleCancel = () => {
    setIsEditMode(false)
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <PageLayout
      title={t('profile.title')}
      actions={
        <>
          {isEditMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleFormSubmit}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => setIsEditMode(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </Button>
          )}
        </>
      }
    >
      {isEditMode ? (
        <InstructorProfileEditView
          instructor={instructor}
          cityMasterCode={instructorCity}
          cityMasterCodeMap={cityMasterCodeMap}
          regions={regions}
          cities={cities}
          isLoadingRegions={isLoadingRegions}
          language={language}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          getInitials={getInitials}
          formRef={formRef}
          onSubmittingChange={setIsSubmitting}
        />
      ) : (
        <InstructorProfileDetailView
          instructor={instructor}
          regionName={regionName}
          cityName={cityName}
          statusName={statusName}
          classificationName={classificationName}
          language={language}
          getInitials={getInitials}
        />
      )}
    </PageLayout>
  )
}
