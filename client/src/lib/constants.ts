import { Sprout, Rocket, Crown } from "lucide-react";

export interface LearningModule {
  title: string;
  completed: boolean;
}

export interface LearningPath {
  level: string;
  title: string;
  description: string;
  modules: LearningModule[];
  progress: number;
  locked: boolean;
  lockMessage?: string;
  icon: typeof Sprout;
  bgColor: string;
  badgeColor: string;
  iconColor: string;
  buttonColor: string;
  buttonHover: string;
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    level: "초급자",
    title: "PartyRock 시작하기",
    description: "AI와 PartyRock의 기본 개념을 익히고 첫 번째 앱을 만들어보세요.",
    modules: [
      { title: "생성형 AI 이해하기", completed: true },
      { title: "PartyRock 계정 만들기", completed: true },
      { title: "첫 번째 앱 만들기", completed: false },
      { title: "위젯 활용법", completed: false },
    ],
    progress: 50,
    locked: false,
    icon: Sprout,
    bgColor: "bg-green-50 border-green-100",
    badgeColor: "bg-green-100 text-green-800",
    iconColor: "text-green-600",
    buttonColor: "bg-green-600",
    buttonHover: "bg-green-700",
  },
  {
    level: "중급자",
    title: "실무 활용하기",
    description: "업무에 바로 적용할 수 있는 실용적인 AI 앱을 개발해보세요.",
    modules: [
      { title: "업무 자동화 도구 만들기", completed: false },
      { title: "교육용 챗봇 개발", completed: false },
      { title: "문서 분석 앱 제작", completed: false },
    ],
    progress: 0,
    locked: true,
    lockMessage: "초급 과정 완료 필요",
    icon: Rocket,
    bgColor: "bg-blue-50 border-blue-100",
    badgeColor: "bg-blue-100 text-blue-800",
    iconColor: "text-blue-600",
    buttonColor: "bg-blue-600",
    buttonHover: "bg-blue-700",
  },
  {
    level: "전문가",
    title: "전문가 과정",
    description: "복잡한 AI 워크플로우와 고급 기능을 마스터해보세요.",
    modules: [
      { title: "복잡한 워크플로우 설계", completed: false },
      { title: "다중 위젯 연동", completed: false },
      { title: "프롬프트 엔지니어링 고급", completed: false },
    ],
    progress: 0,
    locked: true,
    lockMessage: "중급 과정 완료 필요",
    icon: Crown,
    bgColor: "bg-purple-50 border-purple-100",
    badgeColor: "bg-purple-100 text-purple-800",
    iconColor: "text-purple-600",
    buttonColor: "bg-purple-600",
    buttonHover: "bg-purple-700",
  },
];

export const TUTORIAL_CATEGORIES = ["전체", "기초", "응용", "고급"];

export const APP_CATEGORIES = [
  { name: "전체", count: null },
  { name: "교육", count: 24 },
  { name: "비즈니스", count: 18 },
  { name: "정부/공공", count: 12 },
];
