# Work Order Management System

A modern, full-stack work order management system built for contractors and service businesses. Built with Next.js 15, Supabase, and TypeScript.

## 🚀 Features

### 📋 Work Orders Management
- Create, edit, and delete work orders
- Assign orders to workers or self
- Schedule orders with date/time
- Track order status and payment status
- Multiple services per order with quantities

### 👥 Clients Management
- Add, edit, and delete clients
- Contact information (name, email, phone, address)
- Client types (Individual, Company, Cash, Contractor, etc.)
- Active/Inactive status management
- Search and filter clients by status
- Only active clients appear in order creation

### 🛠️ Services Management
- Create and manage service offerings
- Set pricing for each service
- Search and filter services

### 👷 Workers Management
- Add, edit, and delete workers
- Assign workers to orders
- Contact information management

### ⚙️ Settings
- Account preferences
- Default order status
- Workers management

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS v4, ShadCN UI
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd crm
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

#### Create a new Supabase project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key

#### Set up the database
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script

### 4. Environment variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The system uses the following main tables:

- **users**: User authentication and profiles
- **clients**: Client information and contact details
- **services**: Available services with pricing
- **workers**: Worker information and status
- **work_orders**: Main work order records
- **work_order_services**: Services included in each work order

All tables include Row Level Security (RLS) policies for data protection.

## 🔐 Authentication

The system uses Supabase Auth with:
- Email/password authentication
- Protected routes
- User session management
- Automatic redirects based on auth state

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Collapsible sidebar navigation
- Touch-friendly interface
- Optimized for all screen sizes

## 🎨 UI Components

Built with ShadCN UI components:
- Modern, accessible design
- Dark/light mode support
- Consistent design system
- Customizable theme

## 🚧 Development

### Project Structure
```
crm/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # Reusable components
│   ├── ui/                # ShadCN UI components
│   ├── dashboard-layout.tsx
│   └── protected-route.tsx
├── lib/                   # Utility functions
│   ├── auth-context.tsx   # Authentication context
│   ├── supabase.ts        # Supabase client
│   └── types.ts           # TypeScript types
├── supabase/              # Database schema
│   └── schema.sql         # SQL setup script
└── public/                # Static assets
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- Protected API routes
- User authentication required for all dashboard access
- Secure session management

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the Supabase documentation
- Review Next.js documentation

## 🔮 Roadmap

Future features planned:
- [ ] Invoice generation
- [ ] Payment processing integration
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Multi-tenant support
- [ ] API endpoints for external integrations
