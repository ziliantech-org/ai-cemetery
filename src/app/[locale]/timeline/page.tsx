'use client';

import { useState } from 'react';
import type { AIModel } from '@/data/models';
import Header from '@/components/Header';
import TimelineView from '@/components/Timeline/TimelineView';
import ModelDetail from '@/components/Modal/ModelDetail';

export default function TimelinePage() {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  return (
    <main className="relative min-h-screen">
      <Header />
      <TimelineView onSelectModel={setSelectedModel} />

      {selectedModel && (
        <ModelDetail
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </main>
  );
}
