'use client';

import { useState } from 'react';
import type { AIModel } from '@/data/models';
import Header from '@/components/Header';
import CemeteryScene from '@/components/Cemetery/CemeteryScene';
import GlobalCounter from '@/components/GlobalCounter';
import ModelDetail from '@/components/Modal/ModelDetail';

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  return (
    <main className="relative">
      <Header />

      <CemeteryScene onSelectModel={setSelectedModel} />

      {/* Global visitor counter */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
        <GlobalCounter />
      </div>

      {/* Model detail modal */}
      {selectedModel && (
        <ModelDetail
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </main>
  );
}
