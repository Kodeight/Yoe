import React from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { QuickActionGrid } from '../components/QuickActionGrid';
import { ContinueLearningCard } from '../components/ContinueLearningCard';
import { DailyGoalsCard } from '../components/DailyGoalsCard';

export const HomeView: React.FC = () => {
  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-300">
      <HeroBanner />
      <QuickActionGrid />
      <ContinueLearningCard />
      <DailyGoalsCard />
    </div>
  );
};
