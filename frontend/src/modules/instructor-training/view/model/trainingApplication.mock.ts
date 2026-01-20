import type { TrainingApplicationItem } from "../../model/training.types";

/**
 * Mock data for training applications
 */
export const MOCK_TRAINING_APPLICATIONS: TrainingApplicationItem[] = [
  {
    id: 1,
    educationId: "EDU-2025-001",
    trainingName: "Library Wallpaper Program",
    educationalInstitutions: "Suwon Office of Education",
    applicationRole: "Main lecturer",
    applicationDate: "2025-01-15",
    situation: "confirmed",
  },
  {
    id: 2,
    educationId: "EDU-2025-003",
    trainingName: "50th In-Depth Programming Course",
    educationalInstitutions: "Seongnam Office of Education",
    applicationRole: "Assistant Instructor",
    applicationDate: "2025-02-10",
    situation: "confirmed",
  },
  {
    id: 3,
    educationId: "EDU-2025-004",
    trainingName: "Customized coding education for special classes",
    educationalInstitutions: "Goyang Office of Education",
    applicationRole: "Main lecturer",
    applicationDate: "2025-02-20",
    situation: "rejected",
  },
  {
    id: 4,
    educationId: "EDU-2025-005",
    trainingName: "Online AI Basics Training",
    educationalInstitutions: "Yongin Office of Education",
    applicationRole: "Assistant Instructor",
    applicationDate: "2025-02-25",
    situation: "atmosphere",
  },
  {
    id: 5,
    educationId: "EDU-2025-006",
    trainingName: "New Instructor Training Program",
    educationalInstitutions: "Bucheon Office of Education",
    applicationRole: "Main lecturer",
    applicationDate: "2025-03-01",
    situation: "confirmed",
  },
];
