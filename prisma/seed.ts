import { PrismaClient, Status, Severity } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { addDays, subDays, addHours } from 'date-fns';
import { FLEET_DATA, TRAILERS, DRIVERS } from '../src/lib/fleet-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with comprehensive mock data...');

  // Clear existing data
  console.log('🗑️ Clearing existing data...');
  await prisma.comment.deleteMany();
  await prisma.media.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.mapping.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared existing data');

  // Hash passwords per role
  const adminPassword = await bcrypt.hash('password123', 10);
  const opsPassword = await bcrypt.hash('password123', 10);
  const workshopPassword = await bcrypt.hash('password123', 10);
  const driverPassword = await bcrypt.hash('password123', 10);

  // Create users
  console.log('👥 Creating users...');
  const workshopUser = await prisma.user.upsert({
    where: { email: 'workshop@example.com' },
    update: {},
    create: {
      email: 'workshop@example.com',
      username: 'workshop',
      name: 'Workshop Team',
      password: workshopPassword,
      role: 'WORKSHOP',
    },
  });

  const opsUser = await prisma.user.upsert({
    where: { email: 'ops@example.com' },
    update: {},
    create: {
      email: 'ops@example.com',
      username: 'ops',
      name: 'Operations Team',
      password: opsPassword,
      role: 'OPERATIONS',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'driver@example.com' },
    update: {},
    create: {
      email: 'driver@example.com',
      username: 'driver',
      name: 'Test Driver',
      password: driverPassword,
      role: 'DRIVER',
      phone: '+61 412 345 678',
    },
  });

  console.log('✅ Created users');

  // Create driver mappings
  console.log('🚗 Creating driver mappings...');
  for (const driver of DRIVERS) {
    await prisma.mapping.upsert({
      where: {
        kind_key: {
          kind: 'driver',
          key: driver.name,
        },
      },
      update: {},
      create: {
        kind: 'driver',
        key: driver.name,
        value: JSON.stringify({ 
          phone: driver.phone,
          employeeId: driver.employeeId,
          status: driver.status
        }),
      },
    });
  }
  console.log('✅ Created driver mappings');

  // Create fleet mappings
  console.log('🚛 Creating fleet mappings...');
  for (const fleet of FLEET_DATA) {
    await prisma.mapping.upsert({
      where: {
        kind_key: {
          kind: 'fleet',
          key: fleet.fleetNumber,
        },
      },
      update: {},
      create: {
        kind: 'fleet',
        key: fleet.fleetNumber,
        value: JSON.stringify({ 
          rego: fleet.registration,
          type: fleet.type,
          status: fleet.status,
          location: fleet.location,
          driver: fleet.driver,
          phone: fleet.phone
        }),
      },
    });
  }
  console.log('✅ Created fleet mappings');

  // Create trailer mappings
  console.log('📦 Creating trailer mappings...');
  for (const trailer of TRAILERS) {
    await prisma.mapping.upsert({
      where: {
        kind_key: {
          kind: 'trailer',
          key: trailer.fleetNumber,
        },
      },
      update: {},
      create: {
        kind: 'trailer',
        key: trailer.fleetNumber,
        value: JSON.stringify({
          rego: trailer.registration,
          type: trailer.type,
          status: trailer.status,
          location: trailer.location
        }),
      },
    });
  }
  console.log('✅ Created trailer mappings');

  // Create comprehensive mock issues
  console.log('📋 Creating mock issues...');
  
  const issueTemplates = [
    {
      severity: 'CRITICAL',
      category: 'Brakes',
      description: 'Brake pedal goes to floor, no braking power. Emergency situation - vehicle cannot stop safely.',
      safeToContinue: 'No',
      location: 'M1 Southbound, Exit 49',
      status: 'PENDING',
    },
    {
      severity: 'HIGH',
      category: 'Engine',
      description: 'Engine overheating, temperature gauge in red zone. Coolant level appears normal but temperature keeps rising.',
      safeToContinue: 'No',
      location: 'Pacific Highway, Coffs Harbour',
      status: 'IN_PROGRESS',
    },
    {
      severity: 'HIGH',
      category: 'Tyres',
      description: 'Front left tyre has large bulge on sidewall. Looks like it could blow at any moment.',
      safeToContinue: 'No',
      location: 'Sydney Depot',
      status: 'SCHEDULED',
    },
    {
      severity: 'MEDIUM',
      category: 'Electrical',
      description: 'Dashboard warning lights flickering. Battery light comes on intermittently.',
      safeToContinue: 'Yes',
      location: 'Melbourne Depot',
      status: 'PENDING',
    },
    {
      severity: 'MEDIUM',
      category: 'Suspension',
      description: 'Loud clunking noise from rear suspension when going over bumps. Getting worse.',
      safeToContinue: 'Yes',
      location: 'Hume Highway, Goulburn',
      status: 'IN_PROGRESS',
    },
    {
      severity: 'LOW',
      category: 'Air Conditioning',
      description: 'AC not blowing cold air. Only warm air coming out.',
      safeToContinue: 'Yes',
      location: 'Brisbane Depot',
      status: 'COMPLETED',
    },
    {
      severity: 'CRITICAL',
      category: 'Steering',
      description: 'Steering wheel very loose, vehicle wandering all over the road. Feels dangerous.',
      safeToContinue: 'No',
      location: 'Bruce Highway, Rockhampton',
      status: 'SCHEDULED',
    },
    {
      severity: 'HIGH',
      category: 'Transmission',
      description: 'Gearbox slipping badly, especially in 5th and 6th gear. Burning smell.',
      safeToContinue: 'No',
      location: 'Adelaide Depot',
      status: 'PENDING',
    },
    {
      severity: 'MEDIUM',
      category: 'Lights',
      description: 'Headlights very dim, hard to see at night. Both low and high beam affected.',
      safeToContinue: 'Yes',
      location: 'Perth Depot',
      status: 'IN_PROGRESS',
    },
    {
      severity: 'LOW',
      category: 'Body Damage',
      description: 'Small dent in passenger door from loading dock incident. Cosmetic only.',
      safeToContinue: 'Yes',
      location: 'Darwin Depot',
      status: 'COMPLETED',
    },
    {
      severity: 'HIGH',
      category: 'Fuel System',
      description: 'Strong diesel smell in cabin. Possible fuel leak under vehicle.',
      safeToContinue: 'No',
      location: 'Newell Highway, Dubbo',
      status: 'PENDING',
    },
    {
      severity: 'MEDIUM',
      category: 'Exhaust',
      description: 'Loud exhaust noise, sounds like a hole in the muffler.',
      safeToContinue: 'Yes',
      location: 'Hobart Depot',
      status: 'SCHEDULED',
    },
    {
      severity: 'CRITICAL',
      category: 'Mechanical',
      description: 'Loud grinding noise from engine. Loss of power. Smoke from engine bay.',
      safeToContinue: 'No',
      location: 'Great Western Highway, Lithgow',
      status: 'IN_PROGRESS',
    },
    {
      severity: 'LOW',
      category: 'Interior',
      description: 'Driver seat adjustment broken, stuck in one position.',
      safeToContinue: 'Yes',
      location: 'Canberra Depot',
      status: 'PENDING',
    },
    {
      severity: 'MEDIUM',
      category: 'Wipers',
      description: 'Windscreen wipers not working properly, leaving streaks.',
      safeToContinue: 'Yes',
      location: 'Newcastle Depot',
      status: 'COMPLETED',
    },
  ];

  const issues = [];
  let ticketNumber = 1001;

  for (let i = 0; i < issueTemplates.length; i++) {
    const template = issueTemplates[i];
    const fleet = FLEET_DATA[i % FLEET_DATA.length];
    const driver = DRIVERS[i % DRIVERS.length];
    const trailer1 = TRAILERS[(i * 2) % TRAILERS.length];
    const trailer2 = TRAILERS[(i * 2 + 1) % TRAILERS.length];
    
    const daysAgo = Math.floor(i / 3);
    const createdAt = subDays(new Date(), daysAgo);

    const issue = await prisma.issue.create({
      data: {
        ticket: ticketNumber++,
        status: template?.status as Status,
        severity: template?.severity as Severity,
        category: template?.category || 'Other',
        description: template?.description || 'Issue description',
        safeToContinue: template?.safeToContinue ? 'Yes' : 'No',
        location: template?.location || 'Unknown location',
        fleetNumber: fleet?.fleetNumber || 'Unknown',
        primeRego: fleet?.registration || 'Unknown',
        trailerA: trailer1?.fleetNumber || '',
        trailerB: trailer2?.fleetNumber || '',
        driverName: driver?.name || 'Unknown Driver',
        driverPhone: driver?.phone || '',
        preferredFrom: addDays(createdAt, 1),
        preferredTo: addDays(createdAt, 3),
        createdAt,
        updatedAt: createdAt,
      },
    });

    issues.push(issue);

    // Add comments to some issues
    if (i % 3 === 0) {
      await prisma.comment.create({
        data: {
          issueId: issue.id,
          authorId: opsUser.id,
          body: 'Acknowledged. Assigning to workshop for immediate attention.',
          createdAt: addHours(createdAt, 1),
        },
      });
    }

    if (i % 4 === 0) {
      await prisma.comment.create({
        data: {
          issueId: issue.id,
          authorId: workshopUser.id,
          body: 'Parts ordered. Will schedule repair once parts arrive.',
          createdAt: addHours(createdAt, 3),
        },
      });
    }
  }

  console.log(`✅ Created ${issues.length} mock issues`);

  // Create work orders for scheduled issues
  console.log('📅 Creating work orders...');
  const scheduledIssues = issues.filter(i => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS');
  
  for (let i = 0; i < scheduledIssues.length; i++) {
    const issue = scheduledIssues[i];
    const startDate = addDays(new Date(), i + 1);
    const workshopSites = ['Melbourne', 'Sydney', 'Brisbane', 'Adelaide', 'Perth'];
    const workTypes = [
      'Engine Diagnostics & Repair',
      'Brake System Overhaul',
      'Tyre Replacement',
      'Electrical System Check',
      'Suspension Repair',
      'Transmission Service',
      'Steering System Repair',
    ];

    await prisma.workOrder.create({
      data: {
        issueId: issue?.id || '',
        status: issue?.status === 'SCHEDULED' ? 'SCHEDULED' : 'IN_PROGRESS',
        startAt: new Date(startDate.setHours(9, 0, 0, 0)),
        endAt: new Date(startDate.setHours(17, 0, 0, 0)),
        workshopSite: workshopSites[i % workshopSites.length],
        assignedToId: workshopUser.id,
        workType: workTypes[i % workTypes.length],
        notes: `Priority ${issue?.severity?.toLowerCase() || 'medium'} repair. ${issue?.category || 'General'} issue.`,
      },
    });
  }

  console.log(`✅ Created ${scheduledIssues.length} work orders`);

  console.log('🎉 Seeding complete!');
  console.log('\n📊 Summary:');
  console.log(`  - Users: 4`);
  console.log(`  - Drivers: ${DRIVERS.length}`);
  console.log(`  - Fleet Units: ${FLEET_DATA.length}`);
  console.log(`  - Trailers: ${TRAILERS.length}`);
  console.log(`  - Issues: ${issues.length}`);
  console.log(`  - Work Orders: ${scheduledIssues.length}`);
  console.log(`  - Comments: ${Math.floor(issues.length / 3) + Math.floor(issues.length / 4)}`);
  
  console.log('\n📋 Test Accounts:');
  console.log('  admin@example.com / password123');
  console.log('  ops@example.com / password123');
  console.log('  workshop@example.com / password123');
  console.log('\n🔑 Quick Access Passwords:');
  console.log('  Operations: SENATIONAL07');
  console.log('  Workshop: SENATIONAL04');
  console.log('  Admin: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

