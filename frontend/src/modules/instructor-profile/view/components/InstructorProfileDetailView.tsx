import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'
import { Upload } from 'lucide-react'
import { formatDateDot } from '@/shared/lib/date'
import { GENDER_OPTIONS } from '@/shared/constants/users'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { ClassificationBadge } from '@/shared/components/ClassificationBadge'
import { SignatureUploadDialog } from './SignatureUploadDialog'

interface InstructorProfileDetailViewProps {
  instructor: {
    id: number
    name: string
    email: string
    phone: string
    gender: string
    dob: string
    street: string
    detailAddress: string
    cityId?: number
    regionId?: number
    statusId?: number
    classificationId?: number
    signature?: string
  }
  regionName: string
  cityName: string
  statusName: string
  classificationName: string
  getInitials: (name: string) => string
}

export const InstructorProfileDetailView = ({
  instructor,
  regionName,
  cityName,
  statusName,
  classificationName,
  getInitials,
}: InstructorProfileDetailViewProps) => {
  const { t } = useTranslation()
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // Get gender label
  const getGenderLabel = (gender?: string) => {
    if (!gender) return '-'
    return GENDER_OPTIONS.find((opt) => opt.value === gender)?.label || gender
  }

  // Format date of birth
  const formatDateOfBirth = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return formatDateDot(dateString)
    } catch {
      return dateString
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Profile Header Card with Avatar */}
      <Card className="rounded-2xl border border-border/20 bg-card shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
              <span className="text-primary font-semibold text-2xl">
                {getInitials(instructor.name)}
              </span>
            </div>
          </div>

          {/* Name and Email Section */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                {instructor.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {instructor.email || '-'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Information Card */}
      <Card className="rounded-2xl border border-border/20 bg-card shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground border-b-2 border-primary pb-2 inline-block">
              {t('profile.profileInformation')}
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('accountManagement.phoneNumber')}
              </Label>
              <p className="mt-1 text-sm text-foreground">
                {instructor.phone || '-'}
              </p>
            </div>

            {/* Gender */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('accountManagement.gender')}
              </Label>
              <p className="mt-1 text-sm text-foreground">
                {getGenderLabel(instructor.gender)}
              </p>
            </div>

            {/* Date of Birth */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('accountManagement.dateOfBirth')}
              </Label>
              <p className="mt-1 text-sm text-foreground">
                {formatDateOfBirth(instructor.dob)}
              </p>
            </div>

            {/* Region */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('accountManagement.region')}
              </Label>
              <p className="mt-1 text-sm text-foreground">
                {regionName}
              </p>
            </div>

            {/* City */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('accountManagement.city')}
              </Label>
              <p className="mt-1 text-sm text-foreground">
                {cityName}
              </p>
            </div>

            {/* Street */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('accountManagement.street')}
              </Label>
              <p className="mt-1 text-sm text-foreground">
                {instructor.street || '-'}
              </p>
            </div>

            {/* Detail Address */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('accountManagement.buildingNameLakeNumber')}
              </Label>
              <p className="mt-1 text-sm text-foreground">
                {instructor.detailAddress || '-'}
              </p>
            </div>

            {/* Status */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('profile.status')}
              </Label>
              <div className="mt-1">
                <StatusBadge status={statusName} />
              </div>
            </div>

            {/* Classification */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('profile.classification')}
              </Label>
              <div className="mt-1">
                <ClassificationBadge classification={classificationName} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Signature Image Card */}
      <Card className="rounded-2xl border border-border/20 bg-card shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {t('profile.signatureImage')}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('[InstructorProfileDetailView] Open upload dialog')
                  setIsUploadDialogOpen(true)
                }}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {instructor.signature ? t('profile.changeSignature') : t('profile.uploadSignature')}
              </Button>
            </div>
            {instructor.signature ? (
              <div className="mt-2">
                <img
                  src={instructor.signature}
                  alt="Signature"
                  className="max-w-xs h-auto max-h-48 object-contain rounded-lg border border-border"
                />
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                {t('profile.noSignature')}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Signature Upload Dialog */}
      <SignatureUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        currentSignature={instructor.signature}
      />
    </div>
  )
}
