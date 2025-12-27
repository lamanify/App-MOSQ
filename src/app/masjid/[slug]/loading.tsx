// Loading skeleton for tenant pages
// This provides instant feedback while the page loads

export default function TenantLoading() {
    return (
        <div className="min-h-screen bg-white animate-pulse">
            {/* Header skeleton */}
            <header className="h-16 bg-gray-50 border-b border-gray-100" />

            {/* Hero skeleton */}
            <section className="h-[85vh] bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
                    {/* Badge skeleton */}
                    <div className="inline-block w-40 h-8 bg-gray-200 rounded-full mx-auto" />

                    {/* Title skeleton */}
                    <div className="space-y-4">
                        <div className="w-3/4 h-16 bg-gray-200 rounded-2xl mx-auto" />
                        <div className="w-1/2 h-8 bg-gray-100 rounded-xl mx-auto" />
                    </div>

                    {/* Buttons skeleton */}
                    <div className="flex justify-center gap-4 pt-8">
                        <div className="w-40 h-14 bg-gray-200 rounded-full" />
                        <div className="w-40 h-14 bg-gray-100 rounded-full" />
                    </div>
                </div>
            </section>

            {/* Prayer times skeleton */}
            <section className="py-8 px-4 -mt-24">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/80 rounded-[2.5rem] border border-gray-100 p-4 shadow-sm">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-6 rounded-[2rem] bg-gray-50 min-h-[160px]">
                                    <div className="w-20 h-4 bg-gray-200 rounded mb-4" />
                                    <div className="w-24 h-10 bg-gray-200 rounded mt-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content sections skeleton */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="w-48 h-12 bg-gray-200 rounded-xl mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-50 rounded-[2rem] p-8 h-64" />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
