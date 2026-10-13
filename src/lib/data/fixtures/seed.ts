import type {
  AuditLog,
  CategoryRelationship,
  Organization,
  OrganizationAlias,
  OrganizationBranch,
  OrganizationCategory,
  OrganizationResponse,
  PlatformSettings,
  Profile,
  RatingParameter,
  RatingQuestion,
  RatingTemplate,
  RatingTemplateVersion,
  ReviewerRelationshipType,
  Review,
  ReviewAnswer,
  ReviewScoreSnapshot,
  RatingValue,
} from "@/types/domain";
import {
  aggregateReviews,
  calculateReviewScore,
  toAnswerInputs,
} from "@/lib/scoring";
import { scoreThresholds } from "@/lib/config";

export interface SeedState {
  categories: OrganizationCategory[];
  relationshipTypes: ReviewerRelationshipType[];
  categoryRelationships: CategoryRelationship[];
  templates: RatingTemplate[];
  templateVersions: RatingTemplateVersion[];
  parameters: RatingParameter[];
  questions: RatingQuestion[];
  organizations: Organization[];
  aliases: OrganizationAlias[];
  branches: OrganizationBranch[];
  profiles: Profile[];
  reviews: Review[];
  answers: ReviewAnswer[];
  snapshots: ReviewScoreSnapshot[];
  responses: OrganizationResponse[];
  auditLogs: AuditLog[];
  settings: PlatformSettings;
}

const now = "2026-01-15T00:00:00.000Z";

function bid(en: string, bn: string) {
  return { en, bn };
}

interface ParamSeed {
  key: string;
  en: string;
  bn: string;
  weight: number;
  questions: Array<{ en: string; bn: string; required?: boolean }>;
}

interface TemplateSeed {
  slug: string;
  categorySlug: string;
  relationshipSlugs: string[];
  nameEn: string;
  nameBn: string;
  params: ParamSeed[];
}

export const categorySeeds: Array<{ slug: string; en: string; bn: string; icon: string; isFallback: boolean; descEn: string; descBn: string }> = [
  {
    slug: "private-company",
    en: "Private Company",
    bn: "বেসরকারি প্রতিষ্ঠান",
    icon: "building",
    isFallback: false,
    descEn:
      "Private companies and corporations. Ratings here reflect workplace culture: how supervisors lead, whether people are treated with dignity, and whether concerns can be raised safely.",
    descBn:
      "বেসরকারি প্রতিষ্ঠান ও কর্পোরেশন। এখানে কর্মক্ষেত্রের সংস্কৃতি প্রতিফলিত হয়: সুপারভাইজাররা কীভাবে নেতৃত্ব দেন, মানুষকে সম্মানের সাথেআচরণ করা হয় কি না এবং নিরাপদে উদ্বেগ জানানো যায় কি না।",
  },
  {
    slug: "hospital-clinic",
    en: "Hospital or Clinic",
    bn: "হাসপাতাল বা ক্লিনিক",
    icon: "hospital",
    isFallback: false,
    descEn:
      "Hospitals and clinics. Patient and employee perspectives are scored separately — clinical outcomes and pricing are never part of the culture score.",
    descBn:
      "হাসপাতাল ও ক্লিনিক। রোগী ও কর্মীর দৃষ্টিভঙ্গি আলাদাভাবে স্কোর করা হয় — চিকিৎসার ফলাফল ও মূল্য কখনো সংস্কৃতি স্কোরের অংশ নয়।",
  },
  {
    slug: "university-college",
    en: "University or College",
    bn: "বিশ্ববিদ্যালয় বা কলেজ",
    icon: "graduation",
    isFallback: false,
    descEn:
      "Universities and colleges. Student and faculty perspectives are evaluated with distinct parameters covering faculty conduct, administration and grievance handling.",
    descBn:
      "বিশ্ববিদ্যালয় ও কলেজ। শিক্ষার্থী ও শিক্ষকদের দৃষ্টিভঙ্গি আলাদা প্যারামিটারে মূল্যায়ন করা হয় — শিক্ষকদের আচরণ, প্রশাসন ও অভিযোগ নিষ্পত্তি।",
  },
  {
    slug: "government-office",
    en: "Government Office",
    bn: "সরকারি অফিস",
    icon: "landmark",
    isFallback: false,
    descEn:
      "Government offices and departments. Citizen and employee perspectives focus on respectful treatment, transparency and accountability of conduct.",
    descBn:
      "সরকারি অফিস ও বিভাগ। নাগরিক ও কর্মীদের দৃষ্টিভঙ্গি সম্মানজনক আচরণ, স্বচ্ছতা ও আচরণের জবাবদিহিতার উপর কেন্দ্রীভূত।",
  },
  {
    slug: "ngo-nonprofit",
    en: "NGO or Nonprofit",
    bn: "এনজিও বা অলাভজনক",
    icon: "heart-handshake",
    isFallback: false,
    descEn:
      "Non-governmental and nonprofit organizations. Beneficiary and staff perspectives measure dignity, fairness and the responsible use of institutional power.",
    descBn:
      "বেসরকারি ও অলাভজনক প্রতিষ্ঠান। সুবিধাভোগী ও কর্মীদের দৃষ্টিভঙ্গি মর্যাদা, ন্যায্যতা এবং প্রাতিষ্ঠানিক ক্ষমতার দায়িত্বশীল ব্যবহার মাপে।",
  },
  {
    slug: "school",
    en: "School",
    bn: "বিদ্যালয়",
    icon: "school",
    isFallback: false,
    descEn: "Schools and madrasas. Uses the general organizational culture template until a dedicated school methodology is configured.",
    descBn: "বিদ্যালয় ও মাদ্রাসা। নির্দিষ্ট বিদ্যালয় পদ্ধতি কনফিগার না হওয়া পর্যন্ত সাধারণ সাংগঠনিক সংস্কৃতি টেমপ্লেট ব্যবহার করে।",
  },
  {
    slug: "bank-financial",
    en: "Bank or Financial Institution",
    bn: "ব্যাংক বা আর্থিক প্রতিষ্ঠান",
    icon: "banknote",
    isFallback: false,
    descEn: "Banks and financial institutions. Uses the general organizational culture template until a dedicated methodology is configured.",
    descBn: "ব্যাংক ও আর্থিক প্রতিষ্ঠান। নির্দিষ্ট পদ্ধতি কনফিগার না হওয়া পর্যন্ত সাধারণ টেমপ্লেট ব্যবহার করে।",
  },
  {
    slug: "retail-commercial",
    en: "Retail or Commercial Establishment",
    bn: "খুচরা বা বাণিজ্যিক প্রতিষ্ঠান",
    icon: "store",
    isFallback: false,
    descEn: "Retail and commercial establishments. Uses the general organizational culture template until a dedicated methodology is configured.",
    descBn: "খুচরা ও বাণিজ্যিক প্রতিষ্ঠান। নির্দিষ্ট পদ্ধতি কনফিগার না হওয়া পর্যন্ত সাধারণ টেমপ্লেট ব্যবহার করে।",
  },
  {
    slug: "other",
    en: "Other Organization",
    bn: "অন্যান্য প্রতিষ্ঠান",
    icon: "circle-help",
    isFallback: true,
    descEn:
      "Fallback category for organizations without a dedicated template. The administrator can create a category-specific template before public rollout.",
    descBn:
      "নির্দিষ্ট টেমপ্লেট নেই এমন প্রতিষ্ঠানের জন্য বিকল্প ক্যাটাগরি। প্রকাশের আগে অ্যাডমিন নির্দিষ্ট টেমপ্লেট তৈরি করতে পারেন।",
  },
];

export const relationshipSeeds: Array<{ slug: string; en: string; bn: string; kind: ReviewerRelationshipType["kind"] }> = [
  { slug: "current-employee", en: "Current employee", bn: "বর্তমান কর্মী", kind: "employee" },
  { slug: "former-employee", en: "Former employee", bn: "সাবেক কর্মী", kind: "employee" },
  { slug: "contractor", en: "Contractor", bn: "ঠিকাদার", kind: "employee" },
  { slug: "patient", en: "Patient", bn: "রোগী", kind: "patient" },
  { slug: "patient-attendant", en: "Patient attendant", bn: "রোগীর সহকারী", kind: "patient" },
  { slug: "student", en: "Student", bn: "শিক্ষার্থী", kind: "student" },
  { slug: "former-student", en: "Former student", bn: "সাবেক শিক্ষার্থী", kind: "student" },
  { slug: "faculty", en: "Faculty member", bn: "শিক্ষক", kind: "other" },
  { slug: "admin-staff", en: "Administrative staff", bn: "প্রশাসনিক কর্মী", kind: "employee" },
  { slug: "citizen", en: "Citizen", bn: "নাগরিক", kind: "citizen" },
  { slug: "visitor", en: "Visitor", bn: "দর্শনার্থী", kind: "visitor" },
  { slug: "government-employee", en: "Government employee", bn: "সরকারি কর্মী", kind: "employee" },
  { slug: "beneficiary", en: "Beneficiary", bn: "সুবিধাভোগী", kind: "beneficiary" },
  { slug: "volunteer", en: "Volunteer", bn: "স্বেচ্ছাসেবক", kind: "other" },
];

export const categoryRelationshipSeeds: Record<string, string[]> = {
  "private-company": ["current-employee", "former-employee", "contractor"],
  "hospital-clinic": ["patient", "patient-attendant", "current-employee", "former-employee"],
  "university-college": ["student", "former-student", "faculty", "admin-staff"],
  "government-office": ["citizen", "visitor", "government-employee"],
  "ngo-nonprofit": ["beneficiary", "current-employee", "volunteer"],
  "school": ["current-employee", "former-employee"],
  "bank-financial": ["current-employee", "former-employee"],
  "retail-commercial": ["current-employee", "former-employee"],
  "other": ["current-employee", "former-employee"],
};

function q(en: string, bn: string, required = true) {
  return { en, bn, required };
}

