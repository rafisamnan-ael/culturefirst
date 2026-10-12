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
} from "@/types/domain";

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

// ============================================================================
// BANGLADESHI ORGANIZATIONS SEED DATA
// ============================================================================

const bangladeshiOrganizations = [
  // PRIVATE COMPANIES (IT & TECH)
  {
    name: "Grameenphone",
    slug: "grameenphone",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.grameenphone.com",
    address: "GP House, 47 Kawran Bazar, Dhaka 1215",
  },
  {
    name: "Robi Axiata",
    slug: "robi-axiata",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.robi.com.bd",
    address: "Robi Corporate Office, 17-19 Kemal Ataturk Avenue, Banani, Dhaka 1213",
  },
  {
    name: "Banglalink",
    slug: "banglalink",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.banglalink.com.bd",
    address: "Banglalink Office, 42 Kawran Bazar, Dhaka 1215",
  },
  {
    name: "bKash",
    slug: "bkash",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.bkash.com",
    address: "bKash Head Office, Gulshan, Dhaka 1212",
  },
  {
    name: "Nagad",
    slug: "nagad",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.mynagad.com",
    address: "Nagad Office, Niketan, Gulshan 1, Dhaka 1212",
  },
  {
    name: "Rocket",
    slug: "rocket",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.rocket.com.bd",
    address: "Rocket Office, Motijheel, Dhaka 1000",
  },
  {
    name: "10 Minute School",
    slug: "10-minute-school",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.10minuteschool.com",
    address: "10 Minute School, Gulshan, Dhaka 1212",
  },
  {
    name: "Pathao",
    slug: "pathao",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.pathao.com",
    address: "Pathao Head Office, Banani, Dhaka 1213",
  },
  {
    name: "Uber Bangladesh",
    slug: "uber-bangladesh",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.uber.com/en-BD/cities/dhaka/",
    address: "Uber Office, Gulshan, Dhaka 1212",
  },
  {
    name: "Shohoz",
    slug: "shohoz",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.shohoz.com",
    address: "Shohoz Office, Kawran Bazar, Dhaka 1215",
  },

  // PRIVATE COMPANIES (FINANCE & BANKING)
  {
    name: "Dutch-Bangla Bank",
    slug: "dutch-bangla-bank",
    category: "bank-financial",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.dutchbanglabank.com",
    address: "DBBL Head Office, Motijheel, Dhaka 1000",
  },
  {
    name: "Standard Chartered Bank Bangladesh",
    slug: "standard-chartered-bank",
    category: "bank-financial",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.standardchartered.com/bd",
    address: "SC Bank Office, Gulshan, Dhaka 1212",
  },
  {
    name: "BRAC Bank",
    slug: "brac-bank",
    category: "bank-financial",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.bracbank.com",
    address: "BRAC Bank Head Office, Motijheel, Dhaka 1000",
  },
  {
    name: "Prime Bank",
    slug: "prime-bank",
    category: "bank-financial",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.primebank.com.bd",
    address: "Prime Bank Head Office, Motijheel, Dhaka 1000",
  },
  {
    name: "Islami Bank Bangladesh",
    slug: "islami-bank-bangladesh",
    category: "bank-financial",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.islamibankbd.com",
    address: "IBBL Head Office, Motijheel, Dhaka 1000",
  },

  // HEALTHCARE
  {
    name: "Apollo Hospitals Dhaka",
    slug: "apollo-hospitals-dhaka",
    category: "hospital-clinic",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.apollohospitalsdhaka.com",
    address: "Apollo Hospitals, Banani, Dhaka 1213",
  },
  {
    name: "United Hospital",
    slug: "united-hospital",
    category: "hospital-clinic",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.unitedhospital.com.bd",
    address: "United Hospital, Gulshan, Dhaka 1212",
  },
  {
    name: "Square Hospitals",
    slug: "square-hospitals",
    category: "hospital-clinic",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.squarehospital.com",
    address: "Square Hospitals, Panthapath, Dhaka 1205",
  },
  {
    name: "Evercare Hospital",
    slug: "evercare-hospital",
    category: "hospital-clinic",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.evercaredhaka.com",
    address: "Evercare Hospital, Banani, Dhaka 1213",
  },
  {
    name: "LabAid Specialized Hospital",
    slug: "labaid-hospital",
    category: "hospital-clinic",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.labaidhosp.com",
    address: "LabAid Hospital, Motijheel, Dhaka 1000",
  },
  {
    name: "Bangladesh Medical College Hospital",
    slug: "bangladesh-medical-college",
    category: "hospital-clinic",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.bmch.org.bd",
    address: "BMC Hospital, Dhanmondi, Dhaka 1209",
  },

  // EDUCATION
  {
    name: "BRAC University",
    slug: "brac-university",
    category: "university-college",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.bracu.ac.bd",
    address: "BRAC University, Merul Badda, Dhaka 1212",
  },
  {
    name: "North South University",
    slug: "north-south-university",
    category: "university-college",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.northsouth.edu",
    address: "NSU Campus, Banani, Dhaka 1213",
  },
  {
    name: "Independent University Bangladesh",
    slug: "independent-university-bangladesh",
    category: "university-college",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.iub.edu.bd",
    address: "IUB Campus, Bashundhara, Dhaka 1212",
  },
  {
    name: "American International University-Bangladesh",
    slug: "aiub",
    category: "university-college",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.aiub.edu",
    address: "AIUB Campus, Banani, Dhaka 1213",
  },
  {
    name: "Dhaka University",
    slug: "dhaka-university",
    category: "university-college",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.du.ac.bd",
    address: "Dhaka University Campus, Nilkhet, Dhaka 1000",
  },
  {
    name: "Bangladesh University of Engineering and Technology",
    slug: "buet",
    category: "university-college",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.buet.ac.bd",
    address: "BUET Campus, Ramna, Dhaka 1000",
  },

  // NGOS & NONPROFITS
  {
    name: "BRAC",
    slug: "brac",
    category: "ngo-nonprofit",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.brac.net",
    address: "BRAC Head Office, Kawran Bazar, Dhaka 1215",
  },
  {
    name: "Grameen Bank",
    slug: "grameen-bank",
    category: "ngo-nonprofit",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.grameen.com",
    address: "Grameen Bank Head Office, Mirpur, Dhaka 1216",
  },
  {
    name: "ASA Bangladesh",
    slug: "asa-bangladesh",
    category: "ngo-nonprofit",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.asa.org.bd",
    address: "ASA Office, Gulshan, Dhaka 1212",
  },
  {
    name: "SaveTheTigers Bangladesh",
    slug: "save-tigers-bangladesh",
    category: "ngo-nonprofit",
    division: "Khulna",
    district: "Khulna",
    city: "Khulna",
    websiteUrl: "https://www.savethetigers.org.bd",
    address: "SaveTheTigers Office, Khulna City",
  },

  // GOVERNMENT OFFICES (Sample)
  {
    name: "Ministry of Information and Broadcasting",
    slug: "ministry-information-broadcasting",
    category: "government-office",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.mib.gov.bd",
    address: "Ministry Building, Tejtutulia, Dhaka 1000",
  },
  {
    name: "Bangladesh Customs",
    slug: "bangladesh-customs",
    category: "government-office",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.customs.gov.bd",
    address: "Customs House, Motijheel, Dhaka 1000",
  },
  {
    name: "Bangladesh Tax Board",
    slug: "bangladesh-tax-board",
    category: "government-office",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.nbr.gov.bd",
    address: "NBR Headquarters, Motijheel, Dhaka 1000",
  },

  // MANUFACTURING & INDUSTRIAL
  {
    name: "Square Pharmaceuticals",
    slug: "square-pharmaceuticals",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.squaregroup.com",
    address: "Square Pharma Head Office, Motijheel, Dhaka 1000",
  },
  {
    name: "Beximco Limited",
    slug: "beximco-limited",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.beximco.com",
    address: "Beximco Office, Gulshan, Dhaka 1212",
  },
  {
    name: "RFL Industries",
    slug: "rfl-industries",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.rflgroup.com",
    address: "RFL Head Office, Motijheel, Dhaka 1000",
  },

  // RETAIL & COMMERCE
  {
    name: "Daraz Bangladesh",
    slug: "daraz-bangladesh",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.daraz.com.bd",
    address: "Daraz Office, Gulshan, Dhaka 1212",
  },
  {
    name: "AjkerDeal",
    slug: "ajkerdeal",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.ajkerdeal.com",
    address: "AjkerDeal Office, Kawran Bazar, Dhaka 1215",
  },
  {
    name: "Shwapno",
    slug: "shwapno",
    category: "private-company",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.shwapno.com",
    address: "Shwapno Head Office, Motijheel, Dhaka 1000",
  },

  // SCHOOLS
  {
    name: "Scholastica School",
    slug: "scholastica-school",
    category: "school",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.scholastica.edu.bd",
    address: "Scholastica, Mirpur, Dhaka 1216",
  },
  {
    name: "Rangs Educational Institution",
    slug: "rangs-educational",
    category: "school",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.rangs.org",
    address: "Rangs School, Dhaka",
  },
  {
    name: "Global School",
    slug: "global-school",
    category: "school",
    division: "Dhaka",
    district: "Dhaka",
    city: "Dhaka",
    websiteUrl: "https://www.globalschool.edu.bd",
    address: "Global School, Mirpur, Dhaka 1216",
  },
];

