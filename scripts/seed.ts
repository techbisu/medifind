import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding database...')

  // ---------- PLANS ----------
  const plans = await Promise.all([
    db.plan.create({
      data: {
        name: 'Free',
        tier: 'FREE',
        price: 0,
        billingCycle: 'MONTHLY',
        description: 'Get started with a basic listing on MediFind',
        featuresJson: JSON.stringify([
          '1 chamber / 5 lab tests / 5 shop services',
          'Public listing & search',
          'Basic appointment booking',
          'Email support',
        ]),
        maxChambers: 1,
        maxLabTests: 5,
        maxShopServices: 5,
        priorityListing: false,
        verifiedBadge: false,
      },
    }),
    db.plan.create({
      data: {
        name: 'Professional',
        tier: 'PRO',
        price: 499,
        billingCycle: 'MONTHLY',
        description: 'For active practices that need more capacity',
        featuresJson: JSON.stringify([
          '5 chambers / 50 lab tests / 50 shop services',
          'Priority search placement',
          'Verified badge',
          'Appointment management dashboard',
          'Analytics & insights',
          'Phone + email support',
        ]),
        maxChambers: 5,
        maxLabTests: 50,
        maxShopServices: 50,
        priorityListing: true,
        verifiedBadge: true,
      },
    }),
    db.plan.create({
      data: {
        name: 'Enterprise',
        tier: 'ENTERPRISE',
        price: 1499,
        billingCycle: 'MONTHLY',
        description: 'For hospitals, lab chains, and large pharmacies',
        featuresJson: JSON.stringify([
          'Unlimited chambers, tests, services',
          'Top-priority placement',
          'Multi-location management',
          'Custom branding & API access',
          'Dedicated account manager',
          '24/7 priority support',
        ]),
        maxChambers: 999,
        maxLabTests: 999,
        maxShopServices: 999,
        priorityListing: true,
        verifiedBadge: true,
      },
    }),
  ])
  console.log(`✅ Created ${plans.length} plans`)

  // ---------- SPECIALTIES ----------
  const specialties = await Promise.all([
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic',
    'Gynecologist', 'ENT Specialist', 'Neurologist', 'Psychiatrist',
    'Dentist', 'Ophthalmologist', 'General Physician', 'Diabetologist',
  ].map((name) => db.specialty.create({
    data: { name, slug: slugify(name) },
  })))
  console.log(`✅ Created ${specialties.length} specialties`)

  // ---------- HEALTH ISSUES ----------
  const healthIssues = await Promise.all([
    { name: 'Heart Disease', category: 'Cardiac' },
    { name: 'Diabetes', category: 'Endocrine' },
    { name: 'Hypertension', category: 'Cardiac' },
    { name: 'Asthma', category: 'Respiratory' },
    { name: 'Skin Allergy', category: 'Dermatology' },
    { name: 'Fever', category: 'General' },
    { name: 'Joint Pain', category: 'Orthopedic' },
    { name: 'Headache', category: 'Neurology' },
    { name: 'Stomach Pain', category: 'Gastro' },
    { name: 'Eye Infection', category: 'Ophthalmology' },
  ].map((h) => db.healthIssue.create({
    data: { name: h.name, slug: slugify(h.name), category: h.category },
  })))
  console.log(`✅ Created ${healthIssues.length} health issues`)

  // ---------- USERS ----------
  const adminUser = await db.user.create({
    data: {
      email: 'admin@medifind.com',
      password: 'admin123',
      name: 'Super Admin',
      role: 'ADMIN',
      phone: '+919999999999',
    },
  })

  const doctorUser = await db.user.create({
    data: {
      email: 'doctor@medifind.com',
      password: 'doctor123',
      name: 'Dr. Aryan Mehta',
      role: 'PROVIDER',
      phone: '+919876543210',
    },
  })

  const shopUser = await db.user.create({
    data: {
      email: 'shop@medifind.com',
      password: 'shop123',
      name: 'Wellness Pharmacy',
      role: 'PROVIDER',
      phone: '+919812345678',
    },
  })

  const labUser = await db.user.create({
    data: {
      email: 'lab@medifind.com',
      password: 'lab123',
      name: 'Thrive Diagnostics',
      role: 'PROVIDER',
      phone: '+919812345679',
    },
  })

  const doctor2User = await db.user.create({
    data: {
      email: 'doctor2@medifind.com',
      password: 'doctor123',
      name: 'Dr. Priya Sharma',
      role: 'PROVIDER',
      phone: '+919876543211',
    },
  })
  console.log('✅ Created users (admin, 2 doctors, shop, lab)')

  // ---------- PROVIDERS ----------
  const doctorProvider = await db.provider.create({
    data: {
      userId: doctorUser.id,
      type: 'DOCTOR',
      name: 'Dr. Aryan Mehta',
      slug: 'dr-aryan-mehta',
      tagline: 'Senior Cardiologist, MD (Medicine), DM (Cardiology)',
      description: 'Dr. Aryan Mehta is a senior cardiologist with 15+ years of experience treating complex cardiac conditions. He specializes in interventional cardiology and preventive heart care.',
      phone: '+919876543210',
      email: 'aryan.mehta@medifind.com',
      website: 'https://medifind.com/aryan',
      address: '123 Healthcare Avenue, Sector 18',
      city: 'Noida',
      area: 'Sector 18',
      pincode: '201301',
      latitude: 28.5707,
      longitude: 77.3260,
      status: 'APPROVED',
      verified: true,
      rating: 4.8,
      reviewCount: 124,
      viewCount: 5420,
      subscriptionTier: 'PRO',
      doctorProfile: {
        create: {
          specialty: 'Cardiologist',
          specialtiesJson: JSON.stringify(['Cardiologist', 'Physician']),
          qualifications: 'MBBS, MD (Medicine), DM (Cardiology)',
          experienceYears: 15,
          consultationFee: 800,
          languagesJson: JSON.stringify(['English', 'Hindi']),
          healthIssuesJson: JSON.stringify(['Heart Disease', 'Hypertension', 'Chest Pain']),
          about: 'Senior interventional cardiologist with over 15 years of clinical experience.',
          gender: 'Male',
          registrationNo: 'KMC-12345',
        },
      },
    },
  })

  const doctor2Provider = await db.provider.create({
    data: {
      userId: doctor2User.id,
      type: 'DOCTOR',
      name: 'Dr. Priya Sharma',
      slug: 'dr-priya-sharma',
      tagline: 'Dermatologist & Cosmetologist, MD (Dermatology)',
      description: 'Dr. Priya Sharma is a renowned dermatologist specializing in skin disorders, cosmetic procedures, and hair treatments.',
      phone: '+919876543211',
      email: 'priya.sharma@medifind.com',
      address: '45 Beauty Street, Bandra West',
      city: 'Mumbai',
      area: 'Bandra West',
      pincode: '400050',
      latitude: 19.0596,
      longitude: 72.8295,
      status: 'APPROVED',
      verified: true,
      rating: 4.9,
      reviewCount: 89,
      viewCount: 3210,
      subscriptionTier: 'FREE',
      doctorProfile: {
        create: {
          specialty: 'Dermatologist',
          specialtiesJson: JSON.stringify(['Dermatologist']),
          qualifications: 'MBBS, MD (Dermatology)',
          experienceYears: 10,
          consultationFee: 600,
          languagesJson: JSON.stringify(['English', 'Hindi', 'Marathi']),
          healthIssuesJson: JSON.stringify(['Skin Allergy', 'Acne', 'Hair Fall']),
          about: 'Expert in dermatology and cosmetic skin treatments.',
          gender: 'Female',
          registrationNo: 'MMC-67890',
        },
      },
    },
  })

  const shopProvider = await db.provider.create({
    data: {
      userId: shopUser.id,
      type: 'MEDICAL_SHOP',
      name: 'Wellness Pharmacy',
      slug: 'wellness-pharmacy',
      tagline: '24/7 Pharmacy & Doctor Chamber Host',
      description: 'Wellness Pharmacy is a 24/7 medical store offering prescription medicines, OTC products, surgical equipment, and doctor consultation chambers. We host multiple specialists throughout the week.',
      phone: '+919812345678',
      email: 'care@wellnesspharma.com',
      website: 'https://wellnesspharma.com',
      address: '78 Medical Hub, Sector 18',
      city: 'Noida',
      area: 'Sector 18',
      pincode: '201301',
      latitude: 28.5710,
      longitude: 77.3262,
      status: 'APPROVED',
      verified: true,
      rating: 4.6,
      reviewCount: 56,
      viewCount: 1820,
      subscriptionTier: 'PRO',
    },
  })

  const labProvider = await db.provider.create({
    data: {
      userId: labUser.id,
      type: 'CLINIC_LAB',
      name: 'Thrive Diagnostics',
      slug: 'thrive-diagnostics',
      tagline: 'NABL Accredited Diagnostic Lab',
      description: 'Thrive Diagnostics is an NABL-accredited pathology and imaging center offering 500+ tests including blood work, MRI, CT scan, and ultrasound. Home sample collection available.',
      phone: '+919812345679',
      email: 'info@thrivediag.com',
      website: 'https://thrivediag.com',
      address: '90 Diagnostic Plaza, Connaught Place',
      city: 'New Delhi',
      area: 'Connaught Place',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
      status: 'APPROVED',
      verified: true,
      rating: 4.7,
      reviewCount: 213,
      viewCount: 8740,
      subscriptionTier: 'ENTERPRISE',
    },
  })

  // Add a few more sample providers for richer search
  await Promise.all([
    db.provider.create({
      data: {
        userId: doctorUser.id,
        type: 'DOCTOR',
        name: 'Dr. Rajesh Kumar',
        slug: 'dr-rajesh-kumar',
        tagline: 'Orthopedic Surgeon, MS (Ortho)',
        description: 'Expert in joint replacement and sports injury management.',
        phone: '+919876543212',
        city: 'Noida',
        area: 'Sector 62',
        status: 'APPROVED',
        verified: true,
        rating: 4.5,
        reviewCount: 67,
        subscriptionTier: 'FREE',
        doctorProfile: {
          create: {
            specialty: 'Orthopedic',
            specialtiesJson: JSON.stringify(['Orthopedic']),
            qualifications: 'MBBS, MS (Ortho)',
            experienceYears: 12,
            consultationFee: 700,
            languagesJson: JSON.stringify(['English', 'Hindi']),
            healthIssuesJson: JSON.stringify(['Joint Pain', 'Back Pain']),
            gender: 'Male',
          },
        },
      },
    }),
    db.provider.create({
      data: {
        userId: shopUser.id,
        type: 'MEDICAL_SHOP',
        name: 'CityCare Medical Store',
        slug: 'citycare-medical-store',
        tagline: 'Trusted neighborhood pharmacy',
        description: 'Family-owned pharmacy since 1995. Prescription drugs, OTC, baby care, and elderly care products.',
        phone: '+919812345680',
        city: 'New Delhi',
        area: 'Karol Bagh',
        status: 'APPROVED',
        verified: false,
        rating: 4.3,
        reviewCount: 28,
        subscriptionTier: 'FREE',
      },
    }),
    db.provider.create({
      data: {
        userId: labUser.id,
        type: 'CLINIC_LAB',
        name: 'PathLab Express',
        slug: 'pathlab-express',
        tagline: 'Quick results, affordable prices',
        description: 'Specializing in routine blood tests and health checkup packages.',
        phone: '+919812345681',
        city: 'Mumbai',
        area: 'Andheri East',
        status: 'APPROVED',
        verified: true,
        rating: 4.4,
        reviewCount: 92,
        subscriptionTier: 'PRO',
      },
    }),
  ])
  console.log('✅ Created providers')

  // ---------- CHAMBERS ----------
  const ownChamber = await db.chamber.create({
    data: {
      doctorProviderId: doctorProvider.id,
      shopProviderId: null,
      name: 'Dr. Mehta Private Clinic',
      address: '123 Healthcare Avenue, Sector 18, Noida',
      phone: '+919876543210',
      city: 'Noida',
      area: 'Sector 18',
      visitingHours: 'Mon-Sat, 9:00 AM - 1:00 PM',
      schedules: {
        create: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', maxPatients: 15 },
          { dayOfWeek: 2, startTime: '09:00', endTime: '13:00', maxPatients: 15 },
          { dayOfWeek: 3, startTime: '09:00', endTime: '13:00', maxPatients: 15 },
          { dayOfWeek: 4, startTime: '09:00', endTime: '13:00', maxPatients: 15 },
          { dayOfWeek: 5, startTime: '09:00', endTime: '13:00', maxPatients: 15 },
          { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', maxPatients: 15 },
        ],
      },
    },
  })

  const shopChamber = await db.chamber.create({
    data: {
      doctorProviderId: doctorProvider.id,
      shopProviderId: shopProvider.id,
      name: 'Wellness Pharmacy - Dr. Mehta Chamber',
      address: '78 Medical Hub, Sector 18, Noida',
      phone: '+919812345678',
      city: 'Noida',
      area: 'Sector 18',
      visitingHours: 'Mon, Wed, Fri - 5:00 PM to 8:00 PM',
      schedules: {
        create: [
          { dayOfWeek: 1, startTime: '17:00', endTime: '20:00', maxPatients: 10 },
          { dayOfWeek: 3, startTime: '17:00', endTime: '20:00', maxPatients: 10 },
          { dayOfWeek: 5, startTime: '17:00', endTime: '20:00', maxPatients: 10 },
        ],
      },
    },
  })

  await db.chamber.create({
    data: {
      doctorProviderId: doctor2Provider.id,
      shopProviderId: null,
      name: 'Dr. Priya Skin Clinic',
      address: '45 Beauty Street, Bandra West, Mumbai',
      phone: '+919876543211',
      city: 'Mumbai',
      area: 'Bandra West',
      visitingHours: 'Tue-Sun, 11:00 AM - 7:00 PM',
      schedules: {
        create: [
          { dayOfWeek: 2, startTime: '11:00', endTime: '19:00', maxPatients: 20 },
          { dayOfWeek: 3, startTime: '11:00', endTime: '19:00', maxPatients: 20 },
          { dayOfWeek: 4, startTime: '11:00', endTime: '19:00', maxPatients: 20 },
          { dayOfWeek: 5, startTime: '11:00', endTime: '19:00', maxPatients: 20 },
          { dayOfWeek: 6, startTime: '11:00', endTime: '19:00', maxPatients: 20 },
        ],
      },
    },
  })
  console.log('✅ Created chambers (own + shop-hosted)')

  // ---------- SHOP SERVICES ----------
  await db.shopService.createMany({
    data: [
      { providerId: shopProvider.id, name: 'Prescription Medicines', description: 'All prescribed drugs available', category: 'Pharmacy', price: 0 },
      { providerId: shopProvider.id, name: 'OTC Products', description: 'Over-the-counter medicines', category: 'Pharmacy', price: 0 },
      { providerId: shopProvider.id, name: 'Surgical Equipment', description: 'Surgical and medical equipment', category: 'Equipment', price: 0 },
      { providerId: shopProvider.id, name: 'Baby Care Products', description: 'Diapers, formula, baby food', category: 'Baby Care', price: 0 },
      { providerId: shopProvider.id, name: 'Home Delivery', description: 'Free home delivery above ₹500', category: 'Service', price: 0 },
    ],
  })
  console.log('✅ Created shop services')

  // ---------- LAB TESTS ----------
  await db.labTest.createMany({
    data: [
      { providerId: labProvider.id, name: 'Complete Blood Count (CBC)', description: 'Basic blood test for overall health', price: 350, discountPrice: 299, category: 'Blood Test', sampleType: 'Blood', reportTime: 'Same day', fastingRequired: false },
      { providerId: labProvider.id, name: 'Lipid Profile', description: 'Cholesterol and triglyceride test', price: 700, discountPrice: 599, category: 'Blood Test', sampleType: 'Blood', reportTime: '24 hours', fastingRequired: true },
      { providerId: labProvider.id, name: 'HbA1c (Diabetes)', description: '3-month average blood sugar', price: 600, category: 'Blood Test', sampleType: 'Blood', reportTime: '24 hours', fastingRequired: false },
      { providerId: labProvider.id, name: 'Thyroid Profile (T3, T4, TSH)', description: 'Thyroid hormone panel', price: 800, discountPrice: 699, category: 'Blood Test', sampleType: 'Blood', reportTime: '24 hours', fastingRequired: false },
      { providerId: labProvider.id, name: 'Vitamin D Test', description: '25-OH Vitamin D level', price: 1200, discountPrice: 999, category: 'Blood Test', sampleType: 'Blood', reportTime: '48 hours', fastingRequired: false },
      { providerId: labProvider.id, name: 'Liver Function Test (LFT)', description: 'Liver enzyme and protein levels', price: 900, category: 'Blood Test', sampleType: 'Blood', reportTime: '24 hours', fastingRequired: true },
      { providerId: labProvider.id, name: 'Kidney Function Test (KFT)', description: 'Comprehensive kidney panel', price: 850, category: 'Blood Test', sampleType: 'Blood', reportTime: '24 hours', fastingRequired: true },
      { providerId: labProvider.id, name: 'Urine Routine', description: 'Basic urine analysis', price: 200, category: 'Urine Test', sampleType: 'Urine', reportTime: 'Same day', fastingRequired: false },
      { providerId: labProvider.id, name: 'Full Body Checkup', description: 'Comprehensive 80+ parameter health checkup', price: 3500, discountPrice: 2499, category: 'Health Package', sampleType: 'Blood + Urine', reportTime: '48 hours', fastingRequired: true },
      { providerId: labProvider.id, name: 'MRI Scan (Brain)', description: 'High-resolution brain MRI', price: 6500, discountPrice: 4999, category: 'Imaging', sampleType: 'N/A', reportTime: '48 hours', fastingRequired: false },
    ],
  })
  console.log('✅ Created lab tests')

  // ---------- SAMPLE APPOINTMENTS ----------
  await db.appointment.createMany({
    data: [
      {
        providerId: doctorProvider.id,
        chamberId: ownChamber.id,
        patientName: 'Rahul Verma',
        patientPhone: '+919811111111',
        patientEmail: 'rahul@example.com',
        patientAge: 42,
        patientGender: 'Male',
        healthIssue: 'Chest pain and shortness of breath',
        preferredDate: '2026-08-21',
        preferredTime: '10:00',
        status: 'CONFIRMED',
        fee: 800,
      },
      {
        providerId: doctorProvider.id,
        chamberId: shopChamber.id,
        patientName: 'Sunita Devi',
        patientPhone: '+919822222222',
        patientAge: 58,
        patientGender: 'Female',
        healthIssue: 'High blood pressure follow-up',
        preferredDate: '2026-08-20',
        preferredTime: '17:30',
        status: 'PENDING',
        fee: 800,
      },
      {
        providerId: doctorProvider.id,
        chamberId: ownChamber.id,
        patientName: 'Imran Khan',
        patientPhone: '+919833333333',
        patientAge: 65,
        patientGender: 'Male',
        healthIssue: 'Routine cardiac checkup',
        preferredDate: '2026-08-19',
        preferredTime: '11:30',
        status: 'COMPLETED',
        fee: 800,
      },
    ],
  })
  console.log('✅ Created sample appointments')

  // ---------- REVIEWS ----------
  await db.review.createMany({
    data: [
      { providerId: doctorProvider.id, userName: 'Rahul Verma', rating: 5, comment: 'Excellent doctor, very thorough diagnosis and clear explanation.', isVerified: true },
      { providerId: doctorProvider.id, userName: 'Sunita Devi', rating: 5, comment: 'Very patient and caring. Highly recommend.', isVerified: true },
      { providerId: doctorProvider.id, userName: 'Amit Singh', rating: 4, comment: 'Good experience, slightly long wait but worth it.', isVerified: false },
      { providerId: doctor2Provider.id, userName: 'Pooja Patel', rating: 5, comment: 'Best dermatologist in the area! My skin has never looked better.', isVerified: true },
      { providerId: shopProvider.id, userName: 'Neha Gupta', rating: 5, comment: 'Always have medicines in stock. 24/7 service is a lifesaver.', isVerified: true },
      { providerId: labProvider.id, userName: 'Vikram Rao', rating: 5, comment: 'Quick reports and clean facility. Home collection was on time.', isVerified: true },
      { providerId: labProvider.id, userName: 'Anita Joshi', rating: 4, comment: 'Good service, prices are reasonable.', isVerified: false },
    ],
  })
  console.log('✅ Created reviews')

  // ---------- SUBSCRIPTIONS ----------
  const freePlan = plans[0]
  const proPlan = plans[1]
  const enterprisePlan = plans[2]

  await db.subscription.createMany({
    data: [
      { providerId: doctorProvider.id, userId: doctorUser.id, planId: proPlan.id, status: 'ACTIVE', amountPaid: 499, autoRenew: true, endDate: new Date('2026-09-19') },
      { providerId: doctor2Provider.id, userId: doctor2User.id, planId: freePlan.id, status: 'ACTIVE', amountPaid: 0 },
      { providerId: shopProvider.id, userId: shopUser.id, planId: proPlan.id, status: 'ACTIVE', amountPaid: 499, autoRenew: true, endDate: new Date('2026-09-19') },
      { providerId: labProvider.id, userId: labUser.id, planId: enterprisePlan.id, status: 'ACTIVE', amountPaid: 1499, autoRenew: true, endDate: new Date('2026-09-19') },
    ],
  })
  console.log('✅ Created subscriptions')

  console.log('\n🎉 Seeding complete!')
  console.log('--- Login Credentials ---')
  console.log('Admin:    admin@medifind.com / admin123')
  console.log('Doctor:   doctor@medifind.com / doctor123')
  console.log('Doctor 2: doctor2@medifind.com / doctor123')
  console.log('Shop:     shop@medifind.com / shop123')
  console.log('Lab:      lab@medifind.com / lab123')
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
