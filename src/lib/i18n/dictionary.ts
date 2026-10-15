import type { Bilingual } from "@/types/domain";

export type Locale = "en" | "bn";

/**
 * Flat key -> bilingual dictionary. Review CONTENT is never translated; only
 * interface strings, labels, category names, parameters and questions are.
 */
export const dictionary: Record<string, Bilingual> = {
  // Navigation
  "nav.directory": { en: "Organizations", bn: "প্রতিষ্ঠান" },
  "nav.categories": { en: "Categories", bn: "ক্যাটাগরি" },
  "nav.howItWorks": { en: "How it works", bn: "যেভাবে কাজ করে" },
  "nav.methodology": { en: "Methodology", bn: "পদ্ধতি" },
  "nav.about": { en: "About", bn: "সম্পর্কে" },
  "nav.contact": { en: "Contact", bn: "যোগাযোগ" },
  "nav.login": { en: "Sign in", bn: "সাইন ইন" },
  "nav.signup": { en: "Create account", bn: "অ্যাকাউন্ট খুলুন" },
  "nav.dashboard": { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  "nav.admin": { en: "Admin", bn: "অ্যাডমিন" },
  "nav.logout": { en: "Sign out", bn: "সাইন আউট" },
  "nav.writeReview": { en: "Write a review", bn: "রিভিউ লিখুন" },

  // Common
  "common.search": { en: "Search", bn: "অনুসন্ধান" },
  "common.searchPlaceholder": {
    en: "Search organizations by name (English or Bangla)…",
    bn: "নাম দিয়ে প্রতিষ্ঠান খুঁজুন (ইংরেজি বা বাংলা)…",
  },
  "common.allCategories": { en: "All categories", bn: "সব ক্যাটাগরি" },
  "common.allDivisions": { en: "All divisions", bn: "সব বিভাগ" },
  "common.allPerspectives": { en: "All perspectives", bn: "সব দৃষ্টিভঙ্গি" },
  "common.loading": { en: "Loading…", bn: "লোড হচ্ছে…" },
  "common.error": { en: "Something went wrong.", bn: "কিছু ভুল হয়েছে।" },
  "common.retry": { en: "Try again", bn: "আবার চেষ্টা করুন" },
  "common.submit": { en: "Submit", bn: "জমা দিন" },
  "common.cancel": { en: "Cancel", bn: "বাতিল" },
  "common.save": { en: "Save", bn: "সংরক্ষণ" },
  "common.next": { en: "Next", bn: "পরবর্তী" },
  "common.back": { en: "Back", bn: "পূর্ববর্তী" },
  "common.close": { en: "Close", bn: "বন্ধ করুন" },
  "common.optional": { en: "optional", bn: "ঐচ্ছিক" },
  "common.required": { en: "required", bn: "আবশ্যক" },
  "common.viewAll": { en: "View all", bn: "সব দেখুন" },
  "common.reviews": { en: "reviews", bn: "রিভিউ" },
  "common.review": { en: "review", bn: "রিভিউ" },
  "common.branch": { en: "Branch", bn: "শাখা" },
  "common.organization": { en: "Organization", bn: "প্রতিষ্ঠান" },
  "common.category": { en: "Category", bn: "ক্যাটাগরি" },
  "common.perspective": { en: "Perspective", bn: "দৃষ্টিভঙ্গি" },
  "common.date": { en: "Date", bn: "তারিখ" },
  "common.status": { en: "Status", bn: "অবস্থা" },
  "common.actions": { en: "Actions", bn: "কার্যক্রম" },
  "common.locale": { en: "English", bn: "বাংলা" },

  // Homepage
  "home.heroTitle": { en: "Know how organizations treat people.", bn: "প্রতিষ্ঠান মানুষকে কীভাবেআচরণ করে, জানুন।" },
  "home.heroSubtitle": {
    en: "Explore real experiences of respect, fairness, leadership and accountability across organizations in Bangladesh.",
    bn: "বাংলাদেশের বিভিন্ন প্রতিষ্ঠানে সম্মান, ন্যায্যতা, নেতৃত্ব ও জবাবদিহিতার বাস্তব অভিজ্ঞান জানুন।",
  },
  "home.browseCategories": { en: "Browse by category", bn: "ক্যাটাগরি অনুযায়ী দেখুন" },
  "home.exploreAllCategories": { en: "Explore all categories", bn: "সব ক্যাটাগরি দেখুন" },
  "home.featured": { en: "Recently reviewed organizations", bn: "সম্প্রতি পর্যালোচিত প্রতিষ্ঠান" },
  "home.exploreTitle": { en: "Explore organizations", bn: "প্রতিষ্ঠান ঘুরে দেখুন" },
  "home.exploreSubtitle": { en: "Discover workplaces, institutions and services across Bangladesh.", bn: "বাংলাদেশজুড়ে কর্মক্ষেত্র, প্রতিষ্ঠান ও সেবা আবিষ্কার করুন।" },
  "home.perspectivesTitle": { en: "Different people, different perspectives", bn: "ভিন্ন মানুষ, ভিন্ন দৃষ্টিভঙ্গি" },
  "home.perspectivesBody": {
    en: "A hospital is experienced differently by a patient and by an employee. CultureFirst keeps each perspective separate, with its own parameters, so no one score hides another.",
    bn: "একটি হাসপাতাল রোগী ও কর্মীর কাছে ভিন্নভাবে অনুভূত হয়। কালচারফার্স্ট প্রতিটি দৃষ্টিভঙ্গি আলাদা রাখে, নিজস্ব প্যারামিটারসহ, যাতে কোনো স্কোর অন্যকে ঢেকে না ফেলে।",
  },
  "home.ratingTitle": { en: "How the rating system works", bn: "রেটিং সিস্টেম যেভাবে কাজ করে" },
  "home.trustTitle": { en: "Trust, privacy and moderation", bn: "বিশ্বাস, গোপনীয়তা ও মডারেশন" },
  "home.ctaTitle": { en: "Share your experience", bn: "আপনার অভিজ্ঞান শেয়ার করুন" },
  "home.ctaBody": {
    en: "Your firsthand experience helps others understand how an organization really treats people — positively or negatively.",
    bn: "আপনার বাস্তব অভিজ্ঞান অন্যদের বুঝতে সাহায্য করে একটি প্রতিষ্ঠান সত্যিই মানুষকে কীভাবেআচরণ করে।",
  },

  // Directory
  "directory.title": { en: "Organization directory", bn: "প্রতিষ্ঠান ডিরেক্টরি" },
  "directory.subtitle": { en: "Search and filter organizations across Bangladesh.", bn: "বাংলাদেশজুড়ে প্রতিষ্ঠান খুঁজুন ও ফিল্টার করুন।" },
  "directory.results": { en: "organizations", bn: "প্রতিষ্ঠান" },
  "directory.empty": { en: "No organizations match your search.", bn: "আপনার অনুসন্ধানের সাথে কোনো প্রতিষ্ঠান মেলেনি।" },
  "directory.ratingCoverage": { en: "Rating coverage", bn: "রেটিং কভারেজ" },
  "directory.hasScores": { en: "Has culture scores", bn: "স্কোর আছে" },
  "directory.all": { en: "All", bn: "সব" },
  "directory.page": { en: "Page", bn: "পৃষ্ঠা" },
  "directory.filters": { en: "Filters", bn: "ফিল্টার" },
  "directory.clearFilters": { en: "Clear all filters", bn: "সব ফিল্টার মুছুন" },
  "directory.showing": { en: "Showing {from}–{to} of {total} organizations", bn: "{total}টি প্রতিষ্ঠানের মধ্যে {from}–{to} দেখানো হচ্ছে" },
  "directory.searchLabel": { en: "Search by name", bn: "নাম দিয়ে খুঁজুন" },

  // Category
  "category.about": { en: "About this category", bn: "এই ক্যাটাগরি সম্পর্কে" },
  "category.criteria": { en: "What we measure", bn: "আমরা যা মাপি" },
  "category.perspectives": { en: "Reviewer perspectives", bn: "রিভিউয়ার দৃষ্টিভঙ্গি" },
  "category.orgsInCategory": { en: "Organizations in this category", bn: "এই ক্যাটাগরির প্রতিষ্ঠান" },
  "category.showingOf": { en: "Showing {shown} of {total} organizations", bn: "{total}টি প্রতিষ্ঠানের মধ্যে {shown}টি দেখানো হচ্ছে" },
  "category.viewAllOrgs": { en: "View all {count} organizations", bn: "সব {count}টি প্রতিষ্ঠান দেখুন" },

  // Organization profile
  "org.overview": { en: "Overview", bn: "সারসংক্ষেপ" },
  "org.cultureScore": { en: "Culture score", bn: "কালচার স্কোর" },
  "org.insufficient": { en: "Insufficient data to calculate a public culture score", bn: "সর্বজনীন কালচার স্কোর দেওয়ার মতো পর্যাপ্ত তথ্য নেই" },
  "org.provisional": { en: "Provisional score", bn: "সাময়িক স্কোর" },
  "org.noReviewsYet": { en: "No reviews yet", bn: "এখনো কোনো রিভিউ নেই" },
  "org.lowSample": {
    en: "Low sample size — interpret with caution. This is not a statistically reliable measurement.",
    bn: "কম নমুনা — সতর্কতার সাথে ব্যাখ্যা করুন। এটি একটি পরিসংখ্যানগতভাবে নির্ভরযোগ্য পরিমাপ নয়।",
  },
  "org.basedOn": { en: "Based on", bn: "ভিত্তি" },
  "org.eligibleReviews": { en: "eligible reviews", bn: "যোগ্য রিভিউ" },
  "org.parameterBreakdown": { en: "Parameter breakdown", bn: "প্যারামিটার বিশ্লেষণ" },
  "org.distribution": { en: "Rating distribution", bn: "রেটিং বিতরণ" },
  "org.recentReviews": { en: "Recent reviews", bn: "সাম্প্রতিক রিভিউ" },
  "org.strengths": { en: "Strengths", bn: "শক্তি" },
  "org.concerns": { en: "Concerns", bn: "উদ্বেগ" },
  "org.noStrengthConcern": {
    en: "Not enough data yet to highlight consistent strengths or concerns.",
    bn: "ধারাবাহিক শক্তি বা উদ্বেগ তুলে ধরার মতো যথেষ্ট তথ্য এখনো নেই।",
  },
  "org.organizationResponses": { en: "Organization responses", bn: "প্রতিষ্ঠানের প্রতিক্রিয়া" },
  "org.viewOnGoogle": { en: "View reviews on Google Maps", bn: "গুগল ম্যাপে রিভিউ দেখুন" },
  "org.viewGoogleReviews": { en: "View Google Reviews", bn: "গুগল রিভিউ দেখুন" },
  "org.googleSearch": { en: "Search for this organization on Google", bn: "গুগলে এই প্রতিষ্ঠানটি খুঁজুন" },
  "org.googleSeparate": {
    en: "Opens in a new tab. Google ratings are entirely separate from CultureFirst culture scores and are never combined.",
    bn: "নতুন ট্যাবে খুলবে। গুগল রেটিং কালচারফার্স্ট কালচার স্কোর থেকে সম্পূর্ণ আলাদা এবং কখনো একত্র করা হয় না।",
  },
  "org.reportIncorrect": { en: "Report incorrect information", bn: "ভুল তথ্য জানান" },
  "org.methodologyLink": { en: "How this score is calculated", bn: "এই স্কোর কীভাবে হিসাব হয়" },
  "org.noReviews": { en: "No approved reviews yet for this perspective.", bn: "এই দৃষ্টিভঙ্গির জন্য এখনো অনুমোদিত রিভিউ নেই।" },
  "org.questionnaireUnavailable": {
    en: "A culture questionnaire for this perspective is not yet available.",
    bn: "এই দৃষ্টিভঙ্গির জন্য এখনো কোনো কালচার প্রশ্নমালা তৈরি হয়নি।",
  },
  "org.officialWebsite": { en: "Official website", bn: "অফিসিয়াল ওয়েবসাইট" },
  "org.websiteNotListed": { en: "Official website not listed", bn: "অফিসিয়াল ওয়েবসাইট তালিকাভুক্ত নয়" },
  "org.suggestWebsite": { en: "Suggest a website", bn: "ওয়েবসাইট প্রস্তাব করুন" },
  "org.unclaimed": { en: "Unclaimed profile", bn: "অনাদায়ী প্রোফাইল" },
  "org.claimed": { en: "Claimed profile", bn: "দাবিকৃত প্রোফাইল" },
  "org.verified": { en: "Verified listing", bn: "যাচাইকৃত তালিকা" },
  "org.parent": { en: "Parent organization", bn: "মূল প্রতিষ্ঠান" },
  "org.responses": { en: "Responses from the organization", bn: "প্রতিষ্ঠানের প্রতিক্রিয়া" },
  "org.tabInsufficient": { en: "Insufficient data for this perspective.", bn: "এই দৃষ্টিভঙ্গির জন্য পর্যাপ্ত তথ্য নেই।" },

  // Review form
  "review.stage1": { en: "About your experience", bn: "আপনার অভিজ্ঞতা সম্পর্কে" },
  "review.stage2": { en: "Rate the culture", bn: "কালচার রেট করুন" },
  "review.stage3": { en: "Write & submit", bn: "রিভিউ লিখুন ও জমা দিন" },
  "review.step1": { en: "Confirm organization", bn: "প্রতিষ্ঠান নিশ্চিত করুন" },
  "review.step2": { en: "Your relationship", bn: "আপনার সম্পর্ক" },
  "review.step3": { en: "Experience period", bn: "অভিজ্ঞানের সময়কাল" },
  "review.step4": { en: "Rate culture parameters", bn: "কালচার প্যারামিটার রেট করুন" },
  "review.step5": { en: "Your review", bn: "আপনার রিভিউ" },
  "review.step6": { en: "Display settings", bn: "প্রদর্শন সেটিংস" },
  "review.step7": { en: "Confirm & submit", bn: "নিশ্চিত করুন ও জমা দিন" },
  "review.relationshipQuestion": { en: "What is your relationship with this organization?", bn: "এই প্রতিষ্ঠানের সাথে আপনার সম্পর্ক কী?" },
  "review.periodQuestion": { en: "Approximately when did your experience take place?", bn: "আপনার অভিজ্ঞান আনুমানিক কখন ঘটেছিল?" },
  "review.periodHelp": { en: "An approximate period (e.g. 2022–2024 or Past year) protects your privacy.", bn: "আনুমানিক সময়কাল (যেমন ২০২২–২০২৪ বা গত বছর) আপনার পরিচয় গোপন রাখে।" },
  "review.promptHeadline": { en: "What was your experience like?", bn: "আপনার অভিজ্ঞতা কেমন ছিল?" },
  "review.promptHelp": { en: "What went well? What could be improved?", bn: "কোন বিষয়টি ভালো ছিল? কী উন্নয়ন করা যেত?" },
  "review.guidanceRespect": { en: "Be fair, honest, and respectful. Do not include private personal info.", bn: "সৎ, ন্যায়সঙ্গত ও মার্জিত থাকুন। ব্যক্তিগত গোপনীয় তথ্য দেবেন না।" },
  "review.titleLabel": { en: "Review title", bn: "রিভিউ শিরোনাম" },
  "review.bodyLabel": { en: "Describe your firsthand experience", bn: "আপনার বাস্তব অভিজ্ঞান বর্ণনা করুন" },
  "review.bodyHelp": {
    en: "Focus on how people were treated. Avoid naming private individuals or making unproven allegations presented as fact.",
    bn: "মানুষকে কীভাবে আচরণ করা হয়েছিল সেদিকে মনোযোগ দিন। ব্যক্তিগত নাম বা প্রমাণহীন অভিযোগ তথ্য হিসেবে উপস্থাপন এড়িয়ে চলুন।",
  },
  "review.displayNameLabel": { en: "Public display name", bn: "প্রকাশ্য প্রদর্শন নাম" },
  "review.displayNameHelp": { en: "A pseudonym is fine. Your email is never shown publicly.", bn: "ছদ্মনাম ব্যবহার করতে পারেন। আপনার ইমেইল কখনো প্রকাশ্যে দেখানো হয় না।" },
  "review.notObserved": { en: "Not observed / N/A", bn: "দেখিনি / প্রযোজ্য নয়" },
  "review.rulesTitle": { en: "Community guidelines & confirmation", bn: "কমিউনিটি নির্দেশিকা ও নিশ্চয়তা" },
  "review.agree": { en: "I confirm this is my genuine firsthand experience and I agree to the community guidelines.", bn: "আমি নিশ্চিত করছি এটি আমার প্রকৃত বাস্তব অভিজ্ঞান এবং আমি কমিউনিটি নির্দেশিকা মেনে নিচ্ছি।" },
  "review.progress": { en: "Stage", bn: "পর্যায়" },
  "review.questionsAnswered": { en: "questions answered", bn: "প্রশ্নের উত্তর দেওয়া হয়েছে" },
  "review.needMore": {
    en: "Please rate a few more parameters so we can calculate a trustworthy culture score.",
    bn: "একটি নির্ভরযোগ্য কালচার স্কোর হিসাব করার জন্য অনুগ্রহ করে আরও কয়েকটি বিষয় রেট করুন।",
  },
  "review.submitted": { en: "Thank you for sharing your experience. Your review has been submitted for moderation.", bn: "আপনার অভিজ্ঞতা ভাগ করে নেওয়ার জন্য ধন্যবাদ। আপনার রিভিউ মডারেশনের জন্য জমা দেওয়া হয়েছে।" },
  "review.draftSaved": { en: "Draft saved in this session.", bn: "এই সেশনে খসড়া সংরক্ষিত।" },
  "review.selectOrg": { en: "Select an organization to continue.", bn: "চালিয়ে যেতে একটি প্রতিষ্ঠান নির্বাচন করুন।" },
  "review.current": { en: "Current", bn: "বর্তমান" },
  "review.former": { en: "Former", bn: "সাবেক" },
  "review.periodPreset": { en: "e.g. 2022–2024 or Last 6 months", bn: "যেমন ২০২২–২০২৪ বা বিগত ৬ মাস" },
  "review.summaryTitle": { en: "Review summary", bn: "রিভিউ সারসংক্ষেপ" },
  "review.changeSettings": { en: "Change", bn: "পরিবর্তন" },
  "review.calculatedScore": { en: "Estimated culture score", bn: "সম্ভাব্য কালচার স্কোর" },
  "review.reviewsComingSoon": { en: "Reviews coming soon", bn: "রিভিউ শীঘ্রই আসছে" },
  "review.reviewsComingSoonDesc": {
    en: "We are currently preparing specialized evaluation templates for this category.",
    bn: "আমরা বর্তমানে এই ক্যাটাগরির জন্য বিশেষায়িত মূল্যায়ন প্রশ্নমালা প্রস্তুত করছি।",
  },
  "review.backToOrg": { en: "Back to organization profile", bn: "প্রতিষ্ঠান প্রোফাইলে ফিরে যান" },

  // Auth
  "auth.loginTitle": { en: "Sign in to CultureFirst", bn: "কালচারফার্স্টে সাইন ইন করুন" },
  "auth.loginOnly": {
    en: "Accounts are created by platform administrators. If you need access, please contact the CultureFirst team.",
    bn: "অ্যাকাউন্ট প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর তৈরি করেন। আপনার অ্যাক্সেস প্রয়োজন হলে কালচারফার্স্ট টিমের সাথে যোগাযোগ করুন।",
  },
  "admin.suggestions": { en: "Suggestions", bn: "প্রস্তাবনা" },
  "auth.signupTitle": { en: "Create your account", bn: "আপনার অ্যাকাউন্ট খুলুন" },
  "auth.email": { en: "Email", bn: "ইমেইল" },
  "auth.password": { en: "Password", bn: "পাসওয়ার্ড" },
  "auth.withGoogle": { en: "Continue with Google", bn: "গুগল দিয়ে চালিয়ে যান" },
  "auth.noAccount": { en: "Don't have an account?", bn: "অ্যাকাউন্ট নেই?" },
  "auth.haveAccount": { en: "Already have an account?", bn: "আগে থেকেই অ্যাকাউন্ট আছে?" },
  "auth.forgot": { en: "Forgot password?", bn: "পাসওয়ার্ড ভুলে গেছেন?" },
  "auth.signupDisabledHelp": {
    en: "Production email verification and recovery require a configured SMTP provider in Supabase.",
    bn: "প্রোডাকশনে ইমেইল যাচাই ও রিকভারির জন্য Supabase-এ SMTP কনফিগার করা আবশ্যক।",
  },

  // Dashboard
  "dashboard.title": { en: "Your dashboard", bn: "আপনার ড্যাশবোর্ড" },
  "dashboard.myReviews": { en: "My reviews", bn: "আমার রিভিউ" },
  "dashboard.noReviews": { en: "You haven't submitted any reviews yet.", bn: "আপনি এখনো কোনো রিভিউ জমা দেননি।" },
  "dashboard.withdraw": { en: "Withdraw", bn: "প্রত্যাহার" },
  "dashboard.appeal": { en: "Appeal", bn: "আপিল" },
  "dashboard.edit": { en: "Edit & resubmit", bn: "সম্পাদনা ও পুনঃজমা" },
  "dashboard.privacy": { en: "Privacy settings", bn: "গোপনীয়তা সেটিংস" },
  "dashboard.deleteAccount": { en: "Request account deletion", bn: "অ্যাকাউন্ট মুছে ফেলার অনুরোধ" },
  "dashboard.saved": { en: "Saved organizations", bn: "সংরক্ষিত প্রতিষ্ঠান" },

  // Admin
  "admin.title": { en: "Administration", bn: "প্রশাসন" },
  "admin.dashboard": { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  "admin.organizations": { en: "Organizations", bn: "প্রতিষ্ঠান" },
  "admin.categories": { en: "Categories", bn: "ক্যাটাগরি" },
  "admin.templates": { en: "Rating templates", bn: "রেটিং টেমপ্লেট" },
  "admin.moderation": { en: "Review moderation", bn: "রিভিউ মডারেশন" },
  "admin.claims": { en: "Organization claims", bn: "প্রতিষ্ঠান দাবি" },
  "admin.settings": { en: "Platform settings", bn: "প্ল্যাটফর্ম সেটিংস" },
  "admin.totalOrgs": { en: "Total organizations", bn: "মোট প্রতিষ্ঠান" },
  "admin.totalReviews": { en: "Eligible reviews", bn: "যোগ্য রিভিউ" },
  "admin.pending": { en: "Pending reviews", bn: "অপেক্ষমাণ রিভিউ" },
  "admin.flagged": { en: "Flagged content", bn: "ফ্ল্যাগড কনটেন্ট" },
  "admin.approve": { en: "Approve", bn: "অনুমোদন" },
  "admin.reject": { en: "Reject", bn: "প্রত্যাখ্যান" },
  "admin.return": { en: "Return for edit", bn: "সম্পাদনার জন্য ফেরত" },
  "admin.reason": { en: "Reason", bn: "কারণ" },
  "admin.audit": { en: "Audit trail", bn: "অডিট ট্রেইল" },
  "admin.publishVersion": { en: "Publish version", bn: "সংস্করণ প্রকাশ" },
  "admin.createTemplate": { en: "Create template", bn: "টেমপ্লেট তৈরি" },
  "admin.preview": { en: "Preview", bn: "প্রিভিউ" },
  "admin.validateWeights": { en: "Validate weights", bn: "ওয়েট যাচাই" },
  "admin.weightsOk": { en: "Weights total 100%.", bn: "ওয়েট মোট ১০০%।" },
  "admin.weightsBad": { en: "Weights must total 100% before publishing.", bn: "প্রকাশের আগে ওয়েট মোট ১০০% হতে হবে।" },
  "admin.accessDenied": { en: "You do not have permission to view this.", bn: "এই অংশ দেখার অনুমতি আপনার নেই।" },
  "admin.messages": { en: "Messages & corrections", bn: "বার্তা ও সংশোধন" },

  // Statuses
  "status.draft": { en: "Draft", bn: "খসড়া" },
  "status.pending": { en: "Pending", bn: "অপেক্ষমাণ" },
  "status.published": { en: "Published", bn: "প্রকাশিত" },
  "status.rejected": { en: "Rejected", bn: "প্রত্যাখ্যাত" },
  "status.withdrawn": { en: "Withdrawn", bn: "প্রত্যাহৃত" },
  "status.flagged": { en: "Flagged", bn: "ফ্ল্যাগড" },
  "status.under_appeal": { en: "Under appeal", bn: "আপিলাধীন" },

  // Contact
  "contact.title": { en: "Contact us", bn: "যোগাযোগ করুন" },
  "contact.intro": {
    en: "Questions, corrections, missing websites, privacy or legal requests — send us a message and a person will review it.",
    bn: "প্রশ্ন, সংশোধন, অনুপস্থিত ওয়েবসাইট, গোপনীয়তা বা আইনগত অনুরোধ — একটি বার্তা পাঠান, একজন ব্যক্তি তা পর্যালোচনা করবেন।",
  },
  "contact.name": { en: "Your name", bn: "আপনার নাম" },
  "contact.email": { en: "Email address", bn: "ইমেইল ঠিকানা" },
  "contact.topic": { en: "What is this about?", bn: "বিষয়টি কী সম্পর্কে?" },
  "contact.subject": { en: "Subject (optional)", bn: "বিষয় (ঐচ্ছিক)" },
  "contact.message": { en: "Message", bn: "বার্তা" },
  "contact.aboutOrg": { en: "Regarding", bn: "সম্পর্কিত" },
  "contact.orgHelp": {
    en: "Type the organization name exactly as listed so we can find it.",
    bn: "তালিকায় থাকা নাম হুবহু লিখুন যাতে আমরা খুঁজে পাই।",
  },
  "contact.submit": { en: "Send message", bn: "বার্তা পাঠান" },
  "contact.sending": { en: "Sending…", bn: "পাঠানো হচ্ছে…" },
  "contact.success": { en: "Thank you — your message has been received.", bn: "ধন্যবাদ — আপনার বার্তা পাওয়া গেছে।" },
  "contact.successBody": {
    en: "Our team reviews every message. We may follow up at the email address you provided.",
    bn: "আমাদের দল প্রতিটি বার্তা পর্যালোচনা করে। আপনার দেওয়া ইমেইলে আমরা যোগাযোগ করতে পারি।",
  },
  "contact.topic.general": { en: "General question", bn: "সাধারণ প্রশ্ন" },
  "contact.topic.incorrect-info": { en: "Report incorrect information", bn: "ভুল তথ্য জানান" },
  "contact.topic.missing-website": { en: "Suggest an official website", bn: "অফিসিয়াল ওয়েবসাইট প্রস্তাব করুন" },
  "contact.topic.claim": { en: "Organization claim", bn: "প্রতিষ্ঠান দাবি" },
  "contact.topic.privacy": { en: "Privacy request", bn: "গোপনীয়তা অনুরোধ" },
  "contact.topic.legal": { en: "Legal request", bn: "আইনগত অনুরোধ" },
  "contact.topic.bug": { en: "Report a website problem", bn: "ওয়েবসাইট সমস্যা জানান" },
  "contact.topic.other": { en: "Something else", bn: "অন্য কিছু" },

  // Validation
  "validation.required": { en: "This field is required.", bn: "এই ঘরটি আবশ্যক।" },
  "validation.min": { en: "Please write at least {n} characters.", bn: "কমপক্ষে {n} অক্ষর লিখুন।" },
  "validation.email": { en: "Enter a valid email address.", bn: "বৈধ ইমেইল লিখুন।" },
  "validation.agree": { en: "You must confirm the community rules.", bn: "কমিউনিটি নিয়ম নিশ্চিত করতে হবে।" },

  // Footer
  "footer.tagline": { en: "Independent organizational culture reviews for Bangladesh.", bn: "বাংলাদেশের জন্য স্বাধীন সাংগঠনিক সংস্কৃতি রিভিউ।" },
  "footer.platform": { en: "Platform", bn: "প্ল্যাটফর্ম" },
  "footer.company": { en: "Company", bn: "প্রতিষ্ঠান" },
  "footer.legal": { en: "Legal", bn: "আইনগত" },
  "footer.privacy": { en: "Privacy", bn: "গোপনীয়তা" },
  "footer.terms": { en: "Terms", bn: "শর্তাবলি" },
  "footer.guidelines": { en: "Community guidelines", bn: "কমিউনিটি নির্দেশিকা" },
  "footer.rights": { en: "All rights reserved.", bn: "সর্বস্বত্ব সংরক্ষিত।" },
};

export function translate(key: string, locale: Locale, vars?: Record<string, string | number>): string {
  const entry = dictionary[key];
  let text = entry ? entry[locale] : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}