export function createSeedOrganizations(): Organization[] {
  return bangladeshiOrganizations.map((org, index) => ({
    id: `org-${index + 1}`,
    slug: org.slug,
    officialName: org.name,
    bengaliName: null,
    alternateNames: [],
    categoryId: `cat-${org.category}`,
    parentOrganizationId: null,
    description: { en: "", bn: "" },
    website: org.websiteUrl,
    address: org.address,
    division: org.division,
    district: org.district,
    city: org.city,
    status: "active" as const,
    googleMapsUrl: null,
    googlePlaceId: null,
    verified: false,
    claimStatus: "unclaimed" as const,
    createdAt: now,
    updatedAt: now,
  }));
}

export function createSeedState(): SeedState {
  // Get pre-existing seed functions from the original file
  const categories = createSeedCategories();
  const relationshipTypes = createSeedRelationshipTypes();
  const categoryRelationships = createSeedCategoryRelationships();
  const templates = createSeedTemplates();
  const templateVersions = createSeedTemplateVersions();
  const parameters = createSeedParameters();
  const questions = createSeedQuestions();
  const organizations = createSeedOrganizations();
  const aliases: OrganizationAlias[] = [];
  const branches: OrganizationBranch[] = [];
  const profiles: Profile[] = [
    {
      id: "admin",
      role: "admin",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "reviewer",
      role: "user",
      createdAt: now,
      updatedAt: now,
    },
  ];
  const reviews: Review[] = [];
  const answers: ReviewAnswer[] = [];
  const snapshots: ReviewScoreSnapshot[] = [];
  const responses: OrganizationResponse[] = [];
  const auditLogs: AuditLog[] = [];
  const settings: PlatformSettings = {
    brandName: "CultureFirst",
    brandTagline: "Know the culture before you choose.",
    countryCode: "BD",
    publicReviewNeedsApproval: true, // ALL REVIEWS NEED ADMIN APPROVAL
    createdAt: now,
    updatedAt: now,
  };

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
    profiles,
    reviews,
    answers,
    snapshots,
    responses,
    auditLogs,
    settings,
  };
}

// Helper functions for categories, relationships, templates, etc.
function createSeedCategories(): OrganizationCategory[] {
  return [
    {
      id: "cat-private-company",
      slug: "private-company",
      name: bid("Private Company", "বেসরকারি প্রতিষ্ঠান"),
      description: bid(
        "Private companies and corporations",
        "বেসরকারি প্রতিষ্ঠান ও কর্পোরেশন"
      ),
      icon: "building",
      active: true,
      createdAt: now,
    },
    {
      id: "cat-hospital-clinic",
      slug: "hospital-clinic",
      name: bid("Hospital or Clinic", "হাসপাতাল বা ক্লিনিক"),
      description: bid(
        "Hospitals and medical clinics",
        "হাসপাতাল ও চিকিৎসা ক্লিনিক"
      ),
      icon: "hospital",
      active: true,
      createdAt: now,
    },
    {
      id: "cat-university-college",
      slug: "university-college",
      name: bid("University or College", "বিশ্ববিদ্যালয় বা কলেজ"),
      description: bid(
        "Universities and colleges",
        "বিশ্ববিদ্যালয় ও কলেজ"
      ),
      icon: "graduation",
      active: true,
      createdAt: now,
    },
    {
      id: "cat-school",
      slug: "school",
      name: bid("School", "স্কুল"),
      description: bid("Schools and educational institutions", "স্কুল ও শিক্ষা প্রতিষ্ঠান"),
      icon: "book",
      active: true,
      createdAt: now,
    },
    {
      id: "cat-bank-financial",
      slug: "bank-financial",
      name: bid("Bank or Financial Institution", "ব্যাংক বা আর্থিক প্রতিষ্ঠান"),
      description: bid("Banks and financial institutions", "ব্যাংক ও আর্থিক প্রতিষ্ঠান"),
      icon: "landmark",
      active: true,
      createdAt: now,
    },
    {
      id: "cat-government-office",
      slug: "government-office",
      name: bid("Government Office", "সরকারি দফতর"),
      description: bid("Government offices and departments", "সরকারি দফতর ও বিভাগ"),
      icon: "building-2",
      active: true,
      createdAt: now,
    },
    {
      id: "cat-ngo-nonprofit",
      slug: "ngo-nonprofit",
      name: bid("NGO or Nonprofit", "এনজিও বা অলাভজনক সংস্থা"),
      description: bid("NGOs and nonprofit organizations", "এনজিও ও অলাভজনক সংস্থা"),
      icon: "heart-handshake",
      active: true,
      createdAt: now,
    },
  ];
}

