import type { ScheduleItem, ScheduleResponseDto } from './training.types'

/**
 * Map ScheduleResponseDto to ScheduleItem for table display
 */
export const mapScheduleDtoToItem = (dto: ScheduleResponseDto): ScheduleItem => {
  return {
    id: dto.id,
    programName: dto.programName ?? "",
    institutionName: dto.institutionName,
    date: dto.scheduleDate,
    startTime: dto.startTime,
    endTime: dto.endTime,
    status: dto.status,
    confirmedAt: dto.confirmedAt,
  }
}
