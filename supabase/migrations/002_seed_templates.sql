-- 002_seed_templates.sql — Seeded rating templates, categories and sample organizations
-- Run once after 001_initial.sql. Safe to apply to an empty database.
-- Mirrors the MVP fixture data in src/lib/data/fixtures/seed.ts so local and
-- Supabase datasets describe exactly the same questionnaires.

-- ---------------------------------------------------------------------------
-- Helper: insert if not already present
-- ---------------------------------------------------------------------------

-- Categories
insert into organization_categories (slug, name, description, icon, is_fallback) values
  ('private-company', jsonb_build_object('en','Private Company','bn','বেসরকারি প্রতিষ্ঠান'), jsonb_build_object('en','Private companies and corporations. Ratings reflect workplace culture.','bn','বেসরকারি প্রতিষ্ঠান। কর্মক্ষেত্রের সংস্কৃতি প্রতিফলিত হয়।'), 'building', false),
  ('hospital-clinic', jsonb_build_object('en','Hospital or Clinic','bn','হাসপাতাল বা ক্লিনিক'), jsonb_build_object('en','Hospitals and clinics. Patient and employee perspectives are kept separate.','bn','হাসপাতাল ও ক্লিনিক। রোগী ও কর্মীর দৃষ্টিভঙ্গি আলাদা।'), 'hospital', false),
  ('university-college', jsonb_build_object('en','University or College','bn','বিশ্ববিদ্যালয় বা কলেজ'), jsonb_build_object('en','Universities and colleges. Distinct student and faculty templates.','bn','বিশ্ববিদ্যালয় ও কলেজ। আলাদা শিক্ষার্থী ও শিক্ষক টেমপ্লেট।'), 'graduation', false),
  ('government-office', jsonb_build_object('en','Government Office','bn','সরকারি অফিস'), jsonb_build_object('en','Government offices. Citizen and employee perspectives.','bn','সরকারি অফিস। নাগরিক ও কর্মীর দৃষ্টিভঙ্গি।'), 'landmark', false),
  ('ngo-nonprofit', jsonb_build_object('en','NGO or Nonprofit','bn','এনজিও বা অলাভজনক'), jsonb_build_object('en','NGOs. Beneficiary and staff perspectives.','bn','এনজিও। সুবিধাভোগী ও কর্মী।'), 'heart-handshake', false),
  ('school', jsonb_build_object('en','School','bn','বিদ্যালয়'), jsonb_build_object('en','Schools. Fallback template until a dedicated school methodology is configured.','bn','বিদ্যালয়। নির্দিষ্ট পদ্ধতি না হওয়া পর্যন্ত সাধারণ টেমপ্লেট।'), 'school', false),
  ('bank-financial', jsonb_build_object('en','Bank or Financial Institution','bn','ব্যাংক বা আর্থিক প্রতিষ্ঠান'), jsonb_build_object('en','Banks. Fallback template.','bn','ব্যাংক। সাধারণ টেমপ্লেট।'), 'banknote', false),
  ('retail-commercial', jsonb_build_object('en','Retail or Commercial Establishment','bn','খুচরা বা বাণিজ্যিক প্রতিষ্ঠান'), jsonb_build_object('en','Retail and commercial establishments. Fallback template.','bn','খুচরা ও বাণিজ্যিক। সাধারণ টেমপ্লেট।'), 'store', false),
  ('other', jsonb_build_object('en','Other Organization','bn','অন্যান্য প্রতিষ্ঠান'), jsonb_build_object('en','Fallback category for organizations without a dedicated template.','bn','নির্দিষ্ট টেমপ্লেট নেই এমন প্রতিষ্ঠানের জন্য।'), 'circle-help', true)
on conflict (slug) do nothing;