function createSeedRelationshipTypes(): ReviewerRelationshipType[] {
  return [
    { id: "rel-current-employee", slug: "current-employee", name: bid("Current Employee", "বর্তমান কর্মচারী"), active: true, createdAt: now },
    { id: "rel-former-employee", slug: "former-employee", name: bid("Former Employee", "প্রাক্তন কর্মচারী"), active: true, createdAt: now },
    { id: "rel-patient", slug: "patient", name: bid("Patient", "রোগী"), active: true, createdAt: now },
    { id: "rel-visitor", slug: "visitor", name: bid("Visitor", "দর্শক"), active: true, createdAt: now },
    { id: "rel-student", slug: "student", name: bid("Current Student", "বর্তমান শিক্ষার্থী"), active: true, createdAt: now },
    { id: "rel-alumni", slug: "alumni", name: bid("Alumni", "প্রাক্তন শিক্ষার্থী"), active: true, createdAt: now },
    { id: "rel-beneficiary", slug: "beneficiary", name: bid("Beneficiary", "সুবিধাভোগী"), active: true, createdAt: now },
  ];
}

function createSeedCategoryRelationships(): CategoryRelationship[] {
  return [
    { categoryId: "cat-private-company", relationshipTypeId: "rel-current-employee", createdAt: now },
    { categoryId: "cat-private-company", relationshipTypeId: "rel-former-employee", createdAt: now },
    { categoryId: "cat-hospital-clinic", relationshipTypeId: "rel-patient", createdAt: now },
    { categoryId: "cat-university-college", relationshipTypeId: "rel-student", createdAt: now },
    { categoryId: "cat-university-college", relationshipTypeId: "rel-alumni", createdAt: now },
    { categoryId: "cat-school", relationshipTypeId: "rel-student", createdAt: now },
    { categoryId: "cat-bank-financial", relationshipTypeId: "rel-current-employee", createdAt: now },
    { categoryId: "cat-government-office", relationshipTypeId: "rel-visitor", createdAt: now },
    { categoryId: "cat-ngo-nonprofit", relationshipTypeId: "rel-beneficiary", createdAt: now },
  ];
}

