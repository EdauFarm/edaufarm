'use client';

import { useState, useEffect } from 'react';
import WelcomeTutorial from '@/components/WelcomeTutorial';

export default function WelcomeTutorialWrapper() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if user has been guided before
    const hasBeenGuided = localStorage.getItem('edaufarm-tutorial-guided');
    const completedDate = localStorage.getItem('edaufarm-tutorial-completed-date');

    // Show tutorial for new users who haven't been guided
    if (!hasBeenGuided) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Optional: Show tutorial again after 90 days for users who skipped
    if (hasBeenGuided === 'skipped' && completedDate) {
      const completedTime = new Date(completedDate).getTime();
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      if (now - completedTime > ninetyDays) {
        setShowTutorial(true);
      }
    }
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  if (!showTutorial) return null;

  return <WelcomeTutorial onClose={handleCloseTutorial} />;
}