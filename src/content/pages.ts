import type { Bilingual } from "@/types/domain";

export interface PageSection {
  heading: Bilingual;
  body: Bilingual[];
  legal?: boolean;
}

export interface StaticPageContent {
  title: Bilingual;
  intro: Bilingual;
  sections: PageSection[];
}

export const staticPages: Record<string, StaticPageContent> = {
  about: {
    title: { en: "About CultureFirst", bn: "কালচারফার্স্ট সম্পর্কে" },
    intro: {
      en: "CultureFirst is an independent platform for understanding how organizations in Bangladesh treat people. We measure organizational culture, not commercial service quality.",
      bn: "কালচারফার্স্ট বাংলাদেশের প্রতিষ্ঠানগুলো কীভাবে মানুষকে আচরণ করে তা বোঝার একটি স্বাধীন প্ল্যাটফর্ম। আমরা সাংগঠনিক সংস্কৃতি মাপি, বাণিজ্যিক সেবার গুণমান নয়।",
    },
    sections: [
      {
        heading: { en: "Why we exist", bn: "আমরা কেন আছি" },
        body: [
          {
            en: "Institutional reputation and lived experience are not the same thing. A hospital can have excellent doctors yet a reception desk that treats people with disrespect. A company can pay well yet punish anyone who speaks up. CultureFirst helps people see that difference before they choose where to work, study, seek care or entrust their affairs.",
            bn: "প্রাতিষ্ঠানিক সুনাম আর বাস্তব অভিজ্ঞান এক নয়। একটি হাসপাতালে দক্ষ চিকিৎসক থাকতে পারে, অথচ রিসেপশনে অসম্মানজনক আচরণ হতে পারে। কালচারফার্স্ট মানুষকে সিদ্ধান্ত নেওয়ার আগে এই পার্থক্য দেখতে সাহায্য করে।",
          },
        ],
      },
      {
        heading: { en: "Our values", bn: "আমাদের মূল্যবোধ" },
        body: [
          {
            en: "Respect for people. Fairness. Transparency. Accountability. Privacy. Review authenticity. Organizational improvement. Independence from commercial influence. Positive reviews matter as much as negative ones — this is not a complaint-only platform.",
            bn: "মানুষের প্রতি সম্মান। ন্যায্যতা। স্বচ্ছতা। জবাবদিহিতা। গোপনীয়তা। রিভিউয়ের সত্যতা। সাংগঠনিক উন্নতি। বাণিজ্যিক প্রভাব থেকে স্বাধীনতা। ইতিবাচক রিভিউ নেতিবাচক রিভিউয়ের সমান গুরুত্বপূর্ণ — এটি শুধু অভিযোগের প্ল্যাটফর্ম নয়।",
          },
        ],
      },
      {
        heading: { en: "The name", bn: "নামটি" },
        body: [
          {
            en: "“CultureFirst” is a working brand name. It is implemented through centralised configuration and can be changed without rebuilding the platform.",
            bn: "“কালচারফার্স্ট” একটি কার্যকরী নাম। এটি কেন্দ্রীয় কনফিগারেশনের মাধ্যমে প্রয়োগ করা হয়েছে এবং প্ল্যাটফর্ম পুনর্নির্মাণ ছাড়াই পরিবর্তন করা যায়।",
          },
        ],
      },
    ],
  },

  "how-it-works": {
    title: { en: "How it works", bn: "যেভাবে কাজ করে" },
    intro: {
      en: "CultureFirst keeps every perspective separate. The questions you answer depend on the type of organization and your relationship to it.",
      bn: "কালচারফার্স্ট প্রতিটি দৃষ্টিভঙ্গি আলাদা রাখে। আপনি কী প্রশ্নের উত্তর দেবেন তা নির্ভর করে প্রতিষ্ঠানের ধরন ও আপনার সম্পর্কের উপর।",
    },
    sections: [
      {
        heading: { en: "1. Browse freely", bn: "১. অবাধে দেখুন" },
        body: [
          {
            en: "Anyone can read approved reviews without signing in. Search by name (English or Bangla), category, location or reviewer perspective.",
            bn: "সাইন ইন ছাড়াই যে কেউ অনুমোদিত রিভিউ পড়তে পারেন। নাম, ক্যাটাগরি, স্থান বা দৃষ্টিভঙ্গি দিয়ে খুঁজুন।",
          },
        ],
      },
      {
        heading: { en: "2. A questionnaire suited to you", bn: "২. আপনার উপযোগী প্রশ্নমালা" },
        body: [
          {
            en: "When you write a review, we first ask your relationship to the organization. A patient and an employee reviewing the same hospital receive different parameters, because they experience different systems.",
            bn: "রিভিউ লেখার সময় আমরা প্রথমে আপনার সম্পর্ক জানি। একই হাসপাতালের রোগী ও কর্মী ভিন্ন প্যারামিটার পান, কারণ তাদের অভিজ্ঞান ভিন্ন।",
          },
        ],
      },
      {
        heading: { en: "3. Rate and describe", bn: "৩. রেট করুন ও বর্ণনা করুন" },
        body: [
          {
            en: "Rate each parameter on a 1–5 scale, or choose “Not observed” for anything you did not directly experience. Then describe your firsthand experience in your own words.",
            bn: "প্রতিটি প্যারামিটার ১–৫ স্কেলে রেট করুন, অথবা সরাসরি অনুভব না করলে “দেখিনি” নির্বাচন করুন। এরপর নিজের ভাষায় অভিজ্ঞান বর্ণনা করুন।",
          },
        ],
      },
      {
        heading: { en: "4. Moderation", bn: "৪. মডারেশন" },
        body: [
          {
            en: "Every review enters a pending state. A human moderator checks it against our community guidelines before it becomes public. Only approved, eligible reviews affect scores.",
            bn: "প্রতিটি রিভিউ অপেক্ষমাণ অবস্থায় প্রবেশ করে। প্রকাশের আগে একজন মানব মডারেটর কমিউনিটি নির্দেশিকা অনুযায়ী যাচাই করেন। শুধু অনুমোদিত, যোগ্য রিভিউ স্কোরে প্রভাব ফেলে।",
          },
        ],
      },
    ],
  },

  methodology: {
    title: { en: "Rating methodology", bn: "রেটিং পদ্ধতি" },
    intro: {
      en: "This section explains exactly how CultureFirst turns reviews into scores. Our weights are proposed starting values and are configurable — they are not presented as scientifically validated.",
      bn: "এই অংশে ব্যাখ্যা করা হয়েছে কালচারফার্স্ট কীভাবে রিভিউ থেকে স্কোর তৈরি করে। ওজনগুলো প্রস্তাবিত প্রারম্ভিক মান এবং কনফিগারযোগ্য — বৈজ্ঞানিকভাবে যাচাইকৃত হিসেবে উপস্থাপন করা হয় না।",
    },
    sections: [
      {
        heading: { en: "Individual review score", bn: "একটি রিভিউয়ের স্কোর" },
        body: [
          {
            en: "Review score = the sum of (rating × parameter weight) divided by the sum of the weights of the parameters that were answered. Parameters marked “Not observed / Not applicable” are excluded from both the numerator and the denominator, so no one is forced to rate something they did not experience.",
            bn: "রিভিউ স্কোর = (রেটিং × প্যারামিটার ওজন)-এর সমষ্টি ÷ উত্তর দেওয়া প্যারামিটারগুলোর ওজনের সমষ্টি। “দেখিনি / প্রযোজ্য নয়” চিহ্নিত প্যারামিটার লব ও হর উভয় থেকে বাদ যায়।",
          },
        ],
      },
      {
        heading: { en: "Minimum data to produce a score", bn: "স্কোর তৈরির ন্যূনতম তথ্য" },
        body: [
          {
            en: "A score is only calculated when a minimum number of parameters are answered and a minimum proportion of the template's total weight is covered. These thresholds are configurable by administrators.",
            bn: "একটি স্কোর শুধু তখনই হিসাব হয় যখন ন্যূনতম সংখ্যক প্যারামিটার উত্তর দেওয়া হয় এবং টেমপ্লেটের মোট ওজনের ন্যূনতম অনুপাত পূরণ হয়। এই সীমা অ্যাডমিন কনফিগার করতে পারেন।",
          },
        ],
      },
      {
        heading: { en: "Aggregate scores and sample size", bn: "সমষ্টিগত স্কোর ও নমুনার আকার" },
        body: [
          {
            en: "Reviews are grouped by organization, branch, category, reviewer cohort and the exact template version used. We never combine unrelated perspectives such as patients and employees into one number. Small samples show a disclosure instead of a reliable-looking score.",
            bn: "রিভিউগুলো প্রতিষ্ঠান, শাখা, ক্যাটাগরি, রিভিউয়ার কোহোর্ট এবং ব্যবহৃত সঠিক টেমপ্লেট সংস্করণ অনুযায়ী দলবদ্ধ করা হয়। রোগী ও কর্মীদের মতো অসম্পর্কিত দৃষ্টিভঙ্গি কখনো একত্র করা হয় না।",
          },
        ],
      },
      {
        heading: { en: "Template versioning", bn: "টেমপ্লেট সংস্করণ" },
        body: [
          {
            en: "Published template versions are immutable. Every review references the exact version used at submission, so historical scores do not change silently when a questionnaire is updated.",
            bn: "প্রকাশিত টেমপ্লেট সংস্করণ অপরিবর্তনীয়। প্রতিটি রিভিউ জমার সময় ব্যবহৃত সঠিক সংস্করণ উল্লেখ করে, ফলে প্রশ্নমালা আপডেট হলেও ঐতিহাসিক স্কোর নীরবে পরিবর্তিত হয় না।",
          },
        ],
      },
      {
        heading: { en: "Google reviews", bn: "গুগল রিভিউ" },
        body: [
          {
            en: "Google ratings are displayed only as an external link to confirmed Google Maps pages. They are never scraped and never combined with CultureFirst culture scores.",
            bn: "গুগল রেটিং শুধু নিশ্চিত গুগল ম্যাপ পেজের বাহ্যিক লিংক হিসেবে দেখানো হয়। কখনো স্ক্র্যাপ করা হয় না এবং কালচারফার্স্ট স্কোরের সাথে একত্র করা হয় না।",
          },
        ],
      },
    ],
  },

  privacy: {
    title: { en: "Privacy", bn: "গোপনীয়তা" },
    intro: {
      en: "Privacy is a launch requirement, not a feature. This draft describes our data practices and must be reviewed against applicable Bangladeshi law before public launch.",
      bn: "গোপনীয়তা একটি চালু শর্ত, বৈশিষ্ট্য নয়। এই খসড়াটি আমাদের ডেটা প্রক্রিয়া বর্ণনা করে এবং প্রকাশের আগে প্রযোজ্য বাংলাদেশি আইনের সাথে যাচাই করা আবশ্যক।",
    },
    sections: [
      {
        heading: { en: "What we collect", bn: "আমরা কী সংগ্রহ করি" },
        body: [
          {
            en: "To submit a review you need an account (email or Google sign-in). Public visitors can read reviews without an account. We store the review text, your ratings, your chosen reviewer relationship and an approximate experience period.",
            bn: "রিভিউ জমা দিতে একটি অ্যাকাউন্ট প্রয়োজন। পাবলিক ভিজিটররা অ্যাকাউন্ট ছাড়াই রিভিউ পড়তে পারেন। আমরা রিভিউ টেক্সট, রেটিং, সম্পর্ক ও আনুমানিক সময়কাল সংরক্ষণ করি।",
          },
        ],
      },
      {
        heading: { en: "What we never show publicly", bn: "যা কখনো প্রকাশ্যে দেখানো হয় না" },
        body: [
          {
            en: "Your email address, account identity, IP address or any unnecessary personal identifiers are never shown publicly. Reviews may be published under a pseudonym of your choice.",
            bn: "আপনার ইমেইল, পরিচয়, আইপি বা অপ্রয়োজনীয় ব্যক্তিগত পরিচয় কখনো প্রকাশ্যে দেখানো হয় না। আপনি ছদ্মনামে রিভিউ প্রকাশ করতে পারেন।",
          },
        ],
      },
      {
        heading: { en: "Data retention and deletion", bn: "ডেটা সংরক্ষণ ও মুছে ফেলা" },
        body: [
          {
            en: "You may request account deletion from your dashboard. We retain only what is necessary for legal compliance, dispute resolution and the integrity of published aggregates.",
            bn: "আপনার ড্যাশবোর্ড থেকে অ্যাকাউন্ট মুছে ফেলার অনুরোধ করতে পারেন। আইনি সম্মতি, বিরোধ নিষ্পত্তি ও প্রকাশিত সমষ্টির অখণ্ডতার জন্য প্রয়োজনীয়টুকুই সংরক্ষণ করি।",
          },
        ],
        legal: true,
      },
      {
        heading: { en: "Sensitive evidence", bn: "সংবেদনশীল প্রমাণ" },
        body: [
          {
            en: "The first release deliberately does not collect NID numbers, employment documents, student IDs or medical records. We do not label reviews as relationship-verified unless a real private verification process has been completed — the architecture can support this later.",
            bn: "প্রথম সংস্করণে সচেতনভাবেই এনআইডি, চাকরির কাগজ, শিক্ষার্থী আইডি বা চিকিৎসা রেকর্ড সংগ্রহ করা হয় না। প্রকৃত যাচাই প্রক্রিয়া ছাড়া রিভিউকে “সম্পর্ক-যাচাইকৃত” বলা হয় না।",
          },
        ],
      },
      {
        heading: { en: "Required legal review", bn: "আবশ্যক আইনি পর্যালোচনা" },
        body: [
          {
            en: "DEFAMATION, DATA PROTECTION, ALLEGATIONS AGAINST IDENTIFIABLE INDIVIDUALS AND CONTENT TAKEDOWN PROCEDURES MUST BE REVIEWED BY QUALIFIED LEGAL COUNSEL FOR BANGLADESH BEFORE PUBLIC LAUNCH. This text is a draft, not legal advice.",
            bn: "মানহানি, ডেটা সুরক্ষা, শনাক্তযোগ্য ব্যক্তির বিরুদ্ধে অভিযোগ এবং কনটেন্ট অপসারণ প্রক্রিয়া প্রকাশের আগে বাংলাদেশের যোগ্য আইনজীবী দ্বারা পর্যালোচনা করা আবশ্যক। এই লেখা একটি খসড়া, আইনি পরামর্শ নয়।",
          },
        ],
        legal: true,
      },
    ],
  },

  terms: {
    title: { en: "Terms of use", bn: "ব্যবহারের শর্তাবলি" },
    intro: {
      en: "By using CultureFirst you agree to these draft terms. They require legal review before launch.",
      bn: "কালচারফার্স্ট ব্যবহার করে আপনি এই খসড়া শর্তাবলিতে সম্মত হন। প্রকাশের আগে আইনি পর্যালোচনা প্রয়োজন।",
    },
    sections: [
      {
        heading: { en: "Acceptable use", bn: "গ্রহণযোগ্য ব্যবহার" },
        body: [
          {
            en: "Write only about your own firsthand experience. Do not post threats, targeted harassment, doxxing or unproven allegations presented as facts. Do not attempt to identify anonymous reviewers or manipulate scores.",
            bn: "শুধু নিজের বাস্তব অভিজ্ঞান লিখুন। হুমকি, লক্ষ্যবস্তু হয়রানি, ডক্সিং বা তথ্য হিসেবে প্রমাণহীন অভিযোগ পোস্ট করবেন না।",
          },
        ],
      },
      {
        heading: { en: "Moderation and removal", bn: "মডারেশন ও অপসারণ" },
        body: [
          {
            en: "We moderate reviews against our community guidelines. Legitimate criticism is not removed merely because an organization disputes it. Content may be temporarily hidden where there is a credible safety concern.",
            bn: "আমরা কমিউনিটি নির্দেশিকা অনুযায়ী রিভিউ মডারেট করি। শুধু প্রতিষ্ঠান বিরোধিতা করলেই বৈধ সমালোচনা সরানো হয় না।",
          },
        ],
        legal: true,
      },
      {
        heading: { en: "No warranty on scores", bn: "স্কোরের কোনো নিশ্চয়তা নেই" },
        body: [
          {
            en: "Scores reflect submitted and moderated reviews. They are informational and are not professional advice or a definitive judgment about any organization.",
            bn: "স্কোর জমা ও মডারেট করা রিভিউ প্রতিফলিত করে। এগুলো তথ্যগত এবং কোনো প্রতিষ্ঠান সম্পর্কে পেশাদার পরামর্শ বা চূড়ান্ত রায় নয়।",
          },
        ],
        legal: true,
      },
    ],
  },

  "community-guidelines": {
    title: { en: "Community guidelines", bn: "কমিউনিটি নির্দেশিকা" },
    intro: {
      en: "These guidelines keep CultureFirst fair, safe and useful for everyone.",
      bn: "এই নির্দেশিকাগুলো কালচারফার্স্টকে সবার জন্য ন্যায্য, নিরাপদ ও উপযোগী রাখে।",
    },
    sections: [
      {
        heading: { en: "Do", bn: "করুন" },
        body: [
          {
            en: "Describe specific behaviour and how it affected you. Include context such as role and approximate timeframe. Share positive experiences too — good culture deserves recognition.",
            bn: "নির্দিষ্ট আচরণ ও তা আপনাকে কীভাবে প্রভাবিত করেছে বর্ণনা করুন। ভূমিকা ও আনুমানিক সময়কাল উল্লেখ করুন। ইতিবাচক অভিজ্ঞতাও শেয়ার করুন।",
          },
        ],
      },
      {
        heading: { en: "Do not", bn: "করবেন না" },
        body: [
          {
            en: "Do not name private individuals unnecessarily. Do not post threats, harassment, discriminatory abuse or deliberately false information. Do not publish others' personal data.",
            bn: "অপ্রয়োজনে ব্যক্তিগত নাম উল্লেখ করবেন না। হুমকি, হয়রানি, বৈষম্যমূলক অপব্যবহার বা ইচ্ছাকৃত মিথ্যা তথ্য পোস্ট করবেন না।",
          },
        ],
      },
      {
        heading: { en: "Reporting and appeals", bn: "রিপোর্ট ও আপিল" },
        body: [
          {
            en: "Anyone can report a review. If your review is rejected, you can appeal from your dashboard and a moderator will review the decision.",
            bn: "যে কেউ একটি রিভিউ রিপোর্ট করতে পারেন। আপনার রিভিউ প্রত্যাখ্যাত হলে ড্যাশবোর্ড থেকে আপিল করতে পারেন।",
          },
        ],
      },
    ],
  },

  contact: {
    title: { en: "Contact", bn: "যোগাযোগ" },
    intro: {
      en: "Questions, corrections, claim requests or press enquiries — reach the CultureFirst team.",
      bn: "প্রশ্ন, সংশোধন, দাবির অনুরোধ বা প্রেস অনুসন্ধান — কালচারফার্স্ট টিমের সাথে যোগাযোগ করুন।",
    },
    sections: [
      {
        heading: { en: "General and corrections", bn: "সাধারণ ও সংশোধন" },
        body: [
          {
            en: "Use the form above for directory corrections — include the organization name and the specific information that needs attention. For organization claims, use the claim process on the organization profile.",
            bn: "ডিরেক্টরি সংশোধনের জন্য উপরের ফর্মটি ব্যবহার করুন — প্রতিষ্ঠানের নাম ও সংশোধনযোগ্য তথ্য উল্লেখ করুন। প্রতিষ্ঠান দাবির জন্য প্রোফাইলে দাবি প্রক্রিয়া ব্যবহার করুন।",
          },
        ],
      },
      {
        heading: { en: "Safety and legal", bn: "নিরাপত্তা ও আইনগত" },
        body: [
          {
            en: "Report credible safety concerns or legal notices using the form above and choose the relevant topic. Messages are reviewed by the team; a monitored production inbox must be configured before public launch.",
            bn: "বিশ্বাসযোগ্য নিরাপত্তা উদ্বেগ বা আইনি নোটিশ উপরের ফর্মটি দিয়ে জানান এবং সংশ্লিষ্ট বিষয় নির্বাচন করুন। বার্তা টিম পর্যালোচনা করে; প্রকাশের আগে একটি মনিটর করা প্রোডাকশন ইনবক্স কনফিগার করতে হবে।",
          },
        ],
        legal: true,
      },
    ],
  },
};
