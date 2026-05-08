import 'dotenv/config'
import { PrismaClient, Role, BookingStatus, FacilityType, RegistrationStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Neel', 'Rohan', 'Rahul', 'Amit', 'Suresh', 'Ramesh', 'Vikram', 'Sanjay', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Kiara', 'Myra', 'Sarah', 'Ira', 'Anvi', 'Aditi', 'Kavya', 'Priya', 'Neha', 'Pooja', 'Riya', 'Sneha', 'Tanvi', 'Meera', 'Nisha', 'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen']
const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Mishra', 'Reddy', 'Nair', 'Kapoor', 'Malhotra', 'Bhatia', 'Joshi', 'Mehta', 'Jain', 'Agarwal', 'Yadav', 'Khan', 'Das', 'Chopra', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']

function getRandomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)]
  const last = lastNames[Math.floor(Math.random() * lastNames.length)]
  return { first, last, full: `${first} ${last}` }
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getGaussianRandom(mean: number, stdDev: number) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = num / 10.0 + 0.5;
  if (num > 1 || num < 0) return getGaussianRandom(mean, stdDev);
  return (num * stdDev * 2) + (mean - stdDev);
}

function generateStudentId(uniSlug: string): string {
  if (uniSlug === 'stanford') return Math.floor(10000000 + Math.random() * 90000000).toString()
  if (uniSlug === 'mit') return Math.floor(100000000 + Math.random() * 900000000).toString()
  if (uniSlug === 'yale') {
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    const numLetters = getRandomInt(2, 3)
    let prefix = ''
    for (let i = 0; i < numLetters; i++) prefix += letters.charAt(Math.floor(Math.random() * letters.length))
    return `${prefix}${getRandomInt(100, 9999)}`
  }
  if (uniSlug === 'iim-indore') {
    const year = getRandomElement(['2023', '2024', '2025'])
    const program = getRandomElement(['IPM', 'PGP', 'EPGP', 'DPM'])
    const number = getRandomInt(1, 999).toString().padStart(3, '0')
    return `${year}${program}${number}`
  }
  return `STU-${Date.now()}`
}

