'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import JoinMeetingModal from '@/components/JoinMeetingModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';

function JoinContent() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-gray-100">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <JoinMeetingModal
            isOpen={isModalOpen}
            onClose={() => router.push('/dashboard')}
          />
        </main>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <ProtectedRoute>
      <JoinContent />
    </ProtectedRoute>
  );
}