export const templateSeeds: TemplateSeed[] = [
  {
    slug: "corporate-workplace",
    categorySlug: "private-company",
    relationshipSlugs: ["current-employee", "former-employee", "contractor"],
    nameEn: "Corporate Workplace Culture",
    nameBn: "কর্পোরেট কর্মক্ষেত্র সংস্কৃতি",
    params: [
      { key: "leadership", en: "Leadership and supervisor behavior", bn: "নেতৃত্ব ও সুপারভাইজার আচরণ", weight: 20, questions: [q("Do supervisors communicate respectfully with junior employees?", "সুপারভাইজাররা জুনিয়র কর্মীদের সাথে সম্মানের সাথে কথা বলেন?")] },
      { key: "respect", en: "Workplace respect and dignity", bn: "কর্মক্ষেত্রে সম্মান ও মর্যাদা", weight: 20, questions: [q("Are employees treated with dignity regardless of their position?", "পদ যাই হোক, কর্মীদের মর্যাদার সাথে ব্যবহার করা হয়?")] },
      { key: "fairness", en: "Fairness and favoritism", bn: "ন্যায্যতা ও পক্ষপাত", weight: 15, questions: [q("Are employees treated fairly regardless of personal connections?", "ব্যক্তিগত যোগাযোগ নির্বিশেষে কর্মীদের সাথে ন্যায্যভাবেআচরণ করা হয়?")] },
      { key: "psych-safety", en: "Psychological safety and freedom to speak up", bn: "মনস্তাত্ত্বিক নিরাপত্তা ও মত প্রকাশের স্বাধীনতা", weight: 15, questions: [q("Can employees express disagreement without intimidation?", "ভয়ভীতি ছাড়াই কর্মীরা দ্বিমত প্রকাশ করতে পারেন?")] },
      { key: "communication", en: "Communication and transparency", bn: "যোগাযোগ ও স্বচ্ছতা", weight: 10, questions: [q("Is important information communicated openly?", "গুরুত্বপূর্ণ তথ্য খোলাখুলিভাবে জানানো হয়?")] },
      { key: "work-life", en: "Work-life boundaries and respect for personal time", bn: "কর্ম-জীবন সীমা ও ব্যক্তিগত সময়ের প্রতি সম্মান", weight: 10, questions: [q("Are employees' time and personal boundaries respected?", "কর্মীদের সময় ও ব্যক্তিগত সীমার প্রতি সম্মান দেখানো হয়?")] },
      { key: "grievance", en: "Conflict resolution and grievance handling", bn: "দ্বন্দ্ব সমাধান ও অভিযোগ নিষ্পত্তি", weight: 10, questions: [q("Are complaints or concerns taken seriously?", "অভিযোগ বা উদ্বেগ গুরুত্বের সাথে নেওয়া হয়?")] },
    ],
  },
  {
    slug: "hospital-patient",
    categorySlug: "hospital-clinic",
    relationshipSlugs: ["patient", "patient-attendant"],
    nameEn: "Patient Culture Experience",
    nameBn: "রোগীর সংস্কৃতি অভিজ্ঞান",
    params: [
      { key: "respect", en: "Respectful staff behavior", bn: "কর্মীদের সম্মানজনক আচরণ", weight: 20, questions: [q("Did staff speak respectfully?", "কর্মীরা সম্মানের সাথে কথা বলেছেন?")] },
      { key: "listening", en: "Communication and listening", bn: "যোগাযোগ ও শ্রবণ", weight: 20, questions: [q("Were your concerns heard without unnecessary dismissal?", "অপ্রয়োজনীয়ভাবে এড়িয়ে না গিয়ে আপনার উদ্বেগ শোনা হয়েছে?")] },
      { key: "dignity", en: "Personal dignity and privacy", bn: "ব্যক্তিগত মর্যাদা ও গোপনীয়তা", weight: 15, questions: [q("Was your dignity protected during interactions?", "আলাপের সময় আপনার মর্যাদা রক্ষা করা হয়েছে?")] },
      { key: "equality", en: "Fair and equal treatment", bn: "ন্যায্য ও সমান আচরণ", weight: 15, questions: [q("Were people treated equally regardless of social or financial background?", "সামাজিক বা আর্থিক অবস্থা নির্বিশেষে সবাইকে সমানভাবেআচরণ করা হয়েছে?")] },
      { key: "accountability", en: "Accountability and complaint handling", bn: "জবাবদিহিতা ও অভিযোগ নিষ্পত্তি", weight: 15, questions: [q("Were complaints handled professionally?", "অভিযোগ পেশাদারভাবে নিষ্পত্তি করা হয়েছে?")] },
      { key: "empathy", en: "Empathy and sensitivity", bn: "সহানুভূতি ও সংবেদনশীলতা", weight: 10, questions: [] },
      { key: "no-intimidation", en: "Freedom from intimidating behavior", bn: "ভয়ভীতিমুক্ত পরিবেশ", weight: 5, questions: [] },
    ],
  },
  {
    slug: "hospital-employee",
    categorySlug: "hospital-clinic",
    relationshipSlugs: ["current-employee", "former-employee"],
    nameEn: "Hospital Workplace Culture",
    nameBn: "হাসপাতাল কর্মক্ষেত্র সংস্কৃতি",
    params: [
      { key: "management", en: "Management behavior and professional respect", bn: "ব্যবস্থাপনার আচরণ ও পেশাদার সম্মান", weight: 20, questions: [] },
      { key: "fairness", en: "Workplace fairness", bn: "কর্মক্ষেত্রে ন্যায্যতা", weight: 15, questions: [] },
      { key: "safety", en: "Safety to raise concerns", bn: "উদ্বেগ জানানোর নিরাপত্তা", weight: 15, questions: [] },
      { key: "teamwork", en: "Teamwork and cooperation", bn: "দলগত কাজ ও সহযোগিতা", weight: 15, questions: [] },
      { key: "workload", en: "Fairness of workload expectations", bn: "কর্মভার প্রত্যাশার ন্যায্যতা", weight: 10, questions: [] },
      { key: "conduct", en: "Professional conduct", bn: "পেশাদার আচরণ", weight: 15, questions: [] },
      { key: "grievance", en: "Internal complaint handling", bn: "অভ্যন্তরীণ অভিযোগ নিষ্পত্তি", weight: 10, questions: [] },
    ],
  },
  {
    slug: "university-student",
    categorySlug: "university-college",
    relationshipSlugs: ["student", "former-student"],
    nameEn: "University Student Experience",
    nameBn: "বিশ্ববিদ্যালয় শিক্ষার্থী অভিজ্ঞান",
    params: [
      { key: "faculty-respect", en: "Faculty respect toward students", bn: "শিক্ষকদের প্রতি শিক্ষার্থীর সম্মান", weight: 20, questions: [q("Do teachers treat students respectfully?", "শিক্ষকরা শিক্ষার্থীদের সাথে সম্মানের সাথে ব্যবহার করেন?")] },
      { key: "admin-behavior", en: "Administrative staff behavior", bn: "প্রশাসনিক কর্মীদের আচরণ", weight: 15, questions: [q("Are administrative employees approachable and professional?", "প্রশাসনিক কর্মীরা সহজলভ্য ও পেশাদার?")] },
      { key: "fairness", en: "Fairness and absence of favoritism", bn: "ন্যায্যতা ও পক্ষপাতহীনতা", weight: 20, questions: [q("Is favoritism a common issue?", "পক্ষপাত একটি সাধারণ সমস্যা?")] },
      { key: "dignity", en: "Student dignity and psychological safety", bn: "শিক্ষার্থীর মর্যাদা ও মনস্তাত্ত্বিক নিরাপত্তা", weight: 15, questions: [q("Can students raise academic or administrative concerns safely?", "শিক্ষার্থীরা নিরাপদে একাডেমিক বা প্রশাসনিক উদ্বেগ জানাতে পারেন?")] },
      { key: "grievance", en: "Grievance and harassment response", bn: "অভিযোগ ও হয়রানি প্রতিক্রিয়া", weight: 15, questions: [q("Are formal complaints handled fairly?", "আনুষ্ঠানিক অভিযোগ ন্যায্যভাবে নিষ্পত্তি হয়?")] },
      { key: "communication", en: "Communication and clarity", bn: "যোগাযোগ ও স্পষ্টতা", weight: 10, questions: [] },
      { key: "inclusion", en: "Inclusion and equal treatment", bn: "অন্তর্ভুক্তি ও সমান আচরণ", weight: 5, questions: [] },
    ],
  },
  {
    slug: "university-faculty",
    categorySlug: "university-college",
    relationshipSlugs: ["faculty", "admin-staff"],
    nameEn: "University Faculty & Staff Culture",
    nameBn: "বিশ্ববিদ্যালয় শিক্ষক ও কর্মী সংস্কৃতি",
    params: [
      { key: "leadership", en: "Leadership and supervisor respect", bn: "নেতৃত্ব ও সুপারভাইজার সম্মান", weight: 20, questions: [] },
      { key: "fairness", en: "Professional fairness", bn: "পেশাদার ন্যায্যতা", weight: 15, questions: [] },
      { key: "autonomy", en: "Academic and professional autonomy", bn: "একাডেমিক ও পেশাদার স্বায়ত্তশাসন", weight: 15, questions: [] },
      { key: "communication", en: "Internal communication", bn: "অভ্যন্তরীণ যোগাযোগ", weight: 10, questions: [] },
      { key: "safety", en: "Workplace safety and harassment response", bn: "কর্মক্ষেত্র নিরাপত্তা ও হয়রানি প্রতিক্রিয়া", weight: 15, questions: [] },
      { key: "grievance", en: "Grievance handling", bn: "অভিযোগ নিষ্পত্তি", weight: 15, questions: [] },
      { key: "collegiality", en: "Collegiality and teamwork", bn: "সৌহার্দ্য ও দলগত কাজ", weight: 10, questions: [] },
    ],
  },
  {
    slug: "government-citizen",
    categorySlug: "government-office",
    relationshipSlugs: ["citizen", "visitor"],
    nameEn: "Public Office Culture",
    nameBn: "সরকারি অফিস সংস্কৃতি",
    params: [
      { key: "respect", en: "Respectful treatment", bn: "সম্মানজনক আচরণ", weight: 25, questions: [] },
      { key: "fairness", en: "Fair and equal behavior", bn: "ন্যায্য ও সমান আচরণ", weight: 20, questions: [] },
      { key: "clarity", en: "Clarity of communication", bn: "যোগাযোগের স্পষ্টতা", weight: 15, questions: [] },
      { key: "transparency", en: "Transparency of official conduct", bn: "আনুষ্ঠানিক আচরণের স্বচ্ছতা", weight: 15, questions: [] },
      { key: "responsiveness", en: "Responsiveness to concerns", bn: "উদ্বেগে সাড়া", weight: 15, questions: [] },
      { key: "dignity", en: "Dignity and professionalism", bn: "মর্যাদা ও পেশাদারিত্ব", weight: 10, questions: [] },
    ],
  },
  {
    slug: "government-employee",
    categorySlug: "government-office",
    relationshipSlugs: ["government-employee"],
    nameEn: "Government Workplace Culture",
    nameBn: "সরকারি কর্মক্ষেত্র সংস্কৃতি",
    params: [
      { key: "supervisor", en: "Supervisor behavior", bn: "সুপারভাইজার আচরণ", weight: 20, questions: [] },
      { key: "fairness", en: "Fairness and favoritism", bn: "ন্যায্যতা ও পক্ষপাত", weight: 20, questions: [] },
      { key: "expression", en: "Freedom to express concerns", bn: "উদ্বেগ প্রকাশের স্বাধীনতা", weight: 15, questions: [] },
      { key: "teamwork", en: "Teamwork", bn: "দলগত কাজ", weight: 15, questions: [] },
      { key: "dignity", en: "Professional dignity", bn: "পেশাদার মর্যাদা", weight: 15, questions: [] },
      { key: "grievance", en: "Grievance handling", bn: "অভিযোগ নিষ্পত্তি", weight: 15, questions: [] },
    ],
  },
  {
    slug: "ngo-beneficiary",
    categorySlug: "ngo-nonprofit",
    relationshipSlugs: ["beneficiary"],
    nameEn: "Beneficiary Culture Experience",
    nameBn: "সুবিধাভোগী সংস্কৃতি অভিজ্ঞান",
    params: [
      { key: "respect", en: "Respectful and dignified treatment", bn: "সম্মানজনক ও মর্যাদাপূর্ণ আচরণ", weight: 25, questions: [] },
      { key: "fairness", en: "Fairness and nondiscrimination", bn: "ন্যায্যতা ও বৈষম্যহীনতা", weight: 20, questions: [] },
      { key: "listening", en: "Listening and communication", bn: "শ্রবণ ও যোগাযোগ", weight: 15, questions: [] },
      { key: "power", en: "Respectful use of institutional power", bn: "প্রাতিষ্ঠানিক ক্ষমতার সম্মানজনক ব্যবহার", weight: 15, questions: [] },
      { key: "complaint", en: "Safe complaint channels", bn: "নিরাপদ অভিযোগ মাধ্যম", weight: 15, questions: [] },
      { key: "confidentiality", en: "Confidentiality and discretion", bn: "গোপনীয়তা ও বিবেচনা", weight: 10, questions: [] },
    ],
  },
  {
    slug: "ngo-employee",
    categorySlug: "ngo-nonprofit",
    relationshipSlugs: ["current-employee", "volunteer"],
    nameEn: "NGO Staff Culture",
    nameBn: "এনজিও কর্মী সংস্কৃতি",
    params: [
      { key: "leadership", en: "Leadership behavior", bn: "নেতৃত্বের আচরণ", weight: 20, questions: [] },
      { key: "respect", en: "Workplace respect", bn: "কর্মক্ষেত্রে সম্মান", weight: 20, questions: [] },
      { key: "fairness", en: "Fairness", bn: "ন্যায্যতা", weight: 15, questions: [] },
      { key: "ethics", en: "Ethical organizational practices", bn: "নৈতিক সাংগঠনিক অনুশীলন", weight: 15, questions: [] },
      { key: "psych-safety", en: "Psychological safety", bn: "মনস্তাত্ত্বিক নিরাপত্তা", weight: 10, questions: [] },
      { key: "teamwork", en: "Teamwork and communication", bn: "দলগত কাজ ও যোগাযোগ", weight: 10, questions: [] },
      { key: "accountability", en: "Internal accountability", bn: "অভ্যন্তরীণ জবাবদিহিতা", weight: 10, questions: [] },
    ],
  },
  {
    slug: "general-fallback",
    categorySlug: "other",
    relationshipSlugs: ["current-employee", "former-employee"],
    nameEn: "General Organizational Culture (Fallback)",
    nameBn: "সাধারণ সাংগঠনিক সংস্কৃতি (বিকল্প)",
    params: [
      { key: "respect", en: "Respect and dignity", bn: "সম্মান ও মর্যাদা", weight: 25, questions: [] },
      { key: "fairness", en: "Fairness", bn: "ন্যায্যতা", weight: 20, questions: [] },
      { key: "communication", en: "Communication", bn: "যোগাযোগ", weight: 20, questions: [] },
      { key: "accountability", en: "Accountability", bn: "জবাবদিহিতা", weight: 20, questions: [] },
      { key: "conduct", en: "Professional conduct", bn: "পেশাদার আচরণ", weight: 15, questions: [] },
    ],
  },
];

