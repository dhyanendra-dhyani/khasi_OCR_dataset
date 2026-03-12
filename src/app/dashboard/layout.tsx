import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
