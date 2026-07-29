import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { FileText, Calendar, Image as ImageIcon } from 'lucide-react';
import { Suspense } from 'react';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { GreetingSection } from '@/components/overview/greeting-section';


const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

async function OverviewContent() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const firstName = session?.user?.firstName ?? '';
  const role = session?.user?.role ?? '';



  return (
    <>
      {/* Greeting Section */}
      <div className="mb-8 border-b border-border pb-8">
        <GreetingSection greeting={getGreeting()} firstName={firstName} role={role} />
        <p className="text-sm text-muted-foreground">Welcome back to Clancy's Household System</p>
        <p className="mt-1 text-sm font-medium text-foreground">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

     

     

   
    </>
  );
}

function OverviewLoading() {
  return (
    <>
      Greeting Skeleton
      <div className="mb-8 border-b border-border pb-8">
        {/* <GreetingSkeleton /> */}
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-96 animate-pulse rounded bg-muted" />
      </div>

  

     
    </>
  );
}

export default function OverviewPage() {
  return (
    <main className="space-y-8 px-4 py-8 sm:px-6 md:px-8">
      <Suspense fallback={<OverviewLoading />}>
        <OverviewContent />
      </Suspense>
    </main>
  );
}
