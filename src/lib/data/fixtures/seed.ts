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
