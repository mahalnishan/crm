# Setup Guide

## 🚀 Quick Setup Steps

### 1. Environment Setup
Create a `.env.local` file in your project root with your Supabase credentials:

```bash
# Copy this template and fill in your values
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL script

### 3. Start Development
```bash
npm run dev
```

## 🔧 Manual Setup

### Supabase Project Creation
1. Visit [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Choose organization
5. Enter project details
6. Wait for setup to complete

### Get API Keys
1. In your Supabase dashboard, go to Settings > API
2. Copy the Project URL
3. Copy the anon/public key
4. Copy the service_role key (keep this secret!)

### Database Schema
The `supabase/schema.sql` file contains:
- All necessary tables
- Row Level Security policies
- Proper indexes
- Data validation constraints

## 🚨 Common Issues

### "Invalid API key" error
- Check your `.env.local` file
- Ensure no extra spaces or quotes
- Restart your development server

### Database connection issues
- Verify your Supabase project is active
- Check if you're in the correct region
- Ensure your IP is not blocked

### Authentication not working
- Check browser console for errors
- Verify RLS policies are set up
- Ensure auth is enabled in Supabase

## 📱 Testing the Setup

1. Visit `http://localhost:3000`
2. You should be redirected to `/auth`
3. Create a new account
4. Sign in and access the dashboard

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Keep your service role key secret
- Use environment variables in production
- Enable Row Level Security in Supabase

## 🆘 Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review [Supabase docs](https://supabase.com/docs)
- Check [Next.js docs](https://nextjs.org/docs)
