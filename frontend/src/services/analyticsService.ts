export const analyticsService = {
  trackVisit: async (path: string) => {
    try {
      const isNewUser = !localStorage.getItem('returning_user');
      if (isNewUser) {
        localStorage.setItem('returning_user', 'true');
      }

      const deviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';

      await fetch('/api/analytics/track-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path,
          device_type: deviceType,
          is_new_user: isNewUser,
        }),
      });
    } catch (error) {
      console.error('Failed to track visit:', error);
    }
  },
};
