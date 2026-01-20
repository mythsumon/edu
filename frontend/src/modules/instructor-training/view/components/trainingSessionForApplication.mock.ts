import type { TrainingSessionForApplication } from "../../model/training.types";

/**
 * Mock data for training sessions available for application
 */
export const MOCK_TRAINING_SESSIONS: TrainingSessionForApplication[] = [
  {
    id: 1,
    educationId: "EDU-2025-001",
    institutionName: "Gyeonggi Future Filling",
    gradeAndClass: "Class 3, Grade 1",
    trainingName: "Lesson 12: Block Coding and Metaverse Basics and Artificial Intelligence (AI)",
    region: "Zone 1",
    period: {
      startDate: "2025-01-15",
      endDate: "2025-02-28",
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
        isSelected: true,
        isDisabled: false,
      },
    ],
  },
  {
    id: 2,
    educationId: "EDU-2025-002",
    institutionName: "Suwon Office of Education",
    gradeAndClass: "Class 1, Grade 2",
    trainingName: "Special education for island and remote areas",
    region: "Zone 2",
    period: {
      startDate: "2025-01-10",
      endDate: "2025-03-10",
    },
    roles: [
      {
        role: "mainLecturer",
        status: "unconfirmed",
        isSelected: false,
        isDisabled: true,
      },
      {
        role: "assistantTeacher",
        status: "unconfirmed",
        isSelected: true,
        isDisabled: false,
      },
    ],
  },
  {
    id: 3,
    educationId: "EDU-2025-003",
    institutionName: "Seongnam Office of Education",
    gradeAndClass: "4th grade class 2",
    trainingName: "50th In-Depth Programming Course",
    region: "Zone 3",
    period: {
      startDate: "2025-03-01",
      endDate: "2025-05-30",
    },
    roles: [
      {
        role: "mainLecturer",
        status: "unconfirmed",
        isSelected: false,
        isDisabled: true,
      },
      {
        role: "assistantTeacher",
        status: "confirmed",
        isSelected: true,
        isDisabled: false,
      },
    ],
  },
  {
    id: 4,
    educationId: "EDU-2025-004",
    institutionName: "Goyang Office of Education",
    gradeAndClass: "5th grade",
    trainingName: "Customized coding education for special classes",
    region: "Zone 4",
    period: {
      startDate: "2025-02-20",
      endDate: "2025-04-20",
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
    id: 5,
    educationId: "EDU-2025-005",
    institutionName: "Yongin Office of Education",
    gradeAndClass: "Class 2, Grade 3",
    trainingName: "Online AI Basics Training",
    region: "Zone 5",
    period: {
      startDate: "2025-02-25",
      endDate: "2025-04-25",
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
    id: 6,
    educationId: "EDU-2025-006",
    institutionName: "Bucheon Office of Education",
    gradeAndClass: "Class 1, Grade 2",
    trainingName: "New Instructor Training Program",
    region: "Zone 6",
    period: {
      startDate: "2025-03-01",
      endDate: "2025-05-01",
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
    id: 7,
    educationId: "EDU-2025-007",
    institutionName: "Incheon Office of Education",
    gradeAndClass: "3rd grade class 1",
    trainingName: "Advanced Programming Workshop",
    region: "Zone 7",
    period: {
      startDate: "2025-03-15",
      endDate: "2025-05-15",
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
];