function createSeedTemplates(): RatingTemplate[] {
  return [
    { id: "tmpl-1", slug: "corporate-culture", name: bid("Workplace Culture", "কর্মক্ষেত্রের সংস্কৃতি"), active: true, createdAt: now },
    { id: "tmpl-2", slug: "patient-experience", name: bid("Patient Experience", "রোগীর অভিজ্ঞতা"), active: true, createdAt: now },
    { id: "tmpl-3", slug: "student-experience", name: bid("Student Experience", "শিক্ষার্থীর অভিজ্ঞতা"), active: true, createdAt: now },
  ];
}

function createSeedTemplateVersions(): RatingTemplateVersion[] {
  return [
    { id: "tv-1", templateId: "tmpl-1", version: 1, status: "published", changeNote: null, publishedAt: now, createdAt: now },
    { id: "tv-2", templateId: "tmpl-2", version: 1, status: "published", changeNote: null, publishedAt: now, createdAt: now },
    { id: "tv-3", templateId: "tmpl-3", version: 1, status: "published", changeNote: null, publishedAt: now, createdAt: now },
  ];
}

function createSeedParameters(): RatingParameter[] {
  return [
    { id: "p-1", versionId: "tv-1", key: "respect", name: bid("Respect & Dignity", "সম্মান ও মর্যাদা"), description: bid("How respectfully are people treated?", "মানুষকে কতটা সম্মানের সাথে আচরণ করা হয়?"), weight: 25, order: 1, active: true },
    { id: "p-2", versionId: "tv-1", key: "fairness", name: bid("Fairness", "ন্যায্যতা"), description: bid("Are decisions and processes fair?", "সিদ্ধান্ত ও প্রক্রিয়া কি ন্যায্য?"), weight: 25, order: 2, active: true },
    { id: "p-3", versionId: "tv-1", key: "communication", name: bid("Communication", "যোগাযোগ"), description: bid("Can concerns be raised safely?", "নিরাপদে উদ্বেগ জানানো যায় কি?"), weight: 20, order: 3, active: true },
    { id: "p-4", versionId: "tv-1", key: "accountability", name: bid("Accountability", "জবাবদিহিতা"), description: bid("Are people held accountable?", "মানুষকে কি দায়বদ্ধ রাখা হয়?"), weight: 20, order: 4, active: true },
    { id: "p-5", versionId: "tv-1", key: "conduct", name: bid("Professional Conduct", "পেশাদার আচরণ"), description: bid("Is conduct professional?", "আচরণ কি পেশাদার?"), weight: 10, order: 5, active: true },
  ];
}

function createSeedQuestions(): RatingQuestion[] {
  return [
    { id: "q-1", parameterId: "p-1", text: bid("Do supervisors treat you with respect?", "আপনার সুপারভাইজাররা কি আপনাকে সম্মানের সাথে আচরণ করেন?"), required: true, order: 1 },
    { id: "q-2", parameterId: "p-1", text: bid("Do colleagues treat each other fairly regardless of position?", "সহকর্মীরা অবস্থান নির্বিশেষে একে অপরের সাথে ন্যায্যভাবে আচরণ করেন কি?"), required: true, order: 2 },
    { id: "q-3", parameterId: "p-2", text: bid("Are promotions based on merit?", "পদোন্নতি যোগ্যতার উপর ভিত্তি করে হয় কি?"), required: true, order: 3 },
  ];
}
