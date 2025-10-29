import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@iiitd.ac.in' },
    update: {},
    create: {
      email: 'admin@iiitd.ac.in',
      name: 'Admin User',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
      phone: '+91-9876543210'
    }
  })

  // Create Doctor users
  const doctor1 = await prisma.user.upsert({
    where: { email: 'dr.smith@iiitd.ac.in' },
    update: {},
    create: {
      email: 'dr.smith@iiitd.ac.in',
      name: 'Dr. Sarah Smith',
      password: await bcrypt.hash('doctor123', 12),
      role: 'DOCTOR',
      phone: '+91-9876543211'
    }
  })

  const doctor2 = await prisma.user.upsert({
    where: { email: 'dr.johnson@iiitd.ac.in' },
    update: {},
    create: {
      email: 'dr.johnson@iiitd.ac.in',
      name: 'Dr. Michael Johnson',
      password: await bcrypt.hash('doctor123', 12),
      role: 'DOCTOR',
      phone: '+91-9876543232'
    }
  })

  // Create Student users
  const student1 = await prisma.user.upsert({
    where: { email: 'john.doe@iiitd.ac.in' },
    update: {},
    create: {
      email: 'john.doe@iiitd.ac.in',
      name: 'John Doe',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      studentId: '2023001',
      phone: '+91-9876543213',
      height: 175.5,
      weight: 68.2,
      bloodGroup: 'O+',
      pastMedicalHistory: 'No significant past medical history. Had chickenpox at age 8. No known allergies.',
      currentMedications: 'None'
    }
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'jane.smith@iiitd.ac.in' },
    update: {},
    create: {
      email: 'jane.smith@iiitd.ac.in',
      name: 'Jane Smith',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      studentId: '2023002',
      phone: '+91-9876543214',
      height: 162.0,
      weight: 55.8,
      bloodGroup: 'A+',
      pastMedicalHistory: 'Mild asthma since childhood. Allergic to shellfish. Had appendectomy in 2020.',
      currentMedications: 'Albuterol inhaler as needed for asthma'
    }
  })

  // Create Medicines
  const medicines = [
    {
      name: 'Paracetamol',
      category: 'Analgesic',
      quantity: 100,
      threshold: 20,
      dosage: '500mg',
      price: 5.0
    },
    {
      name: 'Ibuprofen',
      category: 'Anti-inflammatory',
      quantity: 75,
      threshold: 15,
      dosage: '400mg',
      price: 8.0
    },
    {
      name: 'Amoxicillin',
      category: 'Antibiotic',
      quantity: 50,
      threshold: 10,
      dosage: '250mg',
      price: 12.0
    },
    {
      name: 'Cetirizine',
      category: 'Antihistamine',
      quantity: 60,
      threshold: 12,
      dosage: '10mg',
      price: 6.0
    },
    {
      name: 'Omeprazole',
      category: 'Proton Pump Inhibitor',
      quantity: 40,
      threshold: 8,
      dosage: '20mg',
      price: 15.0
    }
  ]

  for (const medicine of medicines) {
    await prisma.medicine.upsert({
      where: { name: medicine.name },
      update: {},
      create: medicine
    })
  }

  // Create some sample appointments
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  // Create additional students for more appointments
  const student3 = await prisma.user.upsert({
    where: { email: 'alex.brown@iiitd.ac.in' },
    update: {},
    create: {
      email: 'alex.brown@iiitd.ac.in',
      name: 'Alex Brown',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      studentId: '2021003',
      phone: '+91-9876543215',
      height: 175.0,
      weight: 70.0,
      bloodGroup: 'O+',
      pastMedicalHistory: 'No significant medical history',
      currentMedications: 'None'
    }
  })

  const student4 = await prisma.user.upsert({
    where: { email: 'emily.davis@iiitd.ac.in' },
    update: {},
    create: {
      email: 'emily.davis@iiitd.ac.in',
      name: 'Emily Davis',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      studentId: '2021004',
      phone: '+91-9876543216',
      height: 160.0,
      weight: 55.0,
      bloodGroup: 'A-',
      pastMedicalHistory: 'Allergic to shellfish',
      currentMedications: 'None'
    }
  })

  const student5 = await prisma.user.upsert({
    where: { email: 'michael.wilson@iiitd.ac.in' },
    update: {},
    create: {
      email: 'michael.wilson@iiitd.ac.in',
      name: 'Michael Wilson',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      studentId: '2021005',
      phone: '+91-9876543217',
      height: 180.0,
      weight: 75.0,
      bloodGroup: 'B+',
      pastMedicalHistory: 'Asthma in childhood',
      currentMedications: 'None'
    }
  })

  // Create more appointments with different statuses and dates
  const appointment1 = await prisma.appointment.create({
    data: {
      date: tomorrow,
      timeSlot: '10:00 AM',
      reason: 'Regular checkup',
      status: 'CONFIRMED',
      notes: 'Annual health checkup',
      studentId: student1.id,
      doctorId: doctor1.id
    }
  })

  const appointment2 = await prisma.appointment.create({
    data: {
      date: nextWeek,
      timeSlot: '2:00 PM',
      reason: 'Headache and fever',
      status: 'PENDING',
      studentId: student2.id,
      doctorId: doctor2.id
    }
  })

  // More appointments for Doctor 1
  const appointment3 = await prisma.appointment.create({
    data: {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      timeSlot: '9:00 AM',
      reason: 'Stomach pain',
      status: 'CONFIRMED',
      notes: 'Patient reports abdominal discomfort',
      studentId: student3.id,
      doctorId: doctor1.id
    }
  })

  const appointment4 = await prisma.appointment.create({
    data: {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      timeSlot: '11:30 AM',
      reason: 'Follow-up consultation',
      status: 'CONFIRMED',
      notes: 'Follow-up after previous treatment',
      studentId: student4.id,
      doctorId: doctor1.id
    }
  })

  const appointment5 = await prisma.appointment.create({
    data: {
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      timeSlot: '3:00 PM',
      reason: 'Seasonal allergies',
      status: 'PENDING',
      notes: 'Student reports sneezing and watery eyes',
      studentId: student5.id,
      doctorId: doctor1.id
    }
  })

  // More appointments for Doctor 2
  const appointment6 = await prisma.appointment.create({
    data: {
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      timeSlot: '10:30 AM',
      reason: 'Injury assessment',
      status: 'CONFIRMED',
      notes: 'Sports injury during football practice',
      studentId: student3.id,
      doctorId: doctor2.id
    }
  })

  const appointment7 = await prisma.appointment.create({
    data: {
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      timeSlot: '4:30 PM',
      reason: 'Anxiety consultation',
      status: 'PENDING',
      notes: 'Student seeks counseling for academic stress',
      studentId: student1.id,
      doctorId: doctor2.id
    }
  })

  const appointment8 = await prisma.appointment.create({
    data: {
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      timeSlot: '1:00 PM',
      reason: 'Skin rash',
      status: 'CONFIRMED',
      notes: 'Rash on arms and legs',
      studentId: student5.id,
      doctorId: doctor2.id
    }
  })

  // Create completed appointments with prescriptions
  const pastDate1 = new Date()
  pastDate1.setDate(pastDate1.getDate() - 2)

  const pastDate2 = new Date()
  pastDate2.setDate(pastDate2.getDate() - 5)

  const pastDate3 = new Date()
  pastDate3.setDate(pastDate3.getDate() - 10)

  const completedAppointment1 = await prisma.appointment.create({
    data: {
      date: pastDate1,
      timeSlot: '11:00 AM',
      reason: 'Cold and cough',
      status: 'COMPLETED',
      notes: 'Patient recovered well',
      studentId: student1.id,
      doctorId: doctor1.id
    }
  })

  const completedAppointment2 = await prisma.appointment.create({
    data: {
      date: pastDate2,
      timeSlot: '2:30 PM',
      reason: 'Migraine',
      status: 'COMPLETED',
      notes: 'Severe headache with nausea',
      studentId: student2.id,
      doctorId: doctor1.id
    }
  })

  const completedAppointment3 = await prisma.appointment.create({
    data: {
      date: pastDate3,
      timeSlot: '9:30 AM',
      reason: 'Digestive issues',
      status: 'COMPLETED',
      notes: 'Gastric problem resolved',
      studentId: student3.id,
      doctorId: doctor2.id
    }
  })

  const completedAppointment4 = await prisma.appointment.create({
    data: {
      date: pastDate2,
      timeSlot: '4:00 PM',
      reason: 'Sprained ankle',
      status: 'COMPLETED',
      notes: 'Minor sprain from basketball',
      studentId: student4.id,
      doctorId: doctor2.id
    }
  })

  // Create prescriptions for completed appointments
  const prescription1 = await prisma.prescription.create({
    data: {
      diagnosis: 'Common cold with mild fever',
      notes: 'Rest and take medication as prescribed. Drink plenty of fluids.',
      appointmentId: completedAppointment1.id,
      doctorId: doctor1.id,
      studentId: student1.id
    }
  })

  const prescription2 = await prisma.prescription.create({
    data: {
      diagnosis: 'Tension headache and migraine',
      notes: 'Avoid stress, maintain regular sleep schedule. Return if symptoms persist.',
      appointmentId: completedAppointment2.id,
      doctorId: doctor1.id,
      studentId: student2.id
    }
  })

  const prescription3 = await prisma.prescription.create({
    data: {
      diagnosis: 'Gastritis due to irregular eating habits',
      notes: 'Follow proper meal timings. Avoid spicy and oily foods.',
      appointmentId: completedAppointment3.id,
      doctorId: doctor2.id,
      studentId: student3.id
    }
  })

  const prescription4 = await prisma.prescription.create({
    data: {
      diagnosis: 'Grade 1 ankle sprain',
      notes: 'Rest, ice, compression, and elevation. Avoid sports for 1 week.',
      appointmentId: completedAppointment4.id,
      doctorId: doctor2.id,
      studentId: student4.id
    }
  })

  // Add medications to prescriptions
  const paracetamol = await prisma.medicine.findFirst({
    where: { name: 'Paracetamol' }
  })

  const cetirizine = await prisma.medicine.findFirst({
    where: { name: 'Cetirizine' }
  })

  const amoxicillin = await prisma.medicine.findFirst({
    where: { name: 'Amoxicillin' }
  })

  const omeprazole = await prisma.medicine.findFirst({
    where: { name: 'Omeprazole' }
  })

  // Prescription 1 - Cold and cough
  if (paracetamol) {
    await prisma.prescriptionMedication.create({
      data: {
        prescriptionId: prescription1.id,
        medicineId: paracetamol.id,
        dosage: '500mg',
        frequency: 'Three times a day',
        duration: '5 days',
        instructions: 'Take after meals'
      }
    })
  }

  if (cetirizine) {
    await prisma.prescriptionMedication.create({
      data: {
        prescriptionId: prescription1.id,
        medicineId: cetirizine.id,
        dosage: '10mg',
        frequency: 'Once a day',
        duration: '2 days',
        instructions: 'Take before bedtime'
      }
    })
  }

  // Prescription 2 - Migraine
  if (paracetamol) {
    await prisma.prescriptionMedication.create({
      data: {
        prescriptionId: prescription2.id,
        medicineId: paracetamol.id,
        dosage: '500mg',
        frequency: 'As needed',
        duration: '7 days',
        instructions: 'Take when headache occurs, maximum 3 times a day'
      }
    })
  }

  // Prescription 3 - Gastritis
  if (omeprazole) {
    await prisma.prescriptionMedication.create({
      data: {
        prescriptionId: prescription3.id,
        medicineId: omeprazole.id,
        dosage: '20mg',
        frequency: 'Once a day',
        duration: '14 days',
        instructions: 'Take 30 minutes before breakfast on empty stomach'
      }
    })
  }

  // Prescription 4 - Ankle sprain (pain relief)
  if (paracetamol) {
    await prisma.prescriptionMedication.create({
      data: {
        prescriptionId: prescription4.id,
        medicineId: paracetamol.id,
        dosage: '500mg',
        frequency: 'Three times a day',
        duration: '5 days',
        instructions: 'Take with food for pain relief'
      }
    })
  }

  // Create some audit logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_SEED',
      details: { message: 'Database seeded with initial data' },
      ipAddress: '127.0.0.1',
      userAgent: 'Seeding Script'
    }
  })

  console.log('Database seeding completed successfully!')
  console.log('\nCreated users:')
  console.log('Admin: admin@iiitd.ac.in / admin123')
  console.log('Doctor 1: dr.smith@iiitd.ac.in / doctor123')
  console.log('Doctor 2: dr.johnson@iiitd.ac.in / doctor123')
  console.log('Student 1: john.doe@iiitd.ac.in / student123')
  console.log('Student 2: jane.smith@iiitd.ac.in / student123')
  console.log('Student 3: alex.brown@iiitd.ac.in / student123')
  console.log('Student 4: emily.davis@iiitd.ac.in / student123')
  console.log('Student 5: michael.wilson@iiitd.ac.in / student123')
  console.log('\nCreated appointments: 12 total (8 upcoming, 4 completed)')
  console.log('Created prescriptions: 4 with medications')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })