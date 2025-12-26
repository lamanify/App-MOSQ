"use client";

import type { Mosque, CommitteeMember } from "@/lib/supabase/types";

interface AjkContentProps {
    mosque: Mosque;
    committee: CommitteeMember[];
}

export function AjkContent({ committee }: AjkContentProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {committee.map((member) => (
                <div
                    key={member.id}
                    className="group relative p-8 rounded-[2rem] bg-gray-50 hover:bg-white border border-brand/10 hover:border-brand/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center justify-center min-h-[160px]"
                >
                    <h3 className="font-heading font-bold text-2xl text-gray-900 mb-2 group-hover:text-brand transition-colors">
                        {member.name}
                    </h3>
                    <p className="text-brand font-bold text-lg uppercase tracking-wider">{member.role}</p>
                </div>
            ))}
        </div>
    );
}