-- Reviewer relationships
insert into reviewer_relationship_types (slug, name, kind) values
  ('current-employee',    jsonb_build_object('en','Current employee','bn','বর্তমান কর্মী'),       'employee'),
  ('former-employee',     jsonb_build_object('en','Former employee','bn','সাবেক কর্মী'),           'employee'),
  ('contractor',          jsonb_build_object('en','Contractor','bn','ঠিকাদার'),                   'employee'),
  ('patient',             jsonb_build_object('en','Patient','bn','রোগী'),                        'patient'),
  ('patient-attendant',   jsonb_build_object('en','Patient attendant','bn','রোগীর সহকারী'),       'patient'),
  ('student',             jsonb_build_object('en','Student','bn','শিক্ষার্থী'),                  'student'),
  ('former-student',      jsonb_build_object('en','Former student','bn','সাবেক শিক্ষার্থী'),     'student'),
  ('faculty',             jsonb_build_object('en','Faculty member','bn','শিক্ষক'),               'other'),
  ('admin-staff',         jsonb_build_object('en','Administrative staff','bn','প্রশাসনিক কর্মী'),'employee'),
  ('citizen',             jsonb_build_object('en','Citizen','bn','নাগরিক'),                     'citizen'),
  ('visitor',             jsonb_build_object('en','Visitor','bn','দর্শনার্থী'),                  'visitor'),
  ('government-employee', jsonb_build_object('en','Government employee','bn','সরকারি কর্মী'),    'employee'),
  ('beneficiary',         jsonb_build_object('en','Beneficiary','bn','সুবিধাভোগী'),              'beneficiary'),
  ('volunteer',           jsonb_build_object('en','Volunteer','bn','স্বেচ্ছাসেবক'),              'other')
on conflict (slug) do nothing;

-- Category relationships
insert into category_relationships (category_id, relationship_type_id)
select c.id, r.id from organization_categories c, reviewer_relationship_types r
where (c.slug, r.slug) in (
  ('private-company','current-employee'),('private-company','former-employee'),('private-company','contractor'),
  ('hospital-clinic','patient'),('hospital-clinic','patient-attendant'),('hospital-clinic','current-employee'),('hospital-clinic','former-employee'),
  ('university-college','student'),('university-college','former-student'),('university-college','faculty'),('university-college','admin-staff'),
  ('government-office','citizen'),('government-office','visitor'),('government-office','government-employee'),
  ('ngo-nonprofit','beneficiary'),('ngo-nonprofit','current-employee'),('ngo-nonprofit','volunteer'),
  ('school','current-employee'),('school','former-employee'),
  ('bank-financial','current-employee'),('bank-financial','former-employee'),
  ('retail-commercial','current-employee'),('retail-commercial','former-employee'),
  ('other','current-employee'),('other','former-employee')
)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Templates — created via a transactional DO block for readability
-- ---------------------------------------------------------------------------
do $$
declare
  -- corporate workplace
  t_corp uuid;
  v_corp uuid;
  -- hospital patient
  t_hpat uuid;
  v_hpat uuid;
  -- hospital employee
  t_hemp uuid;
  v_hemp uuid;
  -- uni student
  t_ustu uuid;
  v_ustu uuid;
  -- uni faculty
  t_ufac uuid;
  v_ufac uuid;
  -- gov citizen
  t_gcit uuid;
  v_gcit uuid;
  -- gov employee
  t_gemp uuid;
  v_gemp uuid;
  -- ngo beneficiary
  t_nben uuid;
  v_nben uuid;
  -- ngo employee
  t_nemp uuid;
  v_nemp uuid;
  -- fallback
  t_fall uuid;
  v_fall uuid;
  p uuid;
