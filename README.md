# Infirmary Portal Setup Guide

## 🏥 IIIT Delhi Infirmary Management System

This is a complete Role-Based Access Control (RBAC) system for managing college infirmary operations.

## 🚀 Quick Start

### 1. Database Setup

1. **Set up PostgreSQL** (or use any PostgreSQL cloud service like Neon, Supabase, etc.)

2. **Update your `.env` file** with your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/infirmary_portal?schema=public"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Migration & Seeding

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - it will automatically redirect to the login page.

## 👥 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@iiitd.ac.in | admin123 |
| **Doctor** | dr.smith@iiitd.ac.in | doctor123 |
| **Doctor** | dr.johnson@iiitd.ac.in | doctor123 |
| **Student** | john.doe@iiitd.ac.in | student123 |
| **Student** | jane.smith@iiitd.ac.in | student123 |

## 🔐 Security Features

### Authentication
- ✅ NextAuth.js with credential provider
- ✅ Secure password hashing with bcrypt
- ✅ JWT-based sessions
- ✅ Session management

### Authorization (RBAC)
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Frontend route guards
- ✅ Permission-based UI rendering

### Audit & Security
- ✅ Comprehensive audit logging
- ✅ IP address and user agent tracking
- ✅ Input validation
- ✅ SQL injection protection (Prisma ORM)

## 🛠️ Available APIs

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Users Management (Admin Only)
- `GET /api/users` - List all users
- `GET /api/users?role=STUDENT` - Filter users by role
- `POST /api/users` - Create new user

### Appointments
- `GET /api/appointments` - Get appointments (role-filtered)
- `POST /api/appointments` - Create appointment
- `GET /api/appointments?date=2024-01-01` - Filter by date
- `GET /api/appointments?status=PENDING` - Filter by status

## 📊 Database Schema

### Core Models
- **User** - Students, Doctors, Admins
- **Appointment** - Appointment scheduling
- **Prescription** - Medical prescriptions
- **Medicine** - Pharmacy inventory
- **DoctorLeave** - Doctor availability management
- **AuditLog** - Security and activity tracking

### Relationships
- Users can have multiple appointments (student/doctor)
- Appointments can have prescriptions
- Prescriptions contain multiple medications
- All actions are logged for audit

## 🏗️ Project Structure

```
app/
├── api/
│   ├── auth/[...nextauth]/     # NextAuth.js endpoints
│   ├── users/                  # User management APIs
│   └── appointments/           # Appointment APIs
├── admin/                      # Admin dashboard
├── doctor/                     # Doctor dashboard
├── student/                    # Student dashboard
└── login/                      # Authentication

components/
├── auth/                       # Authentication components
└── ui/                         # UI components

lib/
├── auth.ts                     # NextAuth configuration
├── rbac.ts                     # RBAC middleware
├── audit.ts                    # Audit logging
└── prisma.ts                   # Database client

prisma/
├── schema.prisma               # Database schema
└── seed.ts                     # Sample data seeding
```

## 🔧 Development Commands

```bash
# Development
npm run dev                     # Start development server
npm run build                   # Build for production
npm run start                   # Start production server

# Database
npm run db:generate             # Generate Prisma client
npm run db:push                 # Push schema to database
npm run db:migrate              # Create and run migrations
npm run db:seed                 # Seed database with sample data
npm run db:studio               # Open Prisma Studio
```

## 🚀 Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Update `NEXTAUTH_SECRET` with strong random string
- [ ] Set up proper environment variables
- [ ] Enable HTTPS
- [ ] Configure proper CORS policies
- [ ] Set up rate limiting

### Database
- [ ] Use production PostgreSQL database
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Monitor database performance

### Application
- [ ] Remove demo credentials from login page
- [ ] Set up proper error monitoring
- [ ] Configure logging
- [ ] Set up health checks

## 📝 Next Steps

1. **Implement remaining features:**
   - Medicine inventory management
   - Prescription creation and management
   - Doctor leave management
   - Advanced reporting

2. **Enhanced security:**
   - Rate limiting
   - CAPTCHA for login
   - Multi-factor authentication
   - Password policies

3. **User experience:**
   - Email notifications
   - Real-time updates
   - Mobile responsiveness
   - Offline support

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists
- Verify user permissions

### Authentication Issues
- Check `NEXTAUTH_SECRET` is set
- Verify callback URLs
- Check session configuration
- Ensure proper role assignments

### Permission Issues
- Verify user roles in database
- Check RBAC middleware implementation
- Ensure proper route protection
- Validate frontend role guards
