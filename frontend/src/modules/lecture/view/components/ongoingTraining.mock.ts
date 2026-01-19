import type { OngoingTrainingItem } from "../../model/lecture.types";

/**
 * Mock data for ongoing training
 */
export const MOCK_ONGOING_TRAININGS: OngoingTrainingItem[] = [
  {
    id: 1,
    trainingName: "Lesson 12: Block Coding and Metaverse Basics and Artificial Intelligence (AI)",
    institutionName: "Gyeonggi Future Filling",
    schedule: {
      startDate: "2025-01-15",
      endDate: "2025-02-28",
    },
    gradeAndClass: "Class 3, Grade 1",
    time: {
      startTime: "09:00",
      endTime: "09:40",
    },
  },
  {
    id: 2,
    trainingName: "50th In-Depth Programming Course",
    institutionName: "Seongnam Office of Education",
    schedule: {
      startDate: "2025-03-01",
      endDate: "2025-05-30",
    },
    gradeAndClass: "4th grade class 2",
    time: {
      startTime: "09:00",
      endTime: "10:40",
    },
  },
  {
    id: 3,
    trainingName: "New Instructor Training Program",
    institutionName: "Bucheon Office of Education",
    schedule: {
      startDate: "2025-04-15",
      endDate: "2025-06-30",
    },
    gradeAndClass: "Class 1, Grade 2",
    time: {
      startTime: "10:00",
      endTime: "11:40",
    },
  },
];