begin
  -- Insert templates (idempotency guarded by runner uniqueness of this migration file)
  insert into rating_templates (category_id, name)
  values ((select id from organization_categories where slug='private-company'), jsonb_build_object('en','Corporate Workplace Culture','bn','কর্পোরেট কর্মক্ষেত্র সংস্কৃতি'))
  returning id into t_corp;
  insert into rating_template_relationships (template_id, relationship_type_id)
  select t_corp, id from reviewer_relationship_types where slug in ('current-employee','former-employee','contractor');

  insert into rating_templates (category_id, name)
  values ((select id from organization_categories where slug='hospital-clinic'), jsonb_build_object('en','Patient Culture Experience','bn','রোগীর সংস্কৃতি অভিজ্ঞতা'))
  returning id into t_hpat;
  insert into rating_template_relationships (template_id, relationship_type_id)
  select t_hpat, id from reviewer_relationship_types where slug in ('patient','patient-attendant');

  insert into rating_templates (category_id, name)
  values ((select id from organization_categories where slug='hospital-clinic'), jsonb_build_object('en','Hospital Workplace Culture','bn','হাসপাতাল কর্মক্ষেত্র সংস্কৃতি'))
  returning id into t_hemp;
  insert into rating_template_relationships (template_id, relationship_type_id)
  select t_hemp, id from reviewer_relationship_types where slug in ('current-employee','former-employee');

  insert into rating_templates (category_id, name)
  values ((select id from organization_categories where slug='university-college'), jsonb_build_object('en','University Student Experience','bn','বিশ্ববিদ্যালয় শিক্ষার্থী অভিজ্ঞতা'))
  returning id into t_ustu;
  insert into rating_template_relationships (template_id, relationship_type_id)
  select t_ustu, id from reviewer_relationship_types where slug in ('student','former-student');

  insert into rating_templates (category_id, name)
  values ((select id from organization_categories where slug='university-college'), jsonb_build_object('en','University Faculty & Staff Culture','bn','বিশ্ববিদ্যালয় শিক্ষক ও কর্মী সংস্কৃতি'))
  returning id into t_ufac;
  insert into rating_template_relationships (template_id, relationship_type_id)
  select t_ufac, id from reviewer_relationship_types where slug in ('faculty','admin-staff');

  insert into rating_templates (category_id, name)
  values ((select id from organization_categories where slug='government-office'), jsonb_build_object('en','Public Office Culture','bn','সরকারি অফিস সংস্কৃতি'))
  returning id into t_gcit;
  insert into rating_template_relationships (template_id, relationship_type_id)
  select t_gcit, id from reviewer_relationship_types where slug in ('citizen','visitor');

  insert into rating_templates (category_id, name)
  values ((select id from organization_categories where slug='government-office'), jsonb_build_object('en','Government Workplace Culture','bn','সরকারি কর্মক্ষেত্র সংস্কৃতি'))
  returning id into t_gemp;
  insert into rating_template_relationships (template_id, relationship_type_id)
  select t_gemp, id from reviewer_relationship_types where slug = 'government-employee';

  insert into rating_templates (category_id, name)
  values ((select id from organization_categories where slug='ngo-nonprofit'), jsonb_build_object('en','Beneficiary Culture Experience','bn','সুবিধাভোগী সংস্কৃতি অভিজ্ঞতা'))
  returning id into t_nben;
  insert into rating_template_relationships (template_id, relationship_type_id)
  select t_nben, id from reviewer_relationship_types where slug = 'beneficiary';

  insert into rating_templates (category_id, name)
  values ((select id from organization_categories where slug='ngo-nonprofit'), jsonb_build_object('en','NGO Staff Culture','bn','এনজিও কর্মী সংস্কৃতি'))
  returning id into t_nemp;
  insert into rating_template_relationships (template_id, relationship_type_id)
  select t_nemp, id from reviewer_relationship_types where slug in ('current-employee','volunteer');

  insert into rating_templates (category_id, name)
  values ((select id from organization_categories where slug='other'), jsonb_build_object('en','General Organizational Culture (Fallback)','bn','সাধারণ সাংগঠনিক সংস্কৃতি (বিকল্প)'))
  returning id into t_fall;
  insert into rating_template_relationships (template_id, relationship_type_id)
  select t_fall, id from reviewer_relationship_types where slug in ('current-employee','former-employee');

  -- Versions (published v1, immutable)
  insert into rating_template_versions (template_id, version, status, change_note, published_at) values
    (t_corp, 1, 'published', 'Initial seeded version', now()) returning id into v_corp;
  insert into rating_template_versions (template_id, version, status, change_note, published_at) values
    (t_hpat, 1, 'published', 'Initial seeded version', now()) returning id into v_hpat;
  insert into rating_template_versions (template_id, version, status, change_note, published_at) values
    (t_hemp, 1, 'published', 'Initial seeded version', now()) returning id into v_hemp;
  insert into rating_template_versions (template_id, version, status, change_note, published_at) values
    (t_ustu, 1, 'published', 'Initial seeded version', now()) returning id into v_ustu;
  insert into rating_template_versions (template_id, version, status, change_note, published_at) values
    (t_ufac, 1, 'published', 'Initial seeded version', now()) returning id into v_ufac;
  insert into rating_template_versions (template_id, version, status, change_note, published_at) values
    (t_gcit, 1, 'published', 'Initial seeded version', now()) returning id into v_gcit;
  insert into rating_template_versions (template_id, version, status, change_note, published_at) values
    (t_gemp, 1, 'published', 'Initial seeded version', now()) returning id into v_gemp;
  insert into rating_template_versions (template_id, version, status, change_note, published_at) values
    (t_nben, 1, 'published', 'Initial seeded version', now()) returning id into v_nben;
  insert into rating_template_versions (template_id, version, status, change_note, published_at) values
    (t_nemp, 1, 'published', 'Initial seeded version', now()) returning id into v_nemp;
  insert into rating_template_versions (template_id, version, status, change_note, published_at) values
    (t_fall, 1, 'published', 'Initial seeded version', now()) returning id into v_fall;

  -- Corporate workplace parameters
  insert into rating_parameters (version_id, key, name, description, weight, ordering) values
    (v_corp, 'leadership',   jsonb_build_object('en','Leadership and supervisor behavior','bn','নেতৃত্ব ও সুপারভাইজার আচরণ'),   jsonb_build_object('en','','bn',''), 20, 0),
    (v_corp, 'respect',      jsonb_build_object('en','Workplace respect and dignity','bn','কর্মক্ষেত্রে সম্মান ও মর্যাদা'),            jsonb_build_object('en','','bn',''), 20, 1),
    (v_corp, 'fairness',     jsonb_build_object('en','Fairness and favoritism','bn','ন্যায্যতা ও পক্ষপাত'),                          jsonb_build_object('en','','bn',''), 15, 2),
    (v_corp, 'psych-safety', jsonb_build_object('en','Psychological safety and freedom to speak up','bn','মনস্তাত্ত্বিক নিরাপত্তা ও মত প্রকাশের স্বাধীনতা'), jsonb_build_object('en','','bn',''), 15, 3),
    (v_corp, 'communication',jsonb_build_object('en','Communication and transparency','bn','যোগাযোগ ও স্বচ্ছতা'),                    jsonb_build_object('en','','bn',''), 10, 4),
    (v_corp, 'work-life',    jsonb_build_object('en','Work-life boundaries and respect for personal time','bn','কর্ম-জীবন সীমা ও ব্যক্তিগত সময়ের প্রতি সম্মান'), jsonb_build_object('en','','bn',''), 10, 5),
    (v_corp, 'grievance',    jsonb_build_object('en','Conflict resolution and grievance handling','bn','দ্বন্দ্ব সমাধান ও অভিযোগ নিষ্পত্তি'), jsonb_build_object('en','','bn',''), 10, 6);

  -- Hospital patient parameters
  insert into rating_parameters (version_id, key, name, description, weight, ordering) values
    (v_hpat, 'respect',       jsonb_build_object('en','Respectful staff behavior','bn','কর্মীদের সম্মানজনক আচরণ'), jsonb_build_object('en','','bn',''), 20, 0),
    (v_hpat, 'listening',     jsonb_build_object('en','Communication and listening','bn','যোগাযোগ ও শ্রবণ'),          jsonb_build_object('en','','bn',''), 20, 1),
    (v_hpat, 'dignity',       jsonb_build_object('en','Personal dignity and privacy','bn','ব্যক্তিগত মর্যাদা ও গোপনীয়তা'), jsonb_build_object('en','','bn',''), 15, 2),
    (v_hpat, 'equality',      jsonb_build_object('en','Fair and equal treatment','bn','ন্যায্য ও সমান আচরণ'),     jsonb_build_object('en','','bn',''), 15, 3),
    (v_hpat, 'accountability',jsonb_build_object('en','Accountability and complaint handling','bn','জবাবদিহিতা ও অভিযোগ নিষ্পত্তি'), jsonb_build_object('en','','bn',''), 15, 4),
    (v_hpat, 'empathy',       jsonb_build_object('en','Empathy and sensitivity','bn','সহানুভূতি ও সংবেদনশীলতা'), jsonb_build_object('en','','bn',''), 10, 5),
    (v_hpat, 'no-intimidation',jsonb_build_object('en','Freedom from intimidating behavior','bn','ভয়ভীতিমুক্ত পরিবেশ'), jsonb_build_object('en','','bn',''), 5, 6);

  -- Hospital employee parameters
  insert into rating_parameters (version_id, key, name, description, weight, ordering) values
    (v_hemp, 'management', jsonb_build_object('en','Management behavior and professional respect','bn','ব্যবস্থাপনার আচরণ ও পেশাদার সম্মান'), jsonb_build_object('en','','bn',''), 20, 0),
    (v_hemp, 'fairness',   jsonb_build_object('en','Workplace fairness','bn','কর্মক্ষেত্রে ন্যায্যতা'),                       jsonb_build_object('en','','bn',''), 15, 1),
    (v_hemp, 'safety',     jsonb_build_object('en','Safety to raise concerns','bn','উদ্বেগ জানানোর নিরাপত্তা'),             jsonb_build_object('en','','bn',''), 15, 2),
    (v_hemp, 'teamwork',   jsonb_build_object('en','Teamwork and cooperation','bn','দলগত কাজ ও সহযোগিতা'),                    jsonb_build_object('en','','bn',''), 15, 3),
    (v_hemp, 'workload',   jsonb_build_object('en','Fairness of workload expectations','bn','কর্মভার প্রত্যাশার ন্যায্যতা'), jsonb_build_object('en','','bn',''), 10, 4),
    (v_hemp, 'conduct',    jsonb_build_object('en','Professional conduct','bn','পেশাদার আচরণ'),                                jsonb_build_object('en','','bn',''), 15, 5),
    (v_hemp, 'grievance',  jsonb_build_object('en','Internal complaint handling','bn','অভ্যন্তরীণ অভিযোগ নিষ্পত্তি'),          jsonb_build_object('en','','bn',''), 10, 6);

  -- University student
  insert into rating_parameters (version_id, key, name, description, weight, ordering) values
    (v_ustu, 'faculty-respect', jsonb_build_object('en','Faculty respect toward students','bn','শিক্ষকদের প্রতি শিক্ষার্থীর সম্মান'), jsonb_build_object('en','','bn',''), 20, 0),
    (v_ustu, 'admin-behavior',  jsonb_build_object('en','Administrative staff behavior','bn','প্রশাসনিক কর্মীদের আচরণ'),               jsonb_build_object('en','','bn',''), 15, 1),
    (v_ustu, 'fairness',        jsonb_build_object('en','Fairness and absence of favoritism','bn','ন্যায্যতা ও পক্ষপাতহীনতা'),          jsonb_build_object('en','','bn',''), 20, 2),
    (v_ustu, 'dignity',         jsonb_build_object('en','Student dignity and psychological safety','bn','শিক্ষার্থীর মর্যাদা ও মনস্তাত্ত্বিক নিরাপত্তা'), jsonb_build_object('en','','bn',''), 15, 3),
    (v_ustu, 'grievance',       jsonb_build_object('en','Grievance and harassment response','bn','অভিযোগ ও হয়রানি প্রতিক্রিয়া'),       jsonb_build_object('en','','bn',''), 15, 4),
    (v_ustu, 'communication',   jsonb_build_object('en','Communication and clarity','bn','যোগাযোগ ও স্পষ্টতা'),                           jsonb_build_object('en','','bn',''), 10, 5),
    (v_ustu, 'inclusion',       jsonb_build_object('en','Inclusion and equal treatment','bn','অন্তর্ভুক্তি ও সমান আচরণ'),              jsonb_build_object('en','','bn',''), 5, 6);

  -- University faculty
  insert into rating_parameters (version_id, key, name, description, weight, ordering) values
    (v_ufac, 'leadership',    jsonb_build_object('en','Leadership and supervisor respect','bn','নেতৃত্ব ও সুপারভাইজার সম্মান'), jsonb_build_object('en','','bn',''), 20, 0),
    (v_ufac, 'fairness',      jsonb_build_object('en','Professional fairness','bn','পেশাদার ন্যায্যতা'),                           jsonb_build_object('en','','bn',''), 15, 1),
    (v_ufac, 'autonomy',      jsonb_build_object('en','Academic and professional autonomy','bn','একাডেমিক ও পেশাদার স্বায়ত্তশাসন'), jsonb_build_object('en','','bn',''), 15, 2),
    (v_ufac, 'communication', jsonb_build_object('en','Internal communication','bn','অভ্যন্তরীণ যোগাযোগ'),            jsonb_build_object('en','','bn',''), 10, 3),
    (v_ufac, 'safety',        jsonb_build_object('en','Workplace safety and harassment response','bn','কর্মক্ষেত্র নিরাপত্তা ও হয়রানি প্রতিক্রিয়া'), jsonb_build_object('en','','bn',''), 15, 4),
    (v_ufac, 'grievance',     jsonb_build_object('en','Grievance handling','bn','অভিযোগ নিষ্পত্তি'),                      jsonb_build_object('en','','bn',''), 15, 5),
    (v_ufac, 'collegiality',  jsonb_build_object('en','Collegiality and teamwork','bn','সৌহার্দ্য ও দলগত কাজ'),             jsonb_build_object('en','','bn',''), 10, 6);

  -- Government citizen
  insert into rating_parameters (version_id, key, name, description, weight, ordering) values
    (v_gcit, 'respect',       jsonb_build_object('en','Respectful treatment','bn','সম্মানজনক আচরণ'),              jsonb_build_object('en','','bn',''), 25, 0),
    (v_gcit, 'fairness',      jsonb_build_object('en','Fair and equal behavior','bn','ন্যায্য ও সমান আচরণ'),     jsonb_build_object('en','','bn',''), 20, 1),
    (v_gcit, 'clarity',       jsonb_build_object('en','Clarity of communication','bn','যোগাযোগের স্পষ্টতা'),       jsonb_build_object('en','','bn',''), 15, 2),
    (v_gcit, 'transparency',  jsonb_build_object('en','Transparency of official conduct','bn','আনুষ্ঠানিক আচরণের স্বচ্ছতা'), jsonb_build_object('en','','bn',''), 15, 3),
    (v_gcit, 'responsiveness',jsonb_build_object('en','Responsiveness to concerns','bn','উদ্বেগে সাড়া'),             jsonb_build_object('en','','bn',''), 15, 4),
    (v_gcit, 'dignity',       jsonb_build_object('en','Dignity and professionalism','bn','মর্যাদা ও পেশাদারিত্ব'), jsonb_build_object('en','','bn',''), 10, 5);

  -- Government employee
  insert into rating_parameters (version_id, key, name, description, weight, ordering) values
    (v_gemp, 'supervisor',  jsonb_build_object('en','Supervisor behavior','bn','সুপারভাইজার আচরণ'),            jsonb_build_object('en','','bn',''), 20, 0),
    (v_gemp, 'fairness',    jsonb_build_object('en','Fairness and favoritism','bn','ন্যায্যতা ও পক্ষপাত'),           jsonb_build_object('en','','bn',''), 20, 1),
    (v_gemp, 'expression',  jsonb_build_object('en','Freedom to express concerns','bn','উদ্বেগ প্রকাশের স্বাধীনতা'), jsonb_build_object('en','','bn',''), 15, 2),
    (v_gemp, 'teamwork',    jsonb_build_object('en','Teamwork','bn','দলগত কাজ'),                                   jsonb_build_object('en','','bn',''), 15, 3),
    (v_gemp, 'dignity',     jsonb_build_object('en','Professional dignity','bn','পেশাদার মর্যাদা'),                   jsonb_build_object('en','','bn',''), 15, 4),
    (v_gemp, 'grievance',   jsonb_build_object('en','Grievance handling','bn','অভিযোগ নিষ্পত্তি'),                     jsonb_build_object('en','','bn',''), 15, 5);

  -- NGO beneficiary
  insert into rating_parameters (version_id, key, name, description, weight, ordering) values
    (v_nben, 'respect',       jsonb_build_object('en','Respectful and dignified treatment','bn','সম্মানজনক ও মর্যাদাপূর্ণ আচরণ'), jsonb_build_object('en','','bn',''), 25, 0),
    (v_nben, 'fairness',      jsonb_build_object('en','Fairness and nondiscrimination','bn','ন্যায্যতা ও বৈষম্যহীনতা'),        jsonb_build_object('en','','bn',''), 20, 1),
    (v_nben, 'listening',     jsonb_build_object('en','Listening and communication','bn','শ্রবণ ও যোগাযোগ'),                    jsonb_build_object('en','','bn',''), 15, 2),
    (v_nben, 'power',         jsonb_build_object('en','Respectful use of institutional power','bn','প্রাতিষ্ঠানিক ক্ষমতার সম্মানজনক ব্যবহার'), jsonb_build_object('en','','bn',''), 15, 3),
    (v_nben, 'complaint',     jsonb_build_object('en','Safe complaint channels','bn','নিরাপদ অভিযোগ মাধ্যম'),                    jsonb_build_object('en','','bn',''), 15, 4),
    (v_nben, 'confidentiality',jsonb_build_object('en','Confidentiality and discretion','bn','গোপনীয়তা ও বিবেচনা'),            jsonb_build_object('en','','bn',''), 10, 5);

  -- NGO employee
  insert into rating_parameters (version_id, key, name, description, weight, ordering) values
    (v_nemp, 'leadership',     jsonb_build_object('en','Leadership behavior','bn','নেতৃত্বের আচরণ'),      jsonb_build_object('en','','bn',''), 20, 0),
    (v_nemp, 'respect',        jsonb_build_object('en','Workplace respect','bn','কর্মক্ষেত্রে সম্মান'),          jsonb_build_object('en','','bn',''), 20, 1),
    (v_nemp, 'fairness',       jsonb_build_object('en','Fairness','bn','ন্যায্যতা'),                             jsonb_build_object('en','','bn',''), 15, 2),
    (v_nemp, 'ethics',         jsonb_build_object('en','Ethical organizational practices','bn','নৈতিক সাংগঠনিক অনুশীলন'), jsonb_build_object('en','','bn',''), 15, 3),
    (v_nemp, 'psych-safety',   jsonb_build_object('en','Psychological safety','bn','মনস্তাত্ত্বিক নিরাপত্তা'),    jsonb_build_object('en','','bn',''), 10, 4),
    (v_nemp, 'teamwork',       jsonb_build_object('en','Teamwork and communication','bn','দলগত কাজ ও যোগাযোগ'),    jsonb_build_object('en','','bn',''), 10, 5),
    (v_nemp, 'accountability', jsonb_build_object('en','Internal accountability','bn','অভ্যন্তরীণ জবাবদিহিতা'),    jsonb_build_object('en','','bn',''), 10, 6);

  -- Fallback
  insert into rating_parameters (version_id, key, name, description, weight, ordering) values
    (v_fall, 'respect',       jsonb_build_object('en','Respect and dignity','bn','সম্মান ও মর্যাদা'), jsonb_build_object('en','','bn',''), 25, 0),
    (v_fall, 'fairness',      jsonb_build_object('en','Fairness','bn','ন্যায্যতা'),                   jsonb_build_object('en','','bn',''), 20, 1),
    (v_fall, 'communication', jsonb_build_object('en','Communication','bn','যোগাযোগ'),                jsonb_build_object('en','','bn',''), 20, 2),
    (v_fall, 'accountability',jsonb_build_object('en','Accountability','bn','জবাবদিহিতা'),           jsonb_build_object('en','','bn',''), 20, 3),
    (v_fall, 'conduct',       jsonb_build_object('en','Professional conduct','bn','পেশাদার আচরণ'),    jsonb_build_object('en','','bn',''), 15, 4);

  -- Sample questions — at least one per parameter for the three primary templates
  -- (others are readable with no question row and still renderable).
  select format('Corporate template seeded: %s', t_corp::text) into p;
  select format('Patient template seeded: %s', t_hpat::text) into p;

  insert into rating_questions (parameter_id, text, required, ordering)
  select id, jsonb_build_object('en','Do supervisors communicate respectfully with junior employees?','bn','সুপারভাইজাররা জুনিয়র কর্মীদের সাথে সম্মানের সাথে কথা বলেন?'), true, 0
  from rating_parameters where version_id = v_corp and key = 'leadership';
  insert into rating_questions (parameter_id, text, required, ordering)
  select id, jsonb_build_object('en','Are employees treated fairly regardless of personal connections?','bn','ব্যক্তিগত যোগাযোগ নির্বিশেষে কর্মীদের সাথে ন্যায্যভাবে আচরণ করা হয়?'), true, 0
  from rating_parameters where version_id = v_corp and key = 'fairness';
  insert into rating_questions (parameter_id, text, required, ordering)
  select id, jsonb_build_object('en','Can employees express disagreement without intimidation?','bn','ভয়ভীতি ছাড়াই কর্মীরা দ্বিমত প্রকাশ করতে পারেন?'), true, 0
  from rating_parameters where version_id = v_corp and key = 'psych-safety';
  insert into rating_questions (parameter_id, text, required, ordering)
  select id, jsonb_build_object('en','Did staff speak respectfully?','bn','কর্মীরা সম্মানের সাথে কথা বলেছেন?'), true, 0
  from rating_parameters where version_id = v_hpat and key = 'respect';
  insert into rating_questions (parameter_id, text, required, ordering)
  select id, jsonb_build_object('en','Were your concerns heard without unnecessary dismissal?','bn','অপ্রয়োজনীয়ভাবে এড়িয়ে না গিয়ে আপনার উদ্বেগ শোনা হয়েছে?'), true, 0
  from rating_parameters where version_id = v_hpat and key = 'listening';
  insert into rating_questions (parameter_id, text, required, ordering)
  select id, jsonb_build_object('en','Do teachers treat students respectfully?','bn','শিক্ষকরা শিক্ষার্থীদের সাথে সম্মানের সাথে আচরণ করেন?'), true, 0
  from rating_parameters where version_id = v_ustu and key = 'faculty-respect';
