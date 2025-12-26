import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Welcome Banner Skeleton */}
            <div className="glass-card p-6 md:p-8">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="stat-card">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="glass-card p-6">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="w-12 h-12 rounded-2xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-card-dark p-6">
                    <Skeleton className="h-6 w-40 bg-gray-700 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="w-4 h-4 bg-gray-700" />
                                <div className="space-y-1 flex-1">
                                    <Skeleton className="h-4 w-full bg-gray-700" />
                                    <Skeleton className="h-3 w-20 bg-gray-700" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
