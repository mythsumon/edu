import { useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router-dom'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { Edit, Save, X } from 'lucide-react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { useUiStore } from '@/shared/stores/ui.store'
import { 
  masterCodeChildrenByCodeQueryOptions,
  masterCodeGrandChildrenByCodeQueryOptions,
  instructorMeQueryOptions,
} from '../../controller/instructor-profile.query-options'
import { transformArrayToObjectByKey } from '@/shared/lib/convertor'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { InstructorProfileDetailView } from '../components/InstructorProfileDetailView'
import { InstructorProfileEditView } from '../components/InstructorProfileEditView'

export const InstructorProfilePage = () => {
  const { t } = useTranslation()
  const { language } = useUiStore()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Get loader data (prefetched data)
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof import('../../controller/instructor-profile.loader').instructorProfileLoader>>

  // Get instructor profile data using Suspense Query (data is prefetched in loader)
  const { data: instructorData } = useSuspenseQuery({
    ...instructorMeQueryOptions(),
    initialData: loaderData.instructorMe,
  })

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

  const { data: instructorCity } = useQuery({
    ...masterCodeChildrenByCodeQueryOptions('500', {
      page: 0,
      size: 100,
    }),
    initialData: loaderData.instructorCity,
  })

  const { data: instructorRegion } = useQuery({
    ...masterCodeGrandChildrenByCodeQueryOptions('500-1', {
      page: 0,
      size: 100,
    }),
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

  // Map instructor data from API response
  const instructor = useMemo(() => {
    if (!instructorData) {
      return {
        id: 0,
        name: '',
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
    }
    return {
      id: instructorData.userId,
      name: instructorData.name || '',
      email: instructorData.email || '',
      phone: instructorData.phone || '',
      gender: instructorData.gender || '',
      dob: instructorData.dob || '',
      regionId: instructorData.regionId,
      cityId: instructorData.cityId,
      statusId: instructorData.statusId,
      classificationId: instructorData.classificationId,
      street: instructorData.street || '',
      detailAddress: instructorData.detailAddress || '',
      profilePhoto: instructorData.profilePhoto,
      signature: instructorData.signature,
    }
  }, [instructorData])

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
      <ErrorBoundary>
        {isEditMode ? (
          <InstructorProfileEditView
            instructor={instructor}
            cityMasterCode={instructorCity}
            cityMasterCodeMap={cityMasterCodeMap}
            districts={regions}
            cities={cities}
            isLoadingCities={isLoadingRegions}
            language={language}
            onSuccess={handleSuccess}
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
      </ErrorBoundary>
    </PageLayout>
  )
}