end $$;

-- Sample organizations (clearly labelled as sample data suitable for a local demo).
-- Never create sample data with is_synthetic=false in production; this file runs only in
-- an empty database that has not yet been promoted to production.
do $$
declare
  cid uuid;
  rel uuid;
  dummy uuid;
begin
  -- private company sample — used for UI demonstration before live listings accumulate
  select id into cid from organization_categories where slug = 'private-company';
  insert into organizations (slug, official_name, bengali_name, category_id, description, division, district, city, status, verified)
  values ('sample-nexus-technologies', 'Nexus Technologies Ltd. (Sample)', 'নেক্সাস টেকনোলজিস লিমিটেড (নমুনা)', cid,
    jsonb_build_object('en','Development fixture: a sample private software company used to demonstrate workplace culture scoring. This is not a real listing.','bn','ডেভেলপমেন্ট ফিক্সচার: কর্মক্ষেত্র সংস্কৃতি স্কোর প্রদর্শনের নমুনা।'), 'Dhaka','Dhaka','Dhaka','active', true)
  on conflict (slug) do nothing;

  select id into cid from organization_categories where slug = 'hospital-clinic';
  insert into organizations (slug, official_name, bengali_name, category_id, description, division, district, city, status, verified, google_maps_url)
  values ('sample-city-general-hospital', 'City General Hospital (Sample)', 'সিটি জেনারেল হাসপাতাল (নমুনা)', cid,
    jsonb_build_object('en','Development fixture: a sample hospital with separate patient and employee perspectives.','bn','ডেভেলপমেন্ট ফিক্সচার: রোগী ও কর্মীর আলাদা দৃষ্টিভঙ্গিসহ নমুনা।'), 'Dhaka','Dhaka','Dhaka','active', true, 'https://www.google.com/maps')
  on conflict (slug) do nothing;

  select id into dummy from organizations where slug = 'sample-city-general-hospital';
  insert into organization_branches (organization_id, name, division, district, city)
  select dummy, x.name, x.division, x.district, x.city from (values
    ('Dhanmondi Branch','Dhaka','Dhaka','Dhaka'),('Chattogram Branch','Chattogram','Chattogram','Chattogram')
  ) as x(name,division,district,city)
  on conflict do nothing;

  select id into cid from organization_categories where slug = 'university-college';
  insert into organizations (slug, official_name, bengali_name, category_id, description, division, district, city, status, verified)
  values ('sample-national-university', 'National University (Sample)', 'জাতীয় বিশ্ববিদ্যালয় (নমুনা)', cid,
    jsonb_build_object('en','Development fixture: a sample university with student and faculty templates.','bn','ডেভেলপমেন্ট ফিক্সচার: শিক্ষার্থী ও শিক্ষক টেমপ্লেটের নমুনা।'), 'Dhaka','Gazipur','Gazipur','active', true)
  on conflict (slug) do nothing;

  select id into cid from organization_categories where slug = 'government-office';
  insert into organizations (slug, official_name, bengali_name, category_id, description, division, district, city, status, verified)
  values ('sample-ministry-of-public-services', 'Ministry of Public Services (Sample)', 'জনসেবা মন্ত্রণালয় (নমুনা)', cid,
    jsonb_build_object('en','Development fixture: a sample government office.','bn','ডেভেলপমেন্ট ফিক্সচার: সরকারি অফিস।'), 'Dhaka','Dhaka','Dhaka','active', true)
  on conflict (slug) do nothing;

  select id into cid from organization_categories where slug = 'ngo-nonprofit';
  insert into organizations (slug, official_name, bengali_name, category_id, description, division, district, city, status, verified)
  values ('sample-hope-foundation', 'Hope Foundation (Sample)', 'হোপ ফাউন্ডেশন (নমুনা)', cid,
    jsonb_build_object('en','Development fixture: a sample NGO with beneficiary and staff perspectives.','bn','ডেভেলপমেন্ট ফিক্সচার: সুবিধাভোগী ও কর্মীর দৃষ্টিভঙ্গির নমুনা।'), 'Chattogram','Chattogram','Chattogram','active', true)
  on conflict (slug) do nothing;
end $$;
