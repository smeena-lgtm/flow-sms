import { PrismaClient, UserRole, ProjectType, ProjectStatus, TaskStatus, TaskPriority, MilestoneStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Clean existing data
  await prisma.activity.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.document.deleteMany()
  await prisma.task.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()

  console.log("✅ Cleaned existing data")

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "swapnil@flow.life",
        name: "Swapnil Meena",
        role: UserRole.admin,
        department: "Management",
        phone: "+966 50 123 4567",
      },
    }),
    prisma.user.create({
      data: {
        email: "ahmed@flow.life",
        name: "Ahmed Al-Rashid",
        role: UserRole.project_manager,
        department: "Architecture",
        phone: "+966 50 234 5678",
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah@flow.life",
        name: "Sarah Hassan",
        role: UserRole.team_lead,
        department: "Engineering",
        phone: "+966 50 345 6789",
      },
    }),
    prisma.user.create({
      data: {
        email: "mohammed@flow.life",
        name: "Mohammed Khalid",
        role: UserRole.designer,
        department: "Interior Design",
        phone: "+966 50 456 7890",
      },
    }),
    prisma.user.create({
      data: {
        email: "fatima@flow.life",
        name: "Fatima Al-Saud",
        role: UserRole.engineer,
        department: "Structural",
        phone: "+966 50 567 8901",
      },
    }),
    prisma.user.create({
      data: {
        email: "omar@flow.life",
        name: "Omar Faisal",
        role: UserRole.designer,
        department: "Architecture",
        phone: "+966 50 678 9012",
      },
    }),
  ])

  console.log(`✅ Created ${users.length} users`)

  // Create Clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "Saudi Development Corp",
        email: "contact@saudidev.com",
        phone: "+966 11 123 4567",
        contactName: "Abdullah Al-Fahad",
        address: "King Fahd Road, Riyadh",
      },
    }),
    prisma.client.create({
      data: {
        name: "Riyadh Municipality",
        email: "projects@riyadh.gov.sa",
        phone: "+966 11 234 5678",
        contactName: "Nasser Al-Otaibi",
        address: "Municipality Building, Riyadh",
      },
    }),
    prisma.client.create({
      data: {
        name: "Al-Mamlaka Holdings",
        email: "development@almamlaka.com",
        phone: "+966 11 345 6789",
        contactName: "Khalid Al-Ibrahim",
        address: "Al-Mamlaka Tower, Riyadh",
      },
    }),
    prisma.client.create({
      data: {
        name: "Jeddah Investment Group",
        email: "info@jig.sa",
        phone: "+966 12 456 7890",
        contactName: "Salman Al-Harbi",
        address: "Corniche Road, Jeddah",
      },
    }),
  ])

  console.log(`✅ Created ${clients.length} clients`)

  // Create Projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Al-Mamlaka Tower",
        description: "Mixed-use high-rise development featuring office spaces, retail, and luxury apartments in central Riyadh.",
        type: ProjectType.architecture,
        status: ProjectStatus.active,
        clientId: clients[2].id,
        location: "Riyadh, Saudi Arabia",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2025-12-31"),
        budget: 45000000,
        progress: 65,
      },
    }),
    prisma.project.create({
      data: {
        name: "Riyadh Cultural Center",
        description: "A landmark cultural facility showcasing Saudi heritage with modern architectural elements.",
        type: ProjectType.architecture,
        status: ProjectStatus.active,
        clientId: clients[1].id,
        location: "Riyadh, Saudi Arabia",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2026-06-30"),
        budget: 78000000,
        progress: 35,
      },
    }),
    prisma.project.create({
      data: {
        name: "Desert Bloom Villas",
        description: "Sustainable residential community featuring 50 luxury villas with innovative desert landscaping.",
        type: ProjectType.mixed,
        status: ProjectStatus.active,
        clientId: clients[0].id,
        location: "Diriyah, Saudi Arabia",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2025-08-31"),
        budget: 32000000,
        progress: 80,
      },
    }),
    prisma.project.create({
      data: {
        name: "Jeddah Office Complex",
        description: "Modern office complex with Class A specifications and LEED certification target.",
        type: ProjectType.interior,
        status: ProjectStatus.planning,
        clientId: clients[3].id,
        location: "Jeddah, Saudi Arabia",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2025-12-31"),
        budget: 25000000,
        progress: 15,
      },
    }),
    prisma.project.create({
      data: {
        name: "Industrial Park Infrastructure",
        description: "Complete infrastructure design for a new industrial park including roads, utilities, and facilities.",
        type: ProjectType.engineering,
        status: ProjectStatus.on_hold,
        clientId: clients[0].id,
        location: "Dammam, Saudi Arabia",
        startDate: new Date("2024-04-01"),
        endDate: new Date("2026-03-31"),
        budget: 55000000,
        progress: 25,
      },
    }),
    prisma.project.create({
      data: {
        name: "Heritage Hotel Restoration",
        description: "Restoration and adaptive reuse of a historic building into a boutique heritage hotel.",
        type: ProjectType.interior,
        status: ProjectStatus.completed,
        clientId: clients[1].id,
        location: "Al-Ula, Saudi Arabia",
        startDate: new Date("2023-01-15"),
        endDate: new Date("2024-06-30"),
        budget: 18000000,
        progress: 100,
      },
    }),
  ])

  console.log(`✅ Created ${projects.length} projects`)

  // Add team members to projects
  await Promise.all([
    // Al-Mamlaka Tower team
    prisma.projectMember.create({ data: { projectId: projects[0].id, userId: users[1].id, role: "Project Manager" } }),
    prisma.projectMember.create({ data: { projectId: projects[0].id, userId: users[2].id, role: "Lead Engineer" } }),
    prisma.projectMember.create({ data: { projectId: projects[0].id, userId: users[4].id, role: "Structural Engineer" } }),
    prisma.projectMember.create({ data: { projectId: projects[0].id, userId: users[5].id, role: "Design Architect" } }),

    // Riyadh Cultural Center team
    prisma.projectMember.create({ data: { projectId: projects[1].id, userId: users[1].id, role: "Project Manager" } }),
    prisma.projectMember.create({ data: { projectId: projects[1].id, userId: users[3].id, role: "Interior Designer" } }),
    prisma.projectMember.create({ data: { projectId: projects[1].id, userId: users[5].id, role: "Lead Architect" } }),

    // Desert Bloom Villas team
    prisma.projectMember.create({ data: { projectId: projects[2].id, userId: users[2].id, role: "Project Manager" } }),
    prisma.projectMember.create({ data: { projectId: projects[2].id, userId: users[3].id, role: "Interior Designer" } }),
    prisma.projectMember.create({ data: { projectId: projects[2].id, userId: users[4].id, role: "Engineer" } }),

    // Jeddah Office Complex team
    prisma.projectMember.create({ data: { projectId: projects[3].id, userId: users[3].id, role: "Lead Designer" } }),
    prisma.projectMember.create({ data: { projectId: projects[3].id, userId: users[5].id, role: "Architect" } }),
  ])

  console.log("✅ Added project members")

  // Create Phases for Al-Mamlaka Tower
  const phases = await Promise.all([
    prisma.phase.create({
      data: {
        projectId: projects[0].id,
        name: "Schematic Design",
        description: "Initial design concepts and feasibility studies",
        order: 1,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-04-15"),
        progress: 100,
      },
    }),
    prisma.phase.create({
      data: {
        projectId: projects[0].id,
        name: "Design Development",
        description: "Detailed design and engineering coordination",
        order: 2,
        startDate: new Date("2024-04-16"),
        endDate: new Date("2024-08-31"),
        progress: 100,
      },
    }),
    prisma.phase.create({
      data: {
        projectId: projects[0].id,
        name: "Construction Documents",
        description: "Final drawings and specifications for construction",
        order: 3,
        startDate: new Date("2024-09-01"),
        endDate: new Date("2025-03-31"),
        progress: 60,
      },
    }),
    prisma.phase.create({
      data: {
        projectId: projects[0].id,
        name: "Construction Administration",
        description: "On-site supervision and construction support",
        order: 4,
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-12-31"),
        progress: 0,
      },
    }),
  ])

  console.log(`✅ Created ${phases.length} phases`)

  // Create Milestones
  const milestones = await Promise.all([
    prisma.milestone.create({
      data: {
        projectId: projects[0].id,
        name: "Schematic Design Review",
        description: "Client review and approval of schematic design",
        dueDate: new Date("2024-01-28"),
        status: MilestoneStatus.completed,
        completedAt: new Date("2024-01-26"),
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: projects[0].id,
        name: "MEP Coordination Complete",
        description: "All MEP systems coordinated with structure",
        dueDate: new Date("2024-01-24"),
        status: MilestoneStatus.overdue,
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: projects[1].id,
        name: "Client Presentation",
        description: "Present design concepts to stakeholders",
        dueDate: new Date("2024-01-30"),
        status: MilestoneStatus.pending,
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: projects[2].id,
        name: "Interior Material Selection",
        description: "Finalize all interior material specifications",
        dueDate: new Date("2024-02-01"),
        status: MilestoneStatus.in_progress,
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: projects[2].id,
        name: "Structural Analysis Complete",
        description: "Complete structural engineering analysis",
        dueDate: new Date("2024-01-25"),
        status: MilestoneStatus.completed,
        completedAt: new Date("2024-01-25"),
      },
    }),
  ])

  console.log(`✅ Created ${milestones.length} milestones`)

  // Create Tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        projectId: projects[0].id,
        phaseId: phases[2].id,
        title: "Complete floor plan drawings",
        description: "Finalize all floor plan drawings for levels 1-20",
        status: TaskStatus.in_progress,
        priority: TaskPriority.high,
        assigneeId: users[5].id,
        creatorId: users[1].id,
        dueDate: new Date("2024-02-15"),
        estimatedHours: 40,
      },
    }),
    prisma.task.create({
      data: {
        projectId: projects[0].id,
        phaseId: phases[2].id,
        title: "Structural calculations review",
        description: "Review and verify all structural calculations",
        status: TaskStatus.review,
        priority: TaskPriority.urgent,
        assigneeId: users[4].id,
        creatorId: users[2].id,
        dueDate: new Date("2024-02-10"),
        estimatedHours: 24,
        actualHours: 20,
      },
    }),
    prisma.task.create({
      data: {
        projectId: projects[1].id,
        title: "Concept sketches for main hall",
        description: "Create initial concept sketches for the main exhibition hall",
        status: TaskStatus.todo,
        priority: TaskPriority.medium,
        assigneeId: users[5].id,
        creatorId: users[1].id,
        dueDate: new Date("2024-02-20"),
        estimatedHours: 16,
      },
    }),
    prisma.task.create({
      data: {
        projectId: projects[2].id,
        title: "Landscape design finalization",
        description: "Complete landscape design for all villa types",
        status: TaskStatus.completed,
        priority: TaskPriority.high,
        assigneeId: users[3].id,
        creatorId: users[2].id,
        dueDate: new Date("2024-01-20"),
        completedAt: new Date("2024-01-19"),
        estimatedHours: 32,
        actualHours: 28,
      },
    }),
    prisma.task.create({
      data: {
        projectId: projects[3].id,
        title: "Space planning study",
        description: "Develop space planning options for client review",
        status: TaskStatus.in_progress,
        priority: TaskPriority.medium,
        assigneeId: users[3].id,
        creatorId: users[3].id,
        dueDate: new Date("2024-02-28"),
        estimatedHours: 20,
      },
    }),
  ])

  console.log(`✅ Created ${tasks.length} tasks`)

  // Create Activities
  await Promise.all([
    prisma.activity.create({
      data: {
        projectId: projects[0].id,
        userId: users[1].id,
        action: "uploaded_document",
        target: "Floor Plans Rev.3",
        details: { documentType: "drawing", fileSize: "15MB" },
      },
    }),
    prisma.activity.create({
      data: {
        projectId: projects[2].id,
        userId: users[2].id,
        action: "completed_milestone",
        target: "Structural Analysis Complete",
      },
    }),
    prisma.activity.create({
      data: {
        projectId: projects[2].id,
        userId: users[3].id,
        action: "added_comment",
        target: "Landscape design finalization",
        details: { comment: "Updated plant species list based on client feedback" },
      },
    }),
    prisma.activity.create({
      data: {
        projectId: projects[1].id,
        userId: users[4].id,
        action: "updated_status",
        target: "Riyadh Cultural Center",
        details: { oldStatus: "planning", newStatus: "active" },
      },
    }),
    prisma.activity.create({
      data: {
        projectId: projects[3].id,
        userId: users[5].id,
        action: "created_task",
        target: "Space planning study",
      },
    }),
  ])

  console.log("✅ Created activities")

  console.log("🎉 Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
