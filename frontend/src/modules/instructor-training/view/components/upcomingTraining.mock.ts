import type { TrainingSessionForApplication } from "../../model/training.types";

/**
 * Mock data for upcoming training sessions scheduled to open
 * Currently empty as per the design
 */
export const MOCK_UPCOMING_TRAININGS: TrainingSessionForApplication[] = [
  {
    id: 1,
    educationId: "EDU-2025-101",
    institutionName: "Seoul Metropolitan Office of Education",
    gradeAndClass: "Class 1, Grade 3",
    trainingName: "Advanced AI and Machine Learning Workshop",
    region: "Zone 1",
    period: {
      startDate: "2025-06-01",
      endDate: "2025-08-31",
    },
    roles: [
      {
        role: "mainLecturer",
        status: "unconfirmed",
        isSelected: false,
        isDisabled: false,
      },
      {
        role: "assistantTeacher",
        status: "unconfirmed",
        isSelected: false,
        isDisabled: false,
      },
    ],
  },
  {
    id: 2,
    educationId: "EDU-2025-102",
    institutionName: "Busan Office of Education",
    gradeAndClass: "Class 2, Grade 4",
    trainingName: "Robotics and Automation Fundamentals",
    region: "Zone 2",
    period: {
      startDate: "2025-07-15",
      endDate: "2025-09-30",
    },
    roles: [
      {
        role: "mainLecturer",
        status: "unconfirmed",
        isSelected: false,
        isDisabled: false,
      },
    ],
  },
  {
    id: 3,
    educationId: "EDU-2025-103",
    institutionName: "Incheon Office of Education",
    gradeAndClass: "5th grade class 1",
    trainingName: "Cloud Computing and DevOps Basics",
    region: "Zone 3",
    period: {
      startDate: "2025-08-01",
      endDate: "2025-10-31",
    },
    roles: [
      {
        role: "assistantTeacher",
        status: "unconfirmed",
        isSelected: false,
        isDisabled: false,
      },
    ],
  },
  {
    id: 4,
    educationId: "EDU-2025-104",
    institutionName: "Daegu Office of Education",
    gradeAndClass: "Class 3, Grade 2",
    trainingName: "Cybersecurity and Ethical Hacking",
    region: "Zone 4",
    period: {
      startDate: "2025-09-01",
      endDate: "2025-11-30",
    },
    roles: [
      {
        role: "mainLecturer",
        status: "unconfirmed",
        isSelected: false,
        isDisabled: false,
      },
      {
        role: "assistantTeacher",
        status: "unconfirmed",
        isSelected: false,
        isDisabled: false,
      },
    ],
  },
  {
    id: 5,
    educationId: "EDU-2025-105",
    institutionName: "Gwangju Office of Education",
    gradeAndClass: "Class 1, Grade 5",
    trainingName: "Data Science and Big Data Analytics",
    region: "Zone 5",
    period: {
      startDate: "2025-10-01",
      endDate: "2025-12-31",
    },
    roles: [
      {
        role: "mainLecturer",
        status: "unconfirmed",
        isSelected: false,
        isDisabled: false,
      },
    ],
  },
];