export const organizationSeeds: Array<{
  slug: string;
  en: string;
  bn: string;
  categorySlug: string;
  division: string;
  district: string;
  city: string;
  descriptionEn: string;
  descriptionBn: string;
  website?: string;
  googleMapsUrl?: string;
  branches?: Array<{ name: string; city: string; district: string }>;
}> = [
  {
    slug: "sample-nexus-technologies",
    en: "Nexus Technologies Ltd. (Sample)",
    bn: "নেক্সাস টেকনোলজিস লিমিটেড (নমুনা)",
    categorySlug: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    descriptionEn: "Development fixture: a sample private software company used to demonstrate workplace culture scoring. This is not a real listing.",
    descriptionBn: "ডেভেলপমেন্ট ফিক্সচার: কর্মক্ষেত্র সংস্কৃতি স্কোর প্রদর্শনের জন্য একটি নমুনা সফটওয়্যার প্রতিষ্ঠান। এটি বাস্তব তালিকা নয়।",
    website: "https://example.com",
  },
  {
    slug: "sample-city-general-hospital",
    en: "City General Hospital (Sample)",
    bn: "সিটি জেনারেল হাসপাতাল (নমুনা)",
    categorySlug: "hospital-clinic",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    descriptionEn: "Development fixture: a sample hospital with separate patient and employee perspectives.",
    descriptionBn: "ডেভেলপমেন্ট ফিক্সচার: রোগী ও কর্মীর আলাদা দৃষ্টিভঙ্গিসহ একটি নমুনা হাসপাতাল।",
    googleMapsUrl: "https://www.google.com/maps",
    branches: [
      { name: "Dhanmondi Branch", city: "Dhaka", district: "Dhaka" },
      { name: "Chattogram Branch", city: "Chattogram", district: "Chattogram" },
    ],
  },
  {
    slug: "sample-national-university",
    en: "National University (Sample)",
    bn: "জাতীয় বিশ্ববিদ্যালয় (নমুনা)",
    categorySlug: "university-college",
    division: "Dhaka",
    district: "Gazipur",
    city: "Gazipur",
    descriptionEn: "Development fixture: a sample university demonstrating separate student and faculty culture templates.",
    descriptionBn: "ডেভেলপমেন্ট ফিক্সচার: শিক্ষার্থী ও শিক্ষকদের আলাদা সংস্কৃতি টেমপ্লেট প্রদর্শনের নমুনা বিশ্ববিদ্যালয়।",
  },
  {
    slug: "sample-ministry-of-public-services",
    en: "Ministry of Public Services (Sample)",
    bn: "জনসেবা মন্ত্রণালয় (নমুনা)",
    categorySlug: "government-office",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    descriptionEn: "Development fixture: a sample government office with citizen and employee perspectives.",
    descriptionBn: "ডেভেলপমেন্ট ফিক্সচার: নাগরিক ও কর্মীর দৃষ্টিভঙ্গিসহ একটি নমুনা সরকারি অফিস।",
  },
  {
    slug: "sample-hope-foundation",
    en: "Hope Foundation (Sample)",
    bn: "হোপ ফাউন্ডেশন (নমুনা)",
    categorySlug: "ngo-nonprofit",
    division: "Chattogram",
    district: "Chattogram",
    city: "Chattogram",
    descriptionEn: "Development fixture: a sample NGO with beneficiary and staff perspectives.",
    descriptionBn: "ডেভেলপমেন্ট ফিক্সচার: সুবিধাভোগী ও কর্মীদের দৃষ্টিভঙ্গিসহ একটি নমুনা এনজিও।",
  },

  // ---------------------------------------------------------------------------
  // BANGLADESHI ORGANIZATIONS
  // Real organisations across categories. Listings are factual; ratings are
  // generated only from approved community reviews.
  // ---------------------------------------------------------------------------

  // --- Banks & Financial Institutions ---
  { slug: "bangladesh-bank", en: "Bangladesh Bank", bn: "বাংলাদেশ ব্যাংক", categorySlug: "bank-financial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The central bank of Bangladesh.", descriptionBn: "বাংলাদেশের কেন্দ্রীয় ব্যাংক।", website: "https://www.bb.org.bd" },
  { slug: "brac-bank", en: "BRAC Bank", bn: "ব্র্যাক ব্যাংক", categorySlug: "bank-financial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A leading private commercial bank in Bangladesh.", descriptionBn: "বাংলাদেশের একটি শীর্ষস্থানীয় বেসরকারি বাণিজ্যিক ব্যাংক।", website: "https://www.bracbank.com" },
  { slug: "dutch-bangla-bank", en: "Dutch-Bangla Bank", bn: "ডাচ-বাংলা ব্যাংক", categorySlug: "bank-financial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A private commercial bank known for its ATM network.", descriptionBn: "এটিএম নেটওয়ার্কের জন্য পরিচিত একটি বেসরকারি বাণিজ্যিক ব্যাংক।", website: "https://www.dutchbanglabank.com" },
  { slug: "islami-bank-bangladesh", en: "Islami Bank Bangladesh", bn: "ইসলামী ব্যাংক বাংলাদেশ", categorySlug: "bank-financial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The first Shariah-based bank in Bangladesh.", descriptionBn: "বাংলাদেশের প্রথম শরীয়াহভিত্তিক ব্যাংক।", website: "https://www.islamibankbd.com" },
  { slug: "prime-bank", en: "Prime Bank", bn: "প্রাইম ব্যাংক", categorySlug: "bank-financial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A private commercial bank in Bangladesh.", descriptionBn: "বাংলাদেশের একটি বেসরকারি বাণিজ্যিক ব্যাংক।", website: "https://www.primebank.com.bd" },
  { slug: "standard-chartered-bangladesh", en: "Standard Chartered Bangladesh", bn: "স্ট্যান্ডার্ড চার্টার্ড বাংলাদেশ", categorySlug: "bank-financial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The Bangladesh operations of Standard Chartered.", descriptionBn: "স্ট্যান্ডার্ড চার্টার্ডের বাংলাদেশ কার্যক্রম।", website: "https://www.sc.com/bd/" },
  { slug: "city-bank-bangladesh", en: "City Bank", bn: "সিটি ব্যাংক", categorySlug: "bank-financial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A private commercial bank in Bangladesh.", descriptionBn: "বাংলাদেশের একটি বেসরকারি বাণিজ্যিক ব্যাংক।", website: "https://www.citybankplc.com" },
  { slug: "eastern-bank-bangladesh", en: "Eastern Bank", bn: "ইস্টার্ন ব্যাংক", categorySlug: "bank-financial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A private commercial bank in Bangladesh.", descriptionBn: "বাংলাদেশের একটি বেসরকারি বাণিজ্যিক ব্যাংক।", website: "https://www.ebl.com.bd" },

  // --- Private Companies (telecom, tech, manufacturing) ---
  { slug: "grameenphone", en: "Grameenphone", bn: "গ্রামীণফোন", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The largest mobile network operator in Bangladesh.", descriptionBn: "বাংলাদেশের বৃহত্তম মোবাইল নেটওয়ার্ক অপারেটর।", website: "https://www.grameenphone.com" },
  { slug: "robi-axiata", en: "Robi Axiata", bn: "রবি আজিয়াটা", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A major mobile network operator in Bangladesh.", descriptionBn: "বাংলাদেশের একটি প্রধান মোবাইল নেটওয়ার্ক অপারেটর।", website: "https://www.robi.com.bd" },
  { slug: "banglalink", en: "Banglalink", bn: "বাংলালিংক", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A mobile network operator in Bangladesh.", descriptionBn: "বাংলাদেশের একটি মোবাইল নেটওয়ার্ক অপারেটর।", website: "https://www.banglalink.com.bd" },
  { slug: "bkash", en: "bKash", bn: "বিকাশ", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A leading mobile financial service provider.", descriptionBn: "একটি শীর্ষস্থানীয় মোবাইল আর্থিক সেবা প্রদানকারী।", website: "https://www.bkash.com" },
  { slug: "nagad", en: "Nagad", bn: "নগদ", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A mobile financial service operated by Bangladesh Post Office.", descriptionBn: "বাংলাদেশ ডাক বিভাগ পরিচালিত একটি মোবাইল আর্থিক সেবা।", website: "https://www.mynagad.com" },
  { slug: "pathao", en: "Pathao", bn: "পাঠাও", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi ride-sharing and delivery platform.", descriptionBn: "একটি বাংলাদেশি রাইড-শেয়ারিং ও ডেলিভারি প্ল্যাটফর্ম।", website: "https://www.pathao.com" },
  { slug: "square-pharmaceuticals", en: "Square Pharmaceuticals", bn: "স্কয়ার ফার্মাসিউটিক্যালস", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The largest pharmaceutical company in Bangladesh.", descriptionBn: "বাংলাদেশের বৃহত্তম ঔষধ কোম্পানি।", website: "https://www.squarepharma.com.bd" },
  { slug: "beximco-pharmaceuticals", en: "Beximco Pharmaceuticals", bn: "বিএক্সিমকো ফার্মাসিউটিক্যালস", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A major pharmaceutical manufacturer in Bangladesh.", descriptionBn: "বাংলাদেশের একটি প্রধান ঔষধ প্রস্তুতকারক।", website: "https://www.beximcopharma.com" },
  { slug: "beringer-pharma", en: "Beximco", bn: "বিএক্সিমকো", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A diversified Bangladeshi conglomerate.", descriptionBn: "একটি বহুমুখী বাংলাদেশি কনগ্লোমারেট।", website: "https://www.beximco.com" },
  { slug: "aci-limited", en: "Advanced Chemical Industries (ACI)", bn: "এসিআই লিমিটেড", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi conglomerate in pharma, agribusiness and consumer brands.", descriptionBn: "ঔষধ, কৃষি ও ভোক্তা পণ্যে একটি বাংলাদেশি কনগ্লোমারেট।", website: "https://www.aci-bd.com" },
  { slug: "pran-rfl-group", en: "PRAN-RFL Group", bn: "প্রাণ-আরএফএল গ্রুপ", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A food and consumer goods conglomerate.", descriptionBn: "একটি খাদ্য ও ভোক্তা পণ্য কনগ্লোমারেট।", website: "https://www.prangroup.com" },
  { slug: "meghna-group", en: "Meghna Group of Industries", bn: "মেঘনা গ্রুপ অব ইন্ডাস্ট্রিজ", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A large diversified industrial group.", descriptionBn: "একটি বড় বহুমুখী শিল্প গ্রুপ।", website: "https://www.meghnagroup.biz" },
  { slug: "akij-group", en: "Akij Group", bn: "আকিজ গ্রুপ", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A large Bangladeshi industrial conglomerate.", descriptionBn: "একটি বড় বাংলাদেশি শিল্প কনগ্লোমারেট।", website: "https://www.akij.net" },

  // --- Hospitals & Clinics ---
  { slug: "apollo-hospitals-dhaka", en: "Apollo Hospitals Dhaka", bn: "অ্যাপোলো হাসপাতাল ঢাকা", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A leading private hospital in Dhaka.", descriptionBn: "ঢাকার একটি শীর্ষস্থানীয় বেসরকারি হাসপাতাল।", website: "https://www.apollodhaka.com" },
  { slug: "united-hospital-dhaka", en: "United Hospital", bn: "ইউনাইটেড হাসপাতাল", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A private hospital in Dhaka.", descriptionBn: "ঢাকার একটি বেসরকারি হাসপাতাল।", website: "https://www.unitedhospital.com.bd" },
  { slug: "square-hospital", en: "Square Hospital", bn: "স্কয়ার হাসপাতাল", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A private hospital in Dhaka.", descriptionBn: "ঢাকার একটি বেসরকারি হাসপাতাল।", website: "https://www.squarehospital.com" },
  { slug: "evercare-hospital-dhaka", en: "Evercare Hospital Dhaka", bn: "এভারকেয়ার হাসপাতাল ঢাকা", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A private tertiary hospital in Dhaka.", descriptionBn: "ঢাকার একটি বেসরকারি টারশিয়ারি হাসপাতাল।", website: "https://www.evercarebd.com" },
  { slug: "labaid-specialized-hospital", en: "LabAid Specialized Hospital", bn: "ল্যাবএইড স্পেশালাইজড হাসপাতাল", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A specialized private hospital in Dhaka.", descriptionBn: "ঢাকার একটি বিশেষায়িত বেসরকারি হাসপাতাল।", website: "https://www.labaid.com" },
  { slug: "square-hospital-limited", en: "Popular Diagnostic Centre", bn: "পপুলার ডায়াগনস্টিক সেন্টার", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A diagnostic and hospital chain in Bangladesh.", descriptionBn: "বাংলাদেশের একটি ডায়াগনস্টিক ও হাসপাতাল চেইন।", website: "https://www.populardiagnostic.com" },

  // --- Universities & Colleges ---
  { slug: "university-of-dhaka", en: "University of Dhaka", bn: "ঢাকা বিশ্ববিদ্যালয়", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The oldest public university in Bangladesh.", descriptionBn: "বাংলাদেশের প্রাচীনতম পাবলিক বিশ্ববিদ্যালয়।", website: "https://www.du.ac.bd" },
  { slug: "buet", en: "Bangladesh University of Engineering and Technology (BUET)", bn: "বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয়", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A leading public engineering university.", descriptionBn: "একটি শীর্ষস্থানীয় পাবলিক প্রকৌশল বিশ্ববিদ্যালয়।", website: "https://www.buet.ac.bd" },
  { slug: "brac-university", en: "BRAC University", bn: "ব্র্যাক বিশ্ববিদ্যালয়", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A leading private university in Dhaka.", descriptionBn: "ঢাকার একটি শীর্ষস্থানীয় বেসরকারি বিশ্ববিদ্যালয়।", website: "https://www.bracu.ac.bd" },
  { slug: "north-south-university", en: "North South University", bn: "নর্থ সাউথ ইউনিভার্সিটি", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The first private university in Bangladesh.", descriptionBn: "বাংলাদেশের প্রথম বেসরকারি বিশ্ববিদ্যালয়।", website: "https://www.northsouth.edu" },
  { slug: "independent-university-bangladesh", en: "Independent University, Bangladesh", bn: "ইন্ডিপেন্ডেন্ট ইউনিভার্সিটি বাংলাদেশ", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A private university in Dhaka.", descriptionBn: "ঢাকার একটি বেসরকারি বিশ্ববিদ্যালয়।", website: "https://www.iub.edu.bd" },
  { slug: "aiub", en: "American International University-Bangladesh (AIUB)", bn: "আমেরিকান ইন্টারন্যাশনাল ইউনিভার্সিটি-বাংলাদেশ", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A private university in Dhaka.", descriptionBn: "ঢাকার একটি বেসরকারি বিশ্ববিদ্যালয়।", website: "https://www.aiub.edu" },
  { slug: "chittagong-university-engineering-technology", en: "Chittagong University of Engineering & Technology (CUET)", bn: "চট্টগ্রাম প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A public engineering university in Chattogram.", descriptionBn: "চট্টগ্রামের একটি পাবলিক প্রকৌশল বিশ্ববিদ্যালয়।", website: "https://www.cuet.ac.bd" },

  // --- Schools ---
  { slug: "scholastica", en: "Scholastica", bn: "স্কলাসটিকা", categorySlug: "school", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "An English-medium school in Dhaka.", descriptionBn: "ঢাকার একটি ইংরেজি মাধ্যম স্কুল।", website: "https://www.scholastica.edu.bd" },
  { slug: "chittagong-grammar-school", en: "Chittagong Grammar School", bn: "চিটাগাং গ্রামার স্কুল", categorySlug: "school", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "An English-medium school in Chattogram.", descriptionBn: "চট্টগ্রামের একটি ইংরেজি মাধ্যম স্কুল।", website: "https://www.cgs.ac.bd" },
  { slug: "viqarunnisa-noon-school-college", en: "Viqarunnisa Noon School & College", bn: "ভিকারুননিসা নূন স্কুল অ্যান্ড কলেজ", categorySlug: "school", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A prominent girls' school and college in Dhaka.", descriptionBn: "ঢাকার একটি prominant স্কুল ও কলেজ।", website: "https://www.vnsc.edu.bd" },

  // --- Government Offices ---
  { slug: "national-board-of-revenue", en: "National Board of Revenue (NBR)", bn: "জাতীয় রাজস্ব বোর্ড", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The central tax authority of Bangladesh.", descriptionBn: "বাংলাদেশের কেন্দ্রীয় কর কর্তৃপক্ষ।", website: "https://www.nbr.gov.bd" },
  { slug: "bangladesh-post-office", en: "Bangladesh Post Office", bn: "বাংলাদেশ ডাক বিভাগ", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The national postal service of Bangladesh.", descriptionBn: "বাংলাদেশের জাতীয় ডাক সেবা।", website: "https://www.bangladeshpost.gov.bd" },
  { slug: "department-of-immigration-passports", en: "Department of Immigration & Passports", bn: "অভিবাসন ও পাসপোর্ট অধিদপ্তর", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The passport and immigration authority.", descriptionBn: "পাসপোর্ট ও অভিবাসন কর্তৃপক্ষ।", website: "https://www.dip.gov.bd" },
  { slug: "dhaka-north-city-corporation", en: "Dhaka North City Corporation", bn: "ঢাকা উত্তর সিটি কর্পোরেশন", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "The city corporation for northern Dhaka.", descriptionBn: "উত্তর ঢাকার সিটি কর্পোরেশন।", website: "https://www.dncc.gov.bd" },

  // --- NGOs & Nonprofits ---
  { slug: "brac", en: "BRAC", bn: "ব্র্যাক", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "One of the world's largest development organizations, founded in Bangladesh.", descriptionBn: "বাংলাদেশে প্রতিষ্ঠিত বিশ্বের বৃহত্তম উন্নয়ন সংস্থাগুলোর একটি।", website: "https://www.brac.net" },
  { slug: "grameen-bank", en: "Grameen Bank", bn: "গ্রামীণ ব্যাংক", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A microfinance organization and community development bank.", descriptionBn: "একটি ক্ষুদ্রঋণ সংস্থা ও কমিউনিটি উন্নয়ন ব্যাংক।", website: "https://www.grameen-bank.com" },
  { slug: "asa-bangladesh", en: "ASA", bn: "আশা", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi microfinance institution.", descriptionBn: "একটি বাংলাদেশি ক্ষুদ্রঋণ প্রতিষ্ঠান।", website: "https://www.asa.org.bd" },
  { slug: "sajida-foundation", en: "Sajida Foundation", bn: "সাজিদা ফাউন্ডেশন", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A social development organization in Bangladesh.", descriptionBn: "বাংলাদেশের একটি সামাজিক উন্নয়ন সংস্থা।", website: "https://www.sajidafoundation.org" },

  // --- Retail & Commercial Establishments ---
  { slug: "aarong", en: "Aarong", bn: "আড়ং", categorySlug: "retail-commercial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi retail chain of lifestyle and craft products.", descriptionBn: "লাইফস্টাইল ও কারুপণ্যের একটি বাংলাদেশি খুচরা চেইন।", website: "https://www.aarong.com" },
  { slug: "shwapno", en: "Shwapno", bn: "স্বপ্ন", categorySlug: "retail-commercial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi retail grocery chain.", descriptionBn: "একটি বাংলাদেশি খুচরা মুদি চেইন।", website: "https://www.shwapno.com" },
  { slug: "agora", en: "Agora", bn: "আগোরা", categorySlug: "retail-commercial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi supermarket chain.", descriptionBn: "একটি বাংলাদেশি সুপারমার্কেট চেইন।", website: "https://www.agorabd.com" },
  { slug: "daraz-bangladesh", en: "Daraz Bangladesh", bn: "দারাজ বাংলাদেশ", categorySlug: "retail-commercial", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A major e-commerce marketplace in Bangladesh.", descriptionBn: "বাংলাদেশের একটি প্রধান ই-কমার্স মার্কেটপ্লেস।", website: "https://www.daraz.com.bd" },
  { slug: "aci-plc", en: "ACI PLC", bn: "ACI PLC", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.aci-bd.com" },
  { slug: "akij-group-2", en: "Akij Group", bn: "Akij Group", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://akij.net" },
  { slug: "banglalink-digital-communications-limited", en: "Banglalink Digital Communications Limited", bn: "Banglalink Digital Communications Limited", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.banglalink.com.bd" },
  { slug: "berger-paints-bangladesh-ltd", en: "Berger Paints Bangladesh Ltd", bn: "Berger Paints Bangladesh Ltd", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.bergerbd.com" },
  { slug: "beximco-group", en: "BEXIMCO Group", bn: "BEXIMCO Group", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.beximco.com" },
  { slug: "beximco-pharmaceuticals-ltd", en: "Beximco Pharmaceuticals Ltd", bn: "Beximco Pharmaceuticals Ltd", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.beximco-pharma.com" },
  { slug: "bkash-limited", en: "bKash Limited", bn: "bKash Limited", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.bkash.com" },
  { slug: "brac-bank-plc", en: "BRAC Bank PLC", bn: "BRAC Bank PLC", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.bracbank.com" },
  { slug: "bsrm-group", en: "BSRM Group", bn: "BSRM Group", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://bsrm.com" },
  { slug: "eastern-bank-plc", en: "Eastern Bank PLC", bn: "Eastern Bank PLC", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.ebl.com.bd" },
  { slug: "ebl-asset-management-ltd", en: "EBL Asset Management Ltd", bn: "EBL Asset Management Ltd", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.eblaml.com" },
  { slug: "ebl-investments-ltd", en: "EBL Investments Ltd", bn: "EBL Investments Ltd", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.eblinvestments.com" },
  { slug: "ebl-securities-ltd", en: "EBL Securities Ltd", bn: "EBL Securities Ltd", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.eblsecurities.com" },
  { slug: "grameenphone-limited", en: "Grameenphone Limited", bn: "Grameenphone Limited", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.grameenphone.com" },
  { slug: "idlc-finance-plc", en: "IDLC Finance PLC", bn: "IDLC Finance PLC", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.idlc.com" },
  { slug: "ipdc-finance-plc", en: "IPDC Finance PLC", bn: "IPDC Finance PLC", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.ipdcbd.com" },
  { slug: "rfl-group", en: "RFL Group", bn: "RFL Group", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://www.rflbd.com" },
  { slug: "united-group-of-industries", en: "United Group of Industries", bn: "United Group of Industries", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://unitedgroup-bd.com" },
  { slug: "walton-hitech-industries-plc", en: "Walton Hi-Tech Industries PLC", bn: "Walton Hi-Tech Industries PLC", categorySlug: "private-company", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi private company.", descriptionBn: "একটি বাংলাদেশি বেসরকারি প্রতিষ্ঠান।", website: "https://waltonbd.com" },
  { slug: "bangla-academy", en: "Bangla Academy", bn: "Bangla Academy", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://banglaacademy.gov.bd" },
  { slug: "bangladesh-agricultural-development-corporation", en: "Bangladesh Agricultural Development Corporation", bn: "Bangladesh Agricultural Development Corporation", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://badc.gov.bd" },
  { slug: "bangladesh-agricultural-research-institute", en: "Bangladesh Agricultural Research Institute", bn: "Bangladesh Agricultural Research Institute", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://bari.gov.bd" },
  { slug: "bangladesh-bridge-authority", en: "Bangladesh Bridge Authority", bn: "Bangladesh Bridge Authority", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://bba.gov.bd" },
  { slug: "bangladesh-competition-commission", en: "Bangladesh Competition Commission", bn: "Bangladesh Competition Commission", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://ccb.gov.bd" },
  { slug: "bangladesh-copyright-office", en: "Bangladesh Copyright Office", bn: "Bangladesh Copyright Office", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://copyrightoffice.gov.bd" },
  { slug: "bangladesh-economic-zones-authority", en: "Bangladesh Economic Zones Authority", bn: "Bangladesh Economic Zones Authority", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://beza.portal.gov.bd" },
  { slug: "bangladesh-fisheries-research-institute", en: "Bangladesh Fisheries Research Institute", bn: "Bangladesh Fisheries Research Institute", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://fri.gov.bd" },
  { slug: "bangladesh-jute-research-institute", en: "Bangladesh Jute Research Institute", bn: "Bangladesh Jute Research Institute", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://bjri.gov.bd" },
  { slug: "bangladesh-livestock-research-institute", en: "Bangladesh Livestock Research Institute", bn: "Bangladesh Livestock Research Institute", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://blri.gov.bd" },
  { slug: "bangladesh-meteorological-department", en: "Bangladesh Meteorological Department", bn: "Bangladesh Meteorological Department", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://bmd.gov.bd" },
  { slug: "bangladesh-national-museum", en: "Bangladesh National Museum", bn: "Bangladesh National Museum", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://bangladeshmuseum.gov.bd" },
  { slug: "bangladesh-parjatan-corporation", en: "Bangladesh Parjatan Corporation", bn: "Bangladesh Parjatan Corporation", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://parjatan.gov.bd" },
  { slug: "bangladesh-rice-research-institute", en: "Bangladesh Rice Research Institute", bn: "Bangladesh Rice Research Institute", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://brri.gov.bd" },
  { slug: "bangladesh-road-transport-authority", en: "Bangladesh Road Transport Authority", bn: "Bangladesh Road Transport Authority", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://brta.gov.bd" },
  { slug: "bangladesh-road-transport-corporation", en: "Bangladesh Road Transport Corporation", bn: "Bangladesh Road Transport Corporation", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://brtc.gov.bd" },
  { slug: "bangladesh-securities-and-exchange-commission", en: "Bangladesh Securities and Exchange Commission", bn: "Bangladesh Securities and Exchange Commission", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://sec.gov.bd" },
  { slug: "bangladesh-shilpakala-academy", en: "Bangladesh Shilpakala Academy", bn: "Bangladesh Shilpakala Academy", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://bsa.gov.bd" },
  { slug: "bangladesh-tea-board", en: "Bangladesh Tea Board", bn: "Bangladesh Tea Board", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://teaboard.gov.bd" },
  { slug: "bangladesh-tourism-board", en: "Bangladesh Tourism Board", bn: "Bangladesh Tourism Board", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://tourismboard.gov.bd" },
  { slug: "bangladesh-trade-and-tariff-commission", en: "Bangladesh Trade and Tariff Commission", bn: "Bangladesh Trade and Tariff Commission", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://btc.gov.bd" },
  { slug: "bridges-division", en: "Bridges Division", bn: "Bridges Division", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://bridgesdivision.gov.bd" },
  { slug: "bureau-of-nonformal-education", en: "Bureau of Non-Formal Education", bn: "Bureau of Non-Formal Education", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://bnfe.gov.bd" },
  { slug: "cabinet-division", en: "Cabinet Division", bn: "Cabinet Division", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://cabinet.gov.bd" },
  { slug: "civil-aviation-authority-of-bangladesh", en: "Civil Aviation Authority of Bangladesh", bn: "Civil Aviation Authority of Bangladesh", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://caab.gov.bd" },
  { slug: "department-of-agricultural-extension", en: "Department of Agricultural Extension", bn: "Department of Agricultural Extension", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://dae.gov.bd" },
  { slug: "department-of-agricultural-marketing", en: "Department of Agricultural Marketing", bn: "Department of Agricultural Marketing", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://dam.gov.bd" },
  { slug: "department-of-archaeology", en: "Department of Archaeology", bn: "Department of Archaeology", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://archaeology.gov.bd" },
  { slug: "department-of-fisheries", en: "Department of Fisheries", bn: "Department of Fisheries", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://fisheries.gov.bd" },
  { slug: "department-of-livestock-services", en: "Department of Livestock Services", bn: "Department of Livestock Services", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://dls.gov.bd" },
  { slug: "department-of-public-libraries", en: "Department of Public Libraries", bn: "Department of Public Libraries", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://publiclibrary.gov.bd" },
  { slug: "dhaka-mass-transit-company-limited", en: "Dhaka Mass Transit Company Limited", bn: "Dhaka Mass Transit Company Limited", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://dmtcl.gov.bd" },
  { slug: "directorate-general-of-drug-administration", en: "Directorate General of Drug Administration", bn: "Directorate General of Drug Administration", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://dgda.gov.bd" },
  { slug: "directorate-general-of-health-services", en: "Directorate General of Health Services", bn: "Directorate General of Health Services", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://dghs.gov.bd" },
  { slug: "directorate-general-of-nursing-and-midwifery", en: "Directorate General of Nursing and Midwifery", bn: "Directorate General of Nursing and Midwifery", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://dgnm.gov.bd" },
  { slug: "directorate-of-national-consumer-rights-protection", en: "Directorate of National Consumer Rights Protection", bn: "Directorate of National Consumer Rights Protection", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://dncrp.gov.bd" },
  { slug: "directorate-of-primary-education", en: "Directorate of Primary Education", bn: "Directorate of Primary Education", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://dpe.gov.bd" },
  { slug: "economic-relations-division", en: "Economic Relations Division", bn: "Economic Relations Division", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://erd.gov.bd" },
  { slug: "export-promotion-bureau", en: "Export Promotion Bureau", bn: "Export Promotion Bureau", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://epb.gov.bd" },
  { slug: "financial-institutions-division", en: "Financial Institutions Division", bn: "Financial Institutions Division", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://fid.gov.bd" },
  { slug: "health-engineering-department", en: "Health Engineering Department", bn: "Health Engineering Department", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://hed.gov.bd" },
  { slug: "health-services-division", en: "Health Services Division", bn: "Health Services Division", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://hsd.gov.bd" },
  { slug: "institute-of-epidemiology-disease-control-and-research", en: "Institute of Epidemiology Disease Control and Research", bn: "Institute of Epidemiology Disease Control and Research", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://iedcr.gov.bd" },
  { slug: "internal-resources-division", en: "Internal Resources Division", bn: "Internal Resources Division", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://ird.gov.bd" },
  { slug: "investment-corporation-of-bangladesh", en: "Investment Corporation of Bangladesh", bn: "Investment Corporation of Bangladesh", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://icb.gov.bd" },
  { slug: "microcredit-regulatory-authority", en: "Microcredit Regulatory Authority", bn: "Microcredit Regulatory Authority", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mra.gov.bd" },
  { slug: "ministry-of-agriculture", en: "Ministry of Agriculture", bn: "Ministry of Agriculture", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://moa.gov.bd" },
  { slug: "ministry-of-chittagong-hill-tracts-affairs", en: "Ministry of Chittagong Hill Tracts Affairs", bn: "Ministry of Chittagong Hill Tracts Affairs", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mochta.gov.bd" },
  { slug: "ministry-of-civil-aviation-and-tourism", en: "Ministry of Civil Aviation and Tourism", bn: "Ministry of Civil Aviation and Tourism", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mocat.gov.bd" },
  { slug: "ministry-of-commerce", en: "Ministry of Commerce", bn: "Ministry of Commerce", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mincom.gov.bd" },
  { slug: "ministry-of-cultural-affairs", en: "Ministry of Cultural Affairs", bn: "Ministry of Cultural Affairs", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://moca.gov.bd" },
  { slug: "ministry-of-defence", en: "Ministry of Defence", bn: "Ministry of Defence", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mod.gov.bd" },
  { slug: "ministry-of-education-directorate-of-secondary-and-higher-education", en: "Ministry of Education: Directorate of Secondary and Higher Education", bn: "Ministry of Education: Directorate of Secondary and Higher Education", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://dshe.gov.bd" },
  { slug: "ministry-of-finance", en: "Ministry of Finance", bn: "Ministry of Finance", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mof.gov.bd" },
  { slug: "ministry-of-fisheries-and-livestock", en: "Ministry of Fisheries and Livestock", bn: "Ministry of Fisheries and Livestock", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mofl.gov.bd" },
  { slug: "ministry-of-foreign-affairs", en: "Ministry of Foreign Affairs", bn: "Ministry of Foreign Affairs", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mofa.gov.bd" },
  { slug: "ministry-of-health-and-family-welfare", en: "Ministry of Health and Family Welfare", bn: "Ministry of Health and Family Welfare", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mohfw.gov.bd" },
  { slug: "ministry-of-primary-and-mass-education", en: "Ministry of Primary and Mass Education", bn: "Ministry of Primary and Mass Education", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mopme.gov.bd" },
  { slug: "ministry-of-road-transport-and-bridges", en: "Ministry of Road Transport and Bridges", bn: "Ministry of Road Transport and Bridges", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://mortb.gov.bd" },
  { slug: "national-academy-for-primary-education", en: "National Academy for Primary Education", bn: "National Academy for Primary Education", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://nape.gov.bd" },
  { slug: "national-board-of-revenue-2", en: "National Board of Revenue", bn: "National Board of Revenue", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://nbr.portal.gov.bd" },
  { slug: "national-savings-directorate", en: "National Savings Directorate", bn: "National Savings Directorate", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://nationalsavings.gov.bd" },
  { slug: "office-of-the-chief-controller-of-imports-and-exports", en: "Office of the Chief Controller of Imports and Exports", bn: "Office of the Chief Controller of Imports and Exports", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://ccie.gov.bd" },
  { slug: "office-of-the-president", en: "Office of the President", bn: "Office of the President", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://bangabhaban.gov.bd" },
  { slug: "prime-ministers-office", en: "Prime Minister's Office", bn: "Prime Minister's Office", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://pmo.gov.bd" },
  { slug: "public-private-partnership-authority", en: "Public Private Partnership Authority", bn: "Public Private Partnership Authority", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://pppa.gov.bd" },
  { slug: "registrar-of-joint-stock-companies-and-firms", en: "Registrar of Joint Stock Companies and Firms", bn: "Registrar of Joint Stock Companies and Firms", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://roc.gov.bd" },
  { slug: "road-transport-and-highways-division", en: "Road Transport and Highways Division", bn: "Road Transport and Highways Division", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://rthd.gov.bd" },
  { slug: "survey-of-bangladesh", en: "Survey of Bangladesh", bn: "Survey of Bangladesh", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://sob.gov.bd" },
  { slug: "trading-corporation-of-bangladesh", en: "Trading Corporation of Bangladesh", bn: "Trading Corporation of Bangladesh", categorySlug: "government-office", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi government office or public institution.", descriptionBn: "একটি বাংলাদেশি সরকারি দফতর/প্রতিষ্ঠান।", website: "https://tcb.gov.bd" },
  { slug: "asgar-ali-hospital", en: "Asgar Ali Hospital", bn: "Asgar Ali Hospital", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://asgaralihospital.com" },
  { slug: "bangladesh-specialized-hospital", en: "Bangladesh Specialized Hospital", bn: "Bangladesh Specialized Hospital", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.bdspecializedhospital.com" },
  { slug: "evercare-hospital-dhaka-2", en: "Evercare Hospital Dhaka", bn: "Evercare Hospital Dhaka", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.evercarebd.com/en/dhaka" },
  { slug: "ibn-sina-cancer-diagnostic-center-dhanmondi", en: "Ibn Sina Cancer Diagnostic Center Dhanmondi", bn: "Ibn Sina Cancer Diagnostic Center Dhanmondi", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-diagnostic-and-consultation-center-badda", en: "Ibn Sina Diagnostic and Consultation Center Badda", bn: "Ibn Sina Diagnostic and Consultation Center Badda", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-diagnostic-and-consultation-center-bogura", en: "Ibn Sina Diagnostic and Consultation Center Bogura", bn: "Ibn Sina Diagnostic and Consultation Center Bogura", categorySlug: "hospital-clinic", division: "Rajshahi", district: "Bogura", city: "Bogura", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-diagnostic-and-consultation-center-jatrabari", en: "Ibn Sina Diagnostic and Consultation Center Jatrabari", bn: "Ibn Sina Diagnostic and Consultation Center Jatrabari", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-diagnostic-and-consultation-center-rajshahi", en: "Ibn Sina Diagnostic and Consultation Center Rajshahi", bn: "Ibn Sina Diagnostic and Consultation Center Rajshahi", categorySlug: "hospital-clinic", division: "Rajshahi", district: "Rajshahi", city: "Rajshahi", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-diagnostic-and-consultation-center-uttara", en: "Ibn Sina Diagnostic and Consultation Center Uttara", bn: "Ibn Sina Diagnostic and Consultation Center Uttara", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-diagnostic-and-imaging-center-dhanmondi", en: "Ibn Sina Diagnostic and Imaging Center Dhanmondi", bn: "Ibn Sina Diagnostic and Imaging Center Dhanmondi", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-diagnostic-center-lalbagh", en: "Ibn Sina Diagnostic Center Lalbagh", bn: "Ibn Sina Diagnostic Center Lalbagh", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-hospital-and-diagnostic-center-bogura", en: "Ibn Sina Hospital and Diagnostic Center Bogura", bn: "Ibn Sina Hospital and Diagnostic Center Bogura", categorySlug: "hospital-clinic", division: "Rajshahi", district: "Bogura", city: "Bogura", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-hospital-and-diagnostic-center-jashore", en: "Ibn Sina Hospital and Diagnostic Center Jashore", bn: "Ibn Sina Hospital and Diagnostic Center Jashore", categorySlug: "hospital-clinic", division: "Khulna", district: "Jashore", city: "Jashore", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-hospital-and-diagnostic-center-noakhali", en: "Ibn Sina Hospital and Diagnostic Center Noakhali", bn: "Ibn Sina Hospital and Diagnostic Center Noakhali", categorySlug: "hospital-clinic", division: "Chattogram", district: "Noakhali", city: "Noakhali", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-medical-college-hospital-kallyanpur", en: "Ibn Sina Medical College Hospital Kallyanpur", bn: "Ibn Sina Medical College Hospital Kallyanpur", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "ibn-sina-specialized-hospital-dhanmondi", en: "Ibn Sina Specialized Hospital Dhanmondi", bn: "Ibn Sina Specialized Hospital Dhanmondi", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.ibnsinatrust.com" },
  { slug: "labaid-cardiac-hospital", en: "Labaid Cardiac Hospital", bn: "Labaid Cardiac Hospital", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.labaid.com.bd" },
  { slug: "labaid-specialized-hospital-2", en: "Labaid Specialized Hospital", bn: "Labaid Specialized Hospital", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://www.labaid.com.bd/en/hospital/labaid-specialized-hospital" },
  { slug: "national-heart-foundation-hospital-and-research-institute", en: "National Heart Foundation Hospital and Research Institute", bn: "National Heart Foundation Hospital and Research Institute", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://epidemiology.nhf.org.bd" },
  { slug: "square-hospitals-limited", en: "Square Hospitals Limited", bn: "Square Hospitals Limited", categorySlug: "hospital-clinic", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A hospital or clinic in Bangladesh.", descriptionBn: "বাংলাদেশের একটি হাসপাতাল/ক্লিনিক।", website: "https://squarehospital.com" },
  { slug: "azimpur-government-girls-school-and-college", en: "Azimpur Government Girls School and College", bn: "Azimpur Government Girls School and College", categorySlug: "school", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://aggsc.edu.bd" },
  { slug: "barishal-government-model-school-and-college", en: "Barishal Government Model School and College", bn: "Barishal Government Model School and College", categorySlug: "school", division: "Barishal", district: "Barishal", city: "Barishal", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://bgmsc.edu.bd" },
  { slug: "chattogram-model-school-and-college", en: "Chattogram Model School and College", bn: "Chattogram Model School and College", categorySlug: "school", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://cmsc.edu.bd" },
  { slug: "dhaka-residential-model-college", en: "Dhaka Residential Model College", bn: "Dhaka Residential Model College", categorySlug: "school", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://drmc.edu.bd" },
  { slug: "government-kalachandpur-high-secondary-school", en: "Government Kalachandpur High Secondary School", bn: "Government Kalachandpur High Secondary School", categorySlug: "school", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://gkumb.edu.bd" },
  { slug: "ideal-school-and-college-motijheel", en: "Ideal School and College Motijheel", bn: "Ideal School and College Motijheel", categorySlug: "school", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://iscm.edu.bd" },
  { slug: "rajshahi-education-board-model-school-and-college", en: "Rajshahi Education Board Model School and College", bn: "Rajshahi Education Board Model School and College", categorySlug: "school", division: "Rajshahi", district: "Rajshahi", city: "Rajshahi", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://rebmsc.edu.bd" },
  { slug: "rajshahi-model-school-and-college", en: "Rajshahi Model School and College", bn: "Rajshahi Model School and College", categorySlug: "school", division: "Rajshahi", district: "Rajshahi", city: "Rajshahi", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://rmscraj.edu.bd" },
  { slug: "rajuk-uttara-model-college", en: "Rajuk Uttara Model College", bn: "Rajuk Uttara Model College", categorySlug: "school", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://rajukcollege.edu.bd" },
  { slug: "rupnagar-model-school-and-college", en: "Rupnagar Model School and College", bn: "Rupnagar Model School and College", categorySlug: "school", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://rmsc.edu.bd" },
  { slug: "shyampur-government-model-school-and-college", en: "Shyampur Government Model School and College", bn: "Shyampur Government Model School and College", categorySlug: "school", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://govtsmsc.edu.bd" },
  { slug: "sunbeams-school", en: "Sunbeams School", bn: "Sunbeams School", categorySlug: "school", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://sunbeams.edu.bd" },
  { slug: "sylhet-government-model-school-and-college", en: "Sylhet Government Model School and College", bn: "Sylhet Government Model School and College", categorySlug: "school", division: "Sylhet", district: "Sylhet", city: "Sylhet", descriptionEn: "A school or college in Bangladesh.", descriptionBn: "বাংলাদেশের একটি স্কুল/কলেজ।", website: "https://sgmsc.edu.bd" },
  { slug: "ain-o-salish-kendra", en: "Ain o Salish Kendra", bn: "Ain o Salish Kendra", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://askbd.org/ask" },
  { slug: "asa-bangladesh-2", en: "ASA Bangladesh", bn: "ASA Bangladesh", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://asa.org.bd" },
  { slug: "bangladesh-legal-aid-and-services-trust", en: "Bangladesh Legal Aid and Services Trust", bn: "Bangladesh Legal Aid and Services Trust", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://blast.org.bd" },
  { slug: "bangladesh-ngo-foundation", en: "Bangladesh NGO Foundation", bn: "Bangladesh NGO Foundation", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://bnf.gov.bd" },
  { slug: "bangladesh-red-crescent-society", en: "Bangladesh Red Crescent Society", bn: "Bangladesh Red Crescent Society", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://bdrcs.org" },
  { slug: "brac-2", en: "BRAC", bn: "BRAC", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://brac.net" },
  { slug: "buro-bangladesh", en: "BURO Bangladesh", bn: "BURO Bangladesh", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://burobd.org" },
  { slug: "care-bangladesh", en: "CARE Bangladesh", bn: "CARE Bangladesh", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://carebangladesh.org" },
  { slug: "jaago-foundation", en: "JAAGO Foundation", bn: "JAAGO Foundation", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://www.jaagofoundation.org" },
  { slug: "manusher-jonno-foundation", en: "Manusher Jonno Foundation", bn: "Manusher Jonno Foundation", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://manusherjonno.org" },
  { slug: "palli-karma-sahayak-foundation", en: "Palli Karma Sahayak Foundation", bn: "Palli Karma Sahayak Foundation", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://pksf.org.bd" },
  { slug: "proshika-human-development-centre", en: "PROSHIKA Human Development Centre", bn: "PROSHIKA Human Development Centre", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://proshikabd.com" },
  { slug: "shakti-foundation-for-disadvantaged-women", en: "Shakti Foundation for Disadvantaged Women", bn: "Shakti Foundation for Disadvantaged Women", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://shakti.org.bd" },
  { slug: "social-development-foundation", en: "Social Development Foundation", bn: "Social Development Foundation", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://sdf.org.bd" },
  { slug: "transparency-international-bangladesh", en: "Transparency International Bangladesh", bn: "Transparency International Bangladesh", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://www.ti-bangladesh.org" },
  { slug: "wateraid-bangladesh", en: "WaterAid Bangladesh", bn: "WaterAid Bangladesh", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://www.wateraid.org/bd" },
  { slug: "world-vision-bangladesh", en: "World Vision Bangladesh", bn: "World Vision Bangladesh", categorySlug: "ngo-nonprofit", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi NGO or nonprofit organization.", descriptionBn: "একটি বাংলাদেশি এনজিও/অলাভজনক সংস্থা।", website: "https://www.wvi.org/bangladesh" },
  { slug: "ahsania-mission-university-of-science-and-technology", en: "Ahsania Mission University of Science and Technology", bn: "Ahsania Mission University of Science and Technology", categorySlug: "university-college", division: "Rajshahi", district: "Rajshahi", city: "Rajshahi", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://amust.ac.bd" },
  { slug: "ahsanullah-university-of-science-and-technology", en: "Ahsanullah University of Science and Technology", bn: "Ahsanullah University of Science and Technology", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://aust.edu" },
  { slug: "american-international-university-bangladesh", en: "American International University Bangladesh", bn: "American International University Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://aiub.edu" },
  { slug: "anwer-khan-modern-university", en: "Anwer Khan Modern University", bn: "Anwer Khan Modern University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://akmu.edu.bd" },
  { slug: "asa-university-bangladesh", en: "ASA University Bangladesh", bn: "ASA University Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://asaub.edu.bd" },
  { slug: "asian-university-of-bangladesh", en: "Asian University of Bangladesh", bn: "Asian University of Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://aub.ac.bd" },
  { slug: "atish-dipankar-university-of-science-and-technology", en: "Atish Dipankar University of Science and Technology", bn: "Atish Dipankar University of Science and Technology", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://adust.edu.bd" },
  { slug: "bangladesh-agricultural-university", en: "Bangladesh Agricultural University", bn: "Bangladesh Agricultural University", categorySlug: "university-college", division: "Mymensingh", district: "Mymensingh", city: "Mymensingh", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://bau.edu.bd" },
  { slug: "bangladesh-army-international-university-of-science-and-technology", en: "Bangladesh Army International University of Science and Technology", bn: "Bangladesh Army International University of Science and Technology", categorySlug: "university-college", division: "Chattogram", district: "Cumilla", city: "Cumilla", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://baiust.edu.bd" },
  { slug: "bangladesh-army-university-of-engineering-and-technology", en: "Bangladesh Army University of Engineering and Technology", bn: "Bangladesh Army University of Engineering and Technology", categorySlug: "university-college", division: "Rajshahi", district: "Natore", city: "Natore", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://bauet.ac.bd" },
  { slug: "bangladesh-army-university-of-science-and-technology", en: "Bangladesh Army University of Science and Technology", bn: "Bangladesh Army University of Science and Technology", categorySlug: "university-college", division: "Rangpur", district: "Saidpur", city: "Saidpur", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://baust.edu.bd" },
  { slug: "bangladesh-islami-university", en: "Bangladesh Islami University", bn: "Bangladesh Islami University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://biu.ac.bd" },
  { slug: "bangladesh-university", en: "Bangladesh University", bn: "Bangladesh University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://bu.edu.bd" },
  { slug: "bangladesh-university-of-business-and-technology", en: "Bangladesh University of Business and Technology", bn: "Bangladesh University of Business and Technology", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://bubt.ac.bd" },
  { slug: "bangladesh-university-of-engineering-and-technology", en: "Bangladesh University of Engineering and Technology", bn: "Bangladesh University of Engineering and Technology", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://buet.ac.bd" },
  { slug: "bangladesh-university-of-health-sciences", en: "Bangladesh University of Health Sciences", bn: "Bangladesh University of Health Sciences", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://buhs.ac.bd" },
  { slug: "bangladesh-university-of-professionals", en: "Bangladesh University of Professionals", bn: "Bangladesh University of Professionals", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://bup.edu.bd" },
  { slug: "bangladesh-university-of-textiles", en: "Bangladesh University of Textiles", bn: "Bangladesh University of Textiles", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://butex.edu.bd" },
  { slug: "begum-rokeya-university", en: "Begum Rokeya University", bn: "Begum Rokeya University", categorySlug: "university-college", division: "Rangpur", district: "Rangpur", city: "Rangpur", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://brur.ac.bd" },
  { slug: "bgc-trust-university-bangladesh", en: "BGC Trust University Bangladesh", bn: "BGC Trust University Bangladesh", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://bgctub.ac.bd" },
  { slug: "bgmea-university-of-fashion-and-technology", en: "BGMEA University of Fashion and Technology", bn: "BGMEA University of Fashion and Technology", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://buft.edu.bd" },
  { slug: "brac-university-2", en: "BRAC University", bn: "BRAC University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://bracu.ac.bd" },
  { slug: "britannia-university", en: "Britannia University", bn: "Britannia University", categorySlug: "university-college", division: "Chattogram", district: "Cumilla", city: "Cumilla", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://britannia.edu.bd" },
  { slug: "canadian-university-of-bangladesh", en: "Canadian University of Bangladesh", bn: "Canadian University of Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://cub.edu.bd" },
  { slug: "ccn-university-of-science-and-technology", en: "CCN University of Science and Technology", bn: "CCN University of Science and Technology", categorySlug: "university-college", division: "Chattogram", district: "Cumilla", city: "Cumilla", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ccnust.ac.bd" },
  { slug: "central-university-of-science-and-technology", en: "Central University of Science and Technology", bn: "Central University of Science and Technology", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://cust.edu.bd" },
  { slug: "central-womens-university", en: "Central Women's University", bn: "Central Women's University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://cwu.edu.bd" },
  { slug: "chattogram-bgmea-university-of-fashion-and-technology", en: "Chattogram BGMEA University of Fashion and Technology", bn: "Chattogram BGMEA University of Fashion and Technology", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://cbuft.edu.bd" },
  { slug: "chattogram-veterinary-and-animal-sciences-university", en: "Chattogram Veterinary and Animal Sciences University", bn: "Chattogram Veterinary and Animal Sciences University", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://cvasu.ac.bd" },
  { slug: "chittagong-independent-university", en: "Chittagong Independent University", bn: "Chittagong Independent University", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ciu.edu.bd" },
  { slug: "chittagong-university-of-engineering-and-technology", en: "Chittagong University of Engineering and Technology", bn: "Chittagong University of Engineering and Technology", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://cuet.ac.bd" },
  { slug: "city-university", en: "City University", bn: "City University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://cityuniversity.edu.bd" },
  { slug: "comilla-university", en: "Comilla University", bn: "Comilla University", categorySlug: "university-college", division: "Chattogram", district: "Cumilla", city: "Cumilla", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://cou.ac.bd" },
  { slug: "daffodil-international-university", en: "Daffodil International University", bn: "Daffodil International University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://daffodilvarsity.edu.bd" },
  { slug: "dhaka-international-university", en: "Dhaka International University", bn: "Dhaka International University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://diu.ac" },
  { slug: "dhaka-university-of-engineering-and-technology", en: "Dhaka University of Engineering and Technology", bn: "Dhaka University of Engineering and Technology", categorySlug: "university-college", division: "Dhaka", district: "Gazipur", city: "Gazipur", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://duet.ac.bd" },
  { slug: "east-delta-university", en: "East Delta University", bn: "East Delta University", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://eastdelta.edu.bd" },
  { slug: "east-west-university", en: "East West University", bn: "East West University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ewubd.edu" },
  { slug: "eastern-university", en: "Eastern University", bn: "Eastern University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://easternuni.edu.bd" },
  { slug: "european-university-of-bangladesh", en: "European University of Bangladesh", bn: "European University of Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://eub.edu.bd" },
  { slug: "exim-bank-agricultural-university-bangladesh", en: "EXIM Bank Agricultural University Bangladesh", bn: "EXIM Bank Agricultural University Bangladesh", categorySlug: "university-college", division: "Rajshahi", district: "Chapainawabganj", city: "Chapainawabganj", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ebaub.edu.bd" },
  { slug: "fareast-international-university", en: "Fareast International University", bn: "Fareast International University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://fiu.edu.bd" },
  { slug: "feni-university", en: "Feni University", bn: "Feni University", categorySlug: "university-college", division: "Chattogram", district: "Feni", city: "Feni", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://feniuniversity.ac.bd" },
  { slug: "first-capital-university-of-bangladesh", en: "First Capital University of Bangladesh", bn: "First Capital University of Bangladesh", categorySlug: "university-college", division: "Khulna", district: "Chuadanga", city: "Chuadanga", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://fcub.edu.bd" },
  { slug: "german-university-bangladesh", en: "German University Bangladesh", bn: "German University Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Gazipur", city: "Gazipur", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://gub.edu.bd" },
  { slug: "global-university-bangladesh", en: "Global University Bangladesh", bn: "Global University Bangladesh", categorySlug: "university-college", division: "Barishal", district: "Barishal", city: "Barishal", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://globaluniversity.edu.bd" },
  { slug: "gono-bishwabidyalay", en: "Gono Bishwabidyalay", bn: "Gono Bishwabidyalay", categorySlug: "university-college", division: "Dhaka", district: "Savar", city: "Savar", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://gonouniversity.edu.bd" },
  { slug: "green-university-of-bangladesh", en: "Green University of Bangladesh", bn: "Green University of Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://green.edu.bd" },
  { slug: "hajee-mohammad-danesh-science-and-technology-university", en: "Hajee Mohammad Danesh Science and Technology University", bn: "Hajee Mohammad Danesh Science and Technology University", categorySlug: "university-college", division: "Rangpur", district: "Dinajpur", city: "Dinajpur", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://hstu.ac.bd" },
  { slug: "hamdard-university-bangladesh", en: "Hamdard University Bangladesh", bn: "Hamdard University Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Munshiganj", city: "Munshiganj", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://hamdarduniversity.edu.bd" },
  { slug: "holy-cross-college-dhaka", en: "Holy Cross College Dhaka", bn: "Holy Cross College Dhaka", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://hcc.edu.bd" },
  { slug: "independent-university-bangladesh-2", en: "Independent University Bangladesh", bn: "Independent University Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://iub.edu.bd" },
  { slug: "international-islamic-university-chittagong", en: "International Islamic University Chittagong", bn: "International Islamic University Chittagong", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://iiuc.ac.bd" },
  { slug: "international-standard-university", en: "International Standard University", bn: "International Standard University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://isu.ac.bd" },
  { slug: "international-university-of-business-agriculture-and-technology", en: "International University of Business Agriculture and Technology", bn: "International University of Business Agriculture and Technology", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://iubat.edu" },
  { slug: "ishakha-international-university-bangladesh", en: "Ishakha International University Bangladesh", bn: "Ishakha International University Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Kishoreganj", city: "Kishoreganj", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ishakha.edu.bd" },
  { slug: "islamic-university-bangladesh", en: "Islamic University Bangladesh", bn: "Islamic University Bangladesh", categorySlug: "university-college", division: "Khulna", district: "Kushtia", city: "Kushtia", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://iu.ac.bd" },
  { slug: "jahangirnagar-university", en: "Jahangirnagar University", bn: "Jahangirnagar University", categorySlug: "university-college", division: "Dhaka", district: "Savar", city: "Savar", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://juniv.edu" },
  { slug: "jashore-university-of-science-and-technology", en: "Jashore University of Science and Technology", bn: "Jashore University of Science and Technology", categorySlug: "university-college", division: "Khulna", district: "Jashore", city: "Jashore", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://just.edu.bd" },
  { slug: "khulna-khan-bahadur-ahsanullah-university", en: "Khulna Khan Bahadur Ahsanullah University", bn: "Khulna Khan Bahadur Ahsanullah University", categorySlug: "university-college", division: "Khulna", district: "Khulna", city: "Khulna", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://kkbau.ac.bd" },
  { slug: "khulna-university", en: "Khulna University", bn: "Khulna University", categorySlug: "university-college", division: "Khulna", district: "Khulna", city: "Khulna", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ku.ac.bd" },
  { slug: "khulna-university-of-engineering-and-technology", en: "Khulna University of Engineering and Technology", bn: "Khulna University of Engineering and Technology", categorySlug: "university-college", division: "Khulna", district: "Khulna", city: "Khulna", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://kuet.ac.bd" },
  { slug: "khwaja-yunus-ali-university", en: "Khwaja Yunus Ali University", bn: "Khwaja Yunus Ali University", categorySlug: "university-college", division: "Rajshahi", district: "Sirajganj", city: "Sirajganj", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://kyau.edu.bd" },
  { slug: "leading-university", en: "Leading University", bn: "Leading University", categorySlug: "university-college", division: "Sylhet", district: "Sylhet", city: "Sylhet", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://lus.ac.bd" },
  { slug: "manarat-international-university", en: "Manarat International University", bn: "Manarat International University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://manarat.ac.bd" },
  { slug: "mawlana-bhashani-science-and-technology-university", en: "Mawlana Bhashani Science and Technology University", bn: "Mawlana Bhashani Science and Technology University", categorySlug: "university-college", division: "Dhaka", district: "Tangail", city: "Tangail", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://mbstu.ac.bd" },
  { slug: "metropolitan-university", en: "Metropolitan University", bn: "Metropolitan University", categorySlug: "university-college", division: "Sylhet", district: "Sylhet", city: "Sylhet", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://metrouni.edu.bd" },
  { slug: "noakhali-science-and-technology-university", en: "Noakhali Science and Technology University", bn: "Noakhali Science and Technology University", categorySlug: "university-college", division: "Chattogram", district: "Noakhali", city: "Noakhali", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://nstu.edu.bd" },
  { slug: "north-bengal-international-university", en: "North Bengal International University", bn: "North Bengal International University", categorySlug: "university-college", division: "Rajshahi", district: "Rajshahi", city: "Rajshahi", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://nbiu.edu.bd" },
  { slug: "north-east-university-bangladesh", en: "North East University Bangladesh", bn: "North East University Bangladesh", categorySlug: "university-college", division: "Sylhet", district: "Sylhet", city: "Sylhet", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://neub.edu.bd" },
  { slug: "north-south-university-2", en: "North South University", bn: "North South University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://northsouth.edu" },
  { slug: "north-western-university", en: "North Western University", bn: "North Western University", categorySlug: "university-college", division: "Khulna", district: "Khulna", city: "Khulna", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://nwu.edu.bd" },
  { slug: "northern-university-bangladesh", en: "Northern University Bangladesh", bn: "Northern University Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://nub.ac.bd" },
  { slug: "northern-university-of-business-and-technology", en: "Northern University of Business and Technology", bn: "Northern University of Business and Technology", categorySlug: "university-college", division: "Khulna", district: "Khulna", city: "Khulna", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://nubtkhulna.ac.bd" },
  { slug: "notre-dame-college-dhaka", en: "Notre Dame College Dhaka", bn: "Notre Dame College Dhaka", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ndc.edu.bd" },
  { slug: "notre-dame-university-bangladesh", en: "Notre Dame University Bangladesh", bn: "Notre Dame University Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ndub.edu.bd" },
  { slug: "npi-university-of-bangladesh", en: "NPI University of Bangladesh", bn: "NPI University of Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Manikganj", city: "Manikganj", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://npiub.edu.bd" },
  { slug: "pabna-university-of-science-and-technology", en: "Pabna University of Science and Technology", bn: "Pabna University of Science and Technology", categorySlug: "university-college", division: "Rajshahi", district: "Pabna", city: "Pabna", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://pust.ac.bd" },
  { slug: "patuakhali-science-and-technology-university", en: "Patuakhali Science and Technology University", bn: "Patuakhali Science and Technology University", categorySlug: "university-college", division: "Barishal", district: "Patuakhali", city: "Patuakhali", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://pstu.ac.bd" },
  { slug: "port-city-international-university", en: "Port City International University", bn: "Port City International University", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://portcity.edu.bd" },
  { slug: "premier-university", en: "Premier University", bn: "Premier University", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://puc.ac.bd" },
  { slug: "presidency-university", en: "Presidency University", bn: "Presidency University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://presidency.edu.bd" },
  { slug: "prime-university", en: "Prime University", bn: "Prime University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://primeuniversity.edu.bd" },
  { slug: "primeasia-university", en: "Primeasia University", bn: "Primeasia University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://primeasia.edu.bd" },
  { slug: "pundra-university-of-science-and-technology", en: "Pundra University of Science and Technology", bn: "Pundra University of Science and Technology", categorySlug: "university-college", division: "Rajshahi", district: "Bogura", city: "Bogura", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://pundrauniversity.edu.bd" },
  { slug: "r-p-shaha-university", en: "R P Shaha University", bn: "R P Shaha University", categorySlug: "university-college", division: "Dhaka", district: "Narayanganj", city: "Narayanganj", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://rpsu.ac.bd" },
  { slug: "rajshahi-science-and-technology-university", en: "Rajshahi Science and Technology University", bn: "Rajshahi Science and Technology University", categorySlug: "university-college", division: "Rajshahi", district: "Natore", city: "Natore", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://rstu.edu.bd" },
  { slug: "rajshahi-university-of-engineering-and-technology", en: "Rajshahi University of Engineering and Technology", bn: "Rajshahi University of Engineering and Technology", categorySlug: "university-college", division: "Rajshahi", district: "Rajshahi", city: "Rajshahi", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ruet.ac.bd" },
  { slug: "rangamati-science-and-technology-university", en: "Rangamati Science and Technology University", bn: "Rangamati Science and Technology University", categorySlug: "university-college", division: "Chattogram", district: "Rangamati", city: "Rangamati", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://rmstu.edu.bd" },
  { slug: "royal-university-of-dhaka", en: "Royal University of Dhaka", bn: "Royal University of Dhaka", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://royal.edu.bd" },
  { slug: "shahjalal-university-of-science-and-technology", en: "Shahjalal University of Science and Technology", bn: "Shahjalal University of Science and Technology", categorySlug: "university-college", division: "Sylhet", district: "Sylhet", city: "Sylhet", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://sust.edu" },
  { slug: "shantomariam-university-of-creative-technology", en: "Shanto-Mariam University of Creative Technology", bn: "Shanto-Mariam University of Creative Technology", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://smuct.ac.bd" },
  { slug: "sonargaon-university", en: "Sonargaon University", bn: "Sonargaon University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://su.edu.bd" },
  { slug: "southeast-university", en: "Southeast University", bn: "Southeast University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://seu.ac.bd" },
  { slug: "southern-university-bangladesh", en: "Southern University Bangladesh", bn: "Southern University Bangladesh", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://southern.edu.bd" },
  { slug: "stamford-university-bangladesh", en: "Stamford University Bangladesh", bn: "Stamford University Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://stamforduniversity.edu.bd" },
  { slug: "state-university-of-bangladesh", en: "State University of Bangladesh", bn: "State University of Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://sub.ac.bd" },
  { slug: "sylhet-agricultural-university", en: "Sylhet Agricultural University", bn: "Sylhet Agricultural University", categorySlug: "university-college", division: "Sylhet", district: "Sylhet", city: "Sylhet", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://sau.ac.bd" },
  { slug: "sylhet-international-university", en: "Sylhet International University", bn: "Sylhet International University", categorySlug: "university-college", division: "Sylhet", district: "Sylhet", city: "Sylhet", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://siu.edu.bd" },
  { slug: "teesta-university", en: "Teesta University", bn: "Teesta University", categorySlug: "university-college", division: "Rangpur", district: "Rangpur", city: "Rangpur", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://teestauniversity.ac.bd" },
  { slug: "the-international-university-of-scholars", en: "The International University of Scholars", bn: "The International University of Scholars", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ius.edu.bd" },
  { slug: "the-millennium-university", en: "The Millennium University", bn: "The Millennium University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://themillenniumuniversity.edu.bd" },
  { slug: "the-peoples-university-of-bangladesh", en: "The People's University of Bangladesh", bn: "The People's University of Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://pub.ac.bd" },
  { slug: "times-university-bangladesh", en: "Times University Bangladesh", bn: "Times University Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Faridpur", city: "Faridpur", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://timesuniversitybd.com" },
  { slug: "united-international-university", en: "United International University", bn: "United International University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://uiu.ac.bd" },
  { slug: "university-of-asia-pacific", en: "University of Asia Pacific", bn: "University of Asia Pacific", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://uap-bd.edu" },
  { slug: "university-of-barishal", en: "University of Barishal", bn: "University of Barishal", categorySlug: "university-college", division: "Barishal", district: "Barishal", city: "Barishal", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://barisaluniv.edu.bd" },
  { slug: "university-of-brahmanbaria", en: "University of Brahmanbaria", bn: "University of Brahmanbaria", categorySlug: "university-college", division: "Chattogram", district: "Brahmanbaria", city: "Brahmanbaria", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://uob.edu.bd" },
  { slug: "university-of-chittagong", en: "University of Chittagong", bn: "University of Chittagong", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://cu.ac.bd" },
  { slug: "university-of-creative-technology-chittagong", en: "University of Creative Technology Chittagong", bn: "University of Creative Technology Chittagong", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://uctc.edu.bd" },
  { slug: "university-of-development-alternative", en: "University of Development Alternative", bn: "University of Development Alternative", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://uoda.edu.bd" },
  { slug: "university-of-dhaka-2", en: "University of Dhaka", bn: "University of Dhaka", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://du.ac.bd" },
  { slug: "university-of-global-village", en: "University of Global Village", bn: "University of Global Village", categorySlug: "university-college", division: "Barishal", district: "Barishal", city: "Barishal", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ugv.edu.bd" },
  { slug: "university-of-information-technology-and-sciences", en: "University of Information Technology and Sciences", bn: "University of Information Technology and Sciences", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://uits.edu.bd" },
  { slug: "university-of-liberal-arts-bangladesh", en: "University of Liberal Arts Bangladesh", bn: "University of Liberal Arts Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ulab.edu.bd" },
  { slug: "university-of-rajshahi", en: "University of Rajshahi", bn: "University of Rajshahi", categorySlug: "university-college", division: "Rajshahi", district: "Rajshahi", city: "Rajshahi", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ru.ac.bd" },
  { slug: "university-of-science-and-technology-chittagong", en: "University of Science and Technology Chittagong", bn: "University of Science and Technology Chittagong", categorySlug: "university-college", division: "Chattogram", district: "Chattogram", city: "Chattogram", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://ustc.edu.bd" },
  { slug: "university-of-skill-enrichment-and-technology", en: "University of Skill Enrichment and Technology", bn: "University of Skill Enrichment and Technology", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://uset.edu.bd" },
  { slug: "university-of-south-asia", en: "University of South Asia", bn: "University of South Asia", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://southasiauni.ac.bd" },
  { slug: "uttara-university", en: "Uttara University", bn: "Uttara University", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://uttarauniversity.edu.bd" },
  { slug: "varendra-university", en: "Varendra University", bn: "Varendra University", categorySlug: "university-college", division: "Rajshahi", district: "Rajshahi", city: "Rajshahi", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://vu.edu.bd" },
  { slug: "victoria-university-of-bangladesh", en: "Victoria University of Bangladesh", bn: "Victoria University of Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://vub.edu.bd" },
  { slug: "world-university-of-bangladesh", en: "World University of Bangladesh", bn: "World University of Bangladesh", categorySlug: "university-college", division: "Dhaka", district: "Dhaka", city: "Dhaka", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://wub.edu.bd" },
  { slug: "z-h-sikder-university-of-science-and-technology", en: "Z H Sikder University of Science and Technology", bn: "Z H Sikder University of Science and Technology", categorySlug: "university-college", division: "Dhaka", district: "Shariatpur", city: "Shariatpur", descriptionEn: "A Bangladeshi higher education institution.", descriptionBn: "একটি বাংলাদেশি উচ্চশিক্ষা প্রতিষ্ঠান।", website: "https://zhsust.edu.bd" },
];

export const profileSeeds: Profile[] = [
  { id: "u-admin", email: "admin@example.com", displayName: "Platform Admin", role: "admin", createdAt: now },
  { id: "u-moderator", email: "moderator@example.com", displayName: "Moderator", role: "moderator", createdAt: now },
  { id: "u-reviewer", email: "reviewer@example.com", displayName: "A Reviewer", role: "user", createdAt: now },
];

export const platformSettingsSeed: PlatformSettings = {
  brandName: "CultureFirst",
  tagline: "Know the culture before you choose.",
  methodologyPublic:
    "Each organization category and reviewer relationship uses a distinct, database-configured questionnaire. Scores are weighted averages on a 1-5 scale. Unanswered or 'Not observed' parameters are excluded from both the numerator and the denominator. A score requires a minimum number of answered parameters and weight coverage.",
  minProvisionalReviews: scoreThresholds.minProvisionalReviews,
  minPublishedReviews: scoreThresholds.minPublishedReviews,
  minAnsweredParameters: scoreThresholds.minAnsweredParameters,
  minWeightCoverage: scoreThresholds.minWeightCoverage,
  maintenanceMessage: null,
};

function slugParam(templateSlug: string, key: string, order: number) {
  return `${templateSlug}__${key}__${order}`;
}

/** Deterministic pseudo-random generator so fixtures are stable across runs. */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function createSeedState(): SeedState {
  const categories: OrganizationCategory[] = categorySeeds.map((c) => ({
    id: `cat-${c.slug}`,
    slug: c.slug,
    name: bid(c.en, c.bn),
    description: bid(c.descEn, c.descBn),
    icon: c.icon,
    isFallback: c.isFallback,
    createdAt: now,
  }));
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  const relationshipTypes: ReviewerRelationshipType[] = relationshipSeeds.map((r) => ({
    id: `rel-${r.slug}`,
    slug: r.slug,
    name: bid(r.en, r.bn),
    kind: r.kind,
    createdAt: now,
  }));
  const relBySlug = new Map(relationshipTypes.map((r) => [r.slug, r]));

  const categoryRelationships: CategoryRelationship[] = [];
  for (const [catSlug, relSlugs] of Object.entries(categoryRelationshipSeeds)) {
    for (const relSlug of relSlugs) {
      if (!catBySlug.has(catSlug) || !relBySlug.has(relSlug)) continue;
      categoryRelationships.push({
        id: `catrel-${catSlug}-${relSlug}`,
        categoryId: catBySlug.get(catSlug)!.id,
        relationshipTypeId: relBySlug.get(relSlug)!.id,
      });
    }
  }

  const templates: RatingTemplate[] = [];
  const templateVersions: RatingTemplateVersion[] = [];
  const parameters: RatingParameter[] = [];
  const questions: RatingQuestion[] = [];

  for (const t of templateSeeds) {
    const category = catBySlug.get(t.categorySlug)!;
    const templateId = `tpl-${t.slug}`;
    const versionId = `tplv-${t.slug}-1`;
    templates.push({
      id: templateId,
      categoryId: category.id,
      relationshipTypeIds: t.relationshipSlugs.map((s) => relBySlug.get(s)!.id),
      name: bid(t.nameEn, t.nameBn),
      createdAt: now,
    });
    templateVersions.push({
      id: versionId,
      templateId,
      version: 1,
      status: "published",
      changeNote: "Initial seeded version",
      publishedAt: now,
      createdAt: now,
    });
    t.params.forEach((p, idx) => {
      const paramId = slugParam(t.slug, p.key, idx);
      parameters.push({
        id: paramId,
        versionId,
        key: p.key,
        name: bid(p.en, p.bn),
        description: bid("", ""),
        weight: p.weight,
        order: idx,
        active: true,
      });
      p.questions.forEach((qq, qi) => {
        questions.push({
          id: `${paramId}__q${qi}`,
          parameterId: paramId,
          text: bid(qq.en, qq.bn),
          required: qq.required ?? true,
          order: qi,
        });
      });
    });
  }

  const organizations: Organization[] = organizationSeeds.map((o) => ({
    id: `org-${o.slug}`,
    slug: o.slug,
    officialName: o.en,
    bengaliName: o.bn,
    alternateNames: [],
    categoryId: catBySlug.get(o.categorySlug)!.id,
    parentOrganizationId: null,
    description: bid(o.descriptionEn, o.descriptionBn),
    website: o.website ?? null,
    address: null,
    division: o.division,
    district: o.district,
    city: o.city,
    status: "active",
    googleMapsUrl: o.googleMapsUrl ?? null,
    googlePlaceId: null,
    verified: true,
    claimStatus: "unclaimed",
    createdAt: now,
    updatedAt: now,
  }));

  const aliases: OrganizationAlias[] = [];
  const branches: OrganizationBranch[] = [];
  for (const o of organizationSeeds) {
    (o.branches ?? []).forEach((b, i) => {
      branches.push({
        id: `br-${o.slug}-${i}`,
        organizationId: `org-${o.slug}`,
        name: b.name,
        address: null,
        division: o.division,
        district: b.district,
        city: b.city,
        createdAt: now,
      });
    });
  }

  const reviews: Review[] = [];
  const answers: ReviewAnswer[] = [];
  const snapshots: ReviewScoreSnapshot[] = [];

  const templatesBySlug = new Map(templates.map((t) => [t.id, t]));

  function paramsForVersion(versionId: string) {
    return parameters.filter((p) => p.versionId === versionId);
  }

  let reviewCounter = 0;
  function addReview(
    templateId: string,
    organizationId: string,
    relationshipTypeId: string,
    status: Review["status"],
    base: number,
    bodyEn: string,
  ) {
    reviewCounter += 1;
    const template = templatesBySlug.get(templateId)!;
    const version = templateVersions.find((v) => v.templateId === templateId)!;
    const params = paramsForVersion(version.id);
    const rng = makeRng(reviewCounter * 7919 + base * 104729);
    const reviewAnswers: ReviewAnswer[] = [];
    let answerIdx = 0;
    for (const p of params) {
      // Occasionally leave a parameter as "not observed" (positive reviews less so).
      const skipChance = 0.12;
      if (rng() < skipChance) {
        reviewAnswers.push({
          id: `ans-${reviewCounter}-${answerIdx++}`,
          reviewId: `rev-${reviewCounter}`,
          parameterId: p.id,
          value: "not_observed" as RatingValue,
        });
        continue;
      }
      const jitter = Math.round((rng() - 0.5) * 2);
      const value = Math.min(5, Math.max(1, base + jitter)) as RatingValue;
      reviewAnswers.push({
        id: `ans-${reviewCounter}-${answerIdx++}`,
        reviewId: `rev-${reviewCounter}`,
        parameterId: p.id,
        value,
      });
    }
    const score = calculateReviewScore(
      toAnswerInputs(reviewAnswers.map((a) => ({ ...a }))),
      params,
      scoreThresholds,
    );
    const published = status === "published";
    reviews.push({
      id: `rev-${reviewCounter}`,
      userId: "u-reviewer",
      organizationId,
      branchId: null,
      categoryId: template.categoryId,
      relationshipTypeId,
      templateVersionId: version.id,
      status,
      title: null,
      body: bodyEn,
      employmentStage: null,
      experiencePeriod: "2023",
      displayName: "Sample Reviewer",
      language: "en",
      score: published ? score.score : null,
      createdAt: now,
      updatedAt: now,
      publishedAt: published ? now : null,
      moderationReason: null,
    });
    answers.push(...reviewAnswers);
    snapshots.push({
      reviewId: `rev-${reviewCounter}`,
      templateVersionId: version.id,
      score: score.score,
      answeredParameters: score.answeredParameters,
      weightCoverage: score.weightCoverage,
      eligible: score.eligible,
      createdAt: now,
    });
  }

  // Give the hospital patient perspective a healthier sample to show a real score.
  const hospitalPatient = templates.find((t) => t.id === "tpl-hospital-patient")!;
  const patientRel = relBySlug.get("patient")!.id;
  for (let i = 0; i < 7; i++) {
    addReview(hospitalPatient.id, "org-sample-city-general-hospital", patientRel, "published", 4, `Sample patient review ${i + 1} about respectful treatment and communication.`);
  }

  const corp = templates.find((t) => t.id === "tpl-corporate-workplace")!;
  const currentEmp = relBySlug.get("current-employee")!.id;
  for (let i = 0; i < 6; i++) {
    addReview(corp.id, "org-sample-nexus-technologies", currentEmp, "published", i % 2 === 0 ? 3 : 4, `Sample workplace review ${i + 1}.`);
  }

  const uniStudent = templates.find((t) => t.id === "tpl-university-student")!;
  const studentRel = relBySlug.get("student")!.id;
  for (let i = 0; i < 5; i++) {
    addReview(uniStudent.id, "org-sample-national-university", studentRel, "published", 4, `Sample student review ${i + 1}.`);
  }

  // Pending reviews to exercise the moderation queue.
  addReview(hospitalPatient.id, "org-sample-city-general-hospital", patientRel, "pending", 2, "Sample PENDING patient review awaiting moderation.");
  addReview(corp.id, "org-sample-nexus-technologies", currentEmp, "pending", 2, "Sample PENDING workplace review awaiting moderation.");
  const govCitizen = templates.find((t) => t.id === "tpl-government-citizen")!;
  addReview(govCitizen.id, "org-sample-ministry-of-public-services", relBySlug.get("citizen")!.id, "pending", 3, "Sample PENDING citizen review awaiting moderation.");

  const responses: OrganizationResponse[] = [];
  const auditLogs: AuditLog[] = [
    {
      id: "aud-1",
      actorUserId: "u-admin",
      action: "template.publish",
      entityType: "rating_template_version",
      entityId: "tplv-hospital-patient-1",
      detail: "Initial seeded publication",
      createdAt: now,
    },
  ];

  return {
    categories,
    relationshipTypes,
    categoryRelationships,
    templates,
    templateVersions,
    parameters,
    questions,
    organizations,
    aliases,
    branches,
    profiles: profileSeeds,
    reviews,
    answers,
    snapshots,
    responses,
    auditLogs,
    settings: platformSettingsSeed,
  };
}

/** Recompute eligible-review aggregate for a bucket of reviews. */
export function computeAggregate(
  reviews: Review[],
  answers: ReviewAnswer[],
): { averageScore: number | null; parameterScores: Record<string, number>; distribution: Record<string, number>; eligibleCount: number } {
  const eligible = reviews.filter((r) => r.status === "published" && r.score !== null);
  const inputs = eligible.map((r) => ({
    score: r.score as number,
    answers: answers.filter((a) => a.reviewId === r.id).map((a) => ({ parameterId: a.parameterId, value: a.value })),
    relationshipTypeId: r.relationshipTypeId,
    templateVersionId: r.templateVersionId,
  }));
  const agg = aggregateReviews(inputs);
  const parameterScores: Record<string, number> = {};
  for (const p of agg.parameterAverages) parameterScores[p.parameterId] = p.average;
  return {
    averageScore: agg.averageScore,
    parameterScores,
    distribution: agg.distribution,
    eligibleCount: agg.eligibleCount,
  };
}