async function main() {
  await prisma.eventRegistration.deleteMany()
  await prisma.event.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.waitlist.deleteMany()
  await prisma.blackoutDate.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.user.deleteMany()
  await prisma.university.deleteMany()

  const superAdminPassword = await bcrypt.hash('password123', 10)
  await prisma.user.create({
    data: {
      email: 'superadmin@bmc.com',
      name: 'System Administrator',
      role: Role.SUPER_ADMIN,
      password: superAdminPassword,
    },
  })

  // prob shouldn't hardcode this pass but whatever testing only lol
  const passwordHash = await bcrypt.hash('password123', 10)

  const universitiesData = [
    {
      uni: {
        name: 'Stanford University',
        slug: 'stanford',
        domain: 'stanford.edu',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/1200px-Seal_of_Leland_Stanford_Junior_University.svg.png',
        primaryColor: '#8C1515',
        allowedDomains: ['stanford.edu', 'slac.stanford.edu'],
      },
      physical: [
        { name: 'Green Library Study Room 1', loc: 'Bing Wing', cap: 6, timings: '08:00-23:00', amenities: { "Projector": 1, "Whiteboard": 2, "WiFi": true, "Power Outlets": 4, "Air Conditioning": true, "Ethernet Ports": 1, "Rolling Chairs": 6, "HDMI Cable": true, "Sound System": false } },
        { name: 'Huang Engineering Center MakerSpace', loc: 'SEQ', cap: 40, timings: '09:00-20:00', amenities: { "3D Printers": 5, "Soldering Stations": 10, "WiFi": true, "Power Outlets": 20, "Air Conditioning": true, "Laser Cutter": 1, "CNC Machine": 1, "Safety Goggles": 40, "Ventilation System": true } },
        { name: 'Arrillaga Outdoor Education and Recreation Center', loc: 'West Campus', cap: 200, timings: '06:00-22:00', amenities: { "Climbing Wall": true, "Pool": 1, "Weights Area": true, "Lockers": 100, "Showers": 20, "Water Fountains": 4, "Towel Service": true, "Yoga Mats": 30, "AC": true } },
      ],
      events: [
        { name: 'Memorial Auditorium', loc: 'Main Quad', cap: 1700, timings: '08:00-23:00', amenities: { "Stage": true, "AV System": true, "Lighting Rig": true, "Microphones": 10, "Green Room": 2, "Balcony Seating": true, "Projector": 2, "Wheelchair Accessible": true, "WiFi": true } },
        { name: 'Dinkelspiel Auditorium', loc: 'Music Dept', cap: 710, timings: '08:00-22:00', amenities: { "Acoustic Shell": true, "Piano": 1, "Music Stands": 50, "Microphones": 5, "AV System": true, "Lighting": true, "AC": true, "WiFi": true, "Dressing Rooms": 2 } },
      ],
      transports: [
        { name: 'Marguerite Shuttle Line Y', start: 'Medical Center', end: 'Transit Center', stops: ['Medical Center', 'Science and Engineering Quad', 'Main Quad', 'Transit Center'] },
        { name: 'Marguerite Shuttle Line X', start: 'Transit Center', end: 'Oak Creek', stops: ['Transit Center', 'Shopping Center', 'Oak Creek'] },
      ],
      eventTitles: ['TreeHacks 2025', 'Stanford AI Symposium', 'Cardinal Startup Pitch Night', 'Design Thinking Workshop']
    },
    {
      uni: {
        name: 'Massachusetts Institute of Technology',
        slug: 'mit',
        domain: 'mit.edu',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1200px-MIT_logo.svg.png',
        primaryColor: '#A31F34',
        allowedDomains: ['mit.edu', 'csail.mit.edu'],
      },
      physical: [
        { name: 'Barker Engineering Library Dome', loc: 'Building 10', cap: 150, timings: '00:00-23:59', amenities: { "Quiet Study Area": true, "Power Outlets": 100, "WiFi": true, "Desks": 75, "Reading Lamps": 150, "AC": true, "Printing Station": 2, "Scanner": 1, "Vending Machine": false } },
        { name: 'Zesiger Sports and Fitness Center', loc: 'Building W35', cap: 300, timings: '05:30-23:00', amenities: { "Olympic Pool": 1, "Squash Courts": 4, "Basketball Court": 2, "Treadmills": 30, "Weights": true, "Lockers": 200, "Showers": 40, "Water Fountains": 6, "Towel Service": true } },
        { name: 'Stata Center Lab 32-G449', loc: 'Building 32', cap: 20, timings: '07:00-22:00', amenities: { "Linux Workstations": 20, "Whiteboards": 4, "WiFi": true, "Projector": 1, "HDMI Cables": 5, "Ethernet Ports": 20, "AC": true, "Coffee Machine": 1, "Ergonomic Chairs": 20 } },
      ],
      events: [
        { name: 'Kresge Auditorium', loc: 'Building W16', cap: 1200, timings: '08:00-23:00', amenities: { "Concert Acoustics": true, "Stage": true, "Piano": 2, "Microphones": 15, "AV System": true, "Lighting": true, "Green Rooms": 4, "WiFi": true, "Wheelchair Accessible": true } },
        { name: 'Media Lab Complex E14', loc: 'Building E14', cap: 400, timings: '08:00-21:00', amenities: { "Projectors": 4, "Modular Seating": true, "WiFi": true, "Power Outlets": 200, "AV System": true, "Microphones": 8, "Whiteboards": 10, "AC": true, "Catering Area": true } },
      ],
      transports: [
        { name: 'Tech Shuttle', start: 'Kendall Square', end: 'West Campus', stops: ['Kendall', 'Stata Center', 'Student Center', 'West Campus'] },
        { name: 'Boston Daytime', start: 'Mass Ave', end: 'Newbury St', stops: ['Mass Ave', 'Back Bay', 'Newbury St'] },
      ],
      eventTitles: ['MIT Energy Conference', 'HackMIT', 'Sloan Business Showcase', 'Robotics Demo Day']
    },
    {
      uni: {
        name: 'Indian Institute of Management Indore',
        slug: 'iim-indore',
        domain: 'iimidr.ac.in',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/82/IIM_Indore_Logo.png/220px-IIM_Indore_Logo.png',
        primaryColor: '#003366',
        allowedDomains: ['iimidr.ac.in'],
      },
      physical: [
        { name: 'Learning Centre Syndicate Room A', loc: 'Academic Block', cap: 8, timings: '08:00-02:00', amenities: { "Projector": 1, "Round Table": 1, "Chairs": 8, "WiFi": true, "LAN Ports": 8, "Whiteboard": 1, "AC": true, "Power Outlets": 8, "Video Conferencing": false } },
        { name: 'New Auditorium', loc: 'Academic Block', cap: 800, timings: '09:00-22:00', amenities: { "AV System": true, "Central AC": true, "Projector": 2, "Microphones": 10, "Stage": true, "Green Room": 2, "WiFi": true, "Wheelchair Accessible": true, "Cushioned Seats": 800 } },
        { name: 'Sports Complex Badminton Court 1', loc: 'Sports Complex', cap: 4, timings: '06:00-21:00', amenities: { "Wooden Floor": true, "Lighting": true, "Net": 1, "Umpire Chair": 1, "AC": false, "Exhaust Fans": true, "Water Cooler": 1, "Changing Room": 1, "Seating Area": true } },
      ],
      events: [
        { name: 'Open Air Theatre (OAT)', loc: 'Near MDC', cap: 1500, timings: '18:00-23:59', amenities: { "Stage": true, "Tiered Seating": true, "AV System": true, "Lighting": true, "Green Room": 2, "Projector": 0, "WiFi": false, "Power Outlets": 20, "Washrooms": 4 } },
        { name: 'MDC Conference Hall', loc: 'MDC Block', cap: 100, timings: '09:00-18:00', amenities: { "Executive Seating": 100, "Video Conferencing": true, "Projector": 2, "Microphones": 50, "WiFi": true, "AC": true, "Whiteboard": 2, "Catering Area": true, "Podium": 1 } },
      ],
      transports: [
        { name: 'Campus E-Rickshaw', start: 'Main Gate', end: 'Hostel Block', stops: ['Main Gate', 'Academic Block', 'Mess', 'Hostel Block'] },
        { name: 'City Bus Shuttle', start: 'Campus', end: 'Bhawarkuan', stops: ['Campus Gate', 'Rajiv Gandhi Square', 'Bhawarkuan'] },
      ],
      eventTitles: ['Iris Management Fest', 'Ranbhoomi Sports Fest', 'Utkarsha HR Summit', 'Utsaha Rural Marketing Fair']
    }
  ]

  const globalGeneratedStudentIds = new Set<string>()

  for (const uniProfile of universitiesData) {
    const university = await prisma.university.create({
      data: uniProfile.uni,
    })

    await prisma.user.create({
      data: {
        email: `admin@${uniProfile.uni.domain}`,
        name: `${uniProfile.uni.slug.toUpperCase()} Admin`,
        role: Role.ADMIN,
        universityId: university.id,
        password: passwordHash,
      },
    })

    const blackoutDate = new Date();
    blackoutDate.setDate(blackoutDate.getDate() + 15);
    await prisma.blackoutDate.create({
      data: {
        universityId: university.id,
        date: blackoutDate,
        reason: 'University Holiday / Maintenance'
      }
    })

    const facilities = []

    for (const phys of uniProfile.physical) {
      facilities.push(await prisma.facility.create({
        data: {
          name: phys.name,
          description: `Standard physical resource located at ${phys.loc}.`,
          type: FacilityType.PHYSICAL,
          location: phys.loc,
          universityId: university.id,
          capacity: phys.cap,
          operatingHours: phys.timings,
          amenities: phys.amenities,
          category: 'Academic/Recreation',
        },
      }))
    }

    for (const ev of uniProfile.events) {
      facilities.push(await prisma.facility.create({
        data: {
          name: ev.name,
          description: `Premium event venue at ${ev.loc}. Requires approval.`,
          type: FacilityType.EVENT,
          location: ev.loc,
          universityId: university.id,
          capacity: ev.cap,
          operatingHours: ev.timings,
          amenities: ev.amenities,
          category: 'Venue',
          requiresApproval: true,
        },
      }))
    }

    // skip amenities for transport since they aren't physical venues
    const transportFacilities = [];
    for (const tr of uniProfile.transports) {
      const f = await prisma.facility.create({
        data: {
          name: tr.name,
          description: `${tr.name} connecting ${tr.start} to ${tr.end}.`,
          type: FacilityType.TRANSPORT,
          universityId: university.id,
          capacity: 40,
          operatingHours: '07:00-21:00',
          startLocation: tr.start,
          endLocation: tr.end,
          transportConfig: { stops: tr.stops },
          requiresApproval: false,
        },
      })
      facilities.push(f)
      transportFacilities.push(f)
    }

    const students: any[] = []
    for (let i = 1; i <= 80; i++) {
      const nameObj = getRandomName()
      const format = getRandomInt(0, 2)
      let emailPrefix = ''
      if (format === 0) emailPrefix = `${nameObj.first.toLowerCase()}.${nameObj.last.toLowerCase()}`
      else if (format === 1) emailPrefix = `${nameObj.first.charAt(0).toLowerCase()}${nameObj.last.toLowerCase()}`
      else emailPrefix = `${nameObj.first.toLowerCase()}${getRandomInt(10, 99)}`
      
      const email = `${emailPrefix}@${uniProfile.uni.domain}`
      
      if (students.some(s => s.email === email)) continue;

      let studentId = generateStudentId(uniProfile.uni.slug)
      while (globalGeneratedStudentIds.has(studentId)) {
        studentId = generateStudentId(uniProfile.uni.slug)
      }
      globalGeneratedStudentIds.add(studentId)

      const student = await prisma.user.create({
        data: {
          email,
          name: nameObj.full,
          studentId,
          batch: getRandomElement(['2023', '2024', '2025', '2026']),
          role: Role.STUDENT,
          universityId: university.id,
          password: passwordHash,
        },
      })
      students.push(student)
    }

    for (let i = 0; i < 250; i++) {
      const student = getRandomElement(students)
      const facility = getRandomElement(facilities)
      
      const date = new Date()
      date.setDate(date.getDate() + getRandomInt(-15, 30))
      const hour = Math.floor(getGaussianRandom(14, 4))
      date.setHours(Math.max(6, Math.min(23, hour)), [0, 30][getRandomInt(0,1)], 0, 0)
      
      const endDate = new Date(date)
      endDate.setMinutes(date.getMinutes() + getRandomElement([30, 60, 90, 120]))

      let status: BookingStatus = BookingStatus.CONFIRMED
      const rand = Math.random()
      if (rand > 0.85) status = BookingStatus.PENDING
      else if (rand > 0.75) status = BookingStatus.CANCELLED
      else if (rand > 0.70) status = BookingStatus.REJECTED

      if (facility.type === FacilityType.TRANSPORT) status = BookingStatus.CONFIRMED

      const bookingData: any = {
        userId: student.id,
        facilityId: facility.id,
        universityId: university.id,
        startTime: date,
        endTime: endDate,
        status,
        ticketCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      }

      if (facility.type === FacilityType.TRANSPORT) {
        bookingData.pickupStop = (facility.transportConfig as any)?.stops?.[0] || facility.startLocation
        bookingData.dropoffStop = (facility.transportConfig as any)?.stops?.[(facility.transportConfig as any)?.stops?.length - 1] || facility.endLocation
        bookingData.seatNumber = getRandomInt(1, facility.capacity || 40)
      } else if (facility.type === FacilityType.PHYSICAL) {
        bookingData.guestCount = getRandomInt(1, Math.min(5, facility.capacity || 5))
        if (Math.random() > 0.8) bookingData.specialRequests = 'Need projector setup'
      }

      await prisma.booking.create({ data: bookingData })
    }

    for (let i = 0; i < 15; i++) {
      const student = getRandomElement(students)
      const facility = getRandomElement(facilities.filter(f => f.type === FacilityType.PHYSICAL))
      
      const date = new Date()
      date.setDate(date.getDate() + getRandomInt(1, 10))
      date.setHours(14, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(16, 0, 0, 0)

      await prisma.waitlist.create({
        data: {
          userId: student.id,
          facilityId: facility.id,
          universityId: university.id,
          startTime: date,
          endTime: endDate,
        }
      })
    }

    // kinda messy here but we gotta link the events to the locations properly
    const eventFacilities = facilities.filter(f => f.type === FacilityType.EVENT || f.type === FacilityType.PHYSICAL)

    for (const title of uniProfile.eventTitles) {
      const organizer = getRandomElement(students)
      const facility = getRandomElement(eventFacilities)
      
      const startTime = new Date()
      startTime.setDate(startTime.getDate() + getRandomInt(5, 45))
      startTime.setHours(getRandomInt(14, 18), 0, 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setHours(startTime.getHours() + getRandomInt(2, 6))

      const event = await prisma.event.create({
        data: {
          title,
          description: `Annual ${title} hosted at ${facility.name}. Expecting a great turnout. Please register early as seats are limited.`,
          startTime,
          endTime,
          location: facility.location || facility.name,
          facilityId: facility.id,
          universityId: university.id,
          organizerId: organizer.id,
          allowedBatches: Math.random() > 0.7 ? ['2024', '2025'] : [],
          capacity: Math.min(getRandomInt(100, 300), facility.capacity || 500),
          speakers: [
            { name: getRandomName().full, role: 'Keynote', bio: 'Industry Veteran and Distinguished Alumni' }
          ],
          resources: [
            { name: 'Schedule PDF', url: 'https://example.com/schedule.pdf' }
          ]
        }
      })

      const numRegistrations = getRandomInt(10, 40)
      const registeredStudents = new Set()
      
      for (let j = 0; j < numRegistrations; j++) {
        const attendee = getRandomElement(students)
        if (registeredStudents.has(attendee.id) || attendee.id === organizer.id) continue;
        registeredStudents.add(attendee.id)

        await prisma.eventRegistration.create({
          data: {
            eventId: event.id,
            userId: attendee.id,
            status: Math.random() > 0.1 ? RegistrationStatus.REGISTERED : RegistrationStatus.WAITLISTED
          }
        })
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
