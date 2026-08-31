export const getStatusBadgeClasses = (color?: string) => {
  switch (color?.toLowerCase()) {
    case 'green': 
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800';
    case 'blue': 
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800';
    case 'orange': 
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800';
    case 'red': 
      return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-400 dark:border-rose-800';
    case 'gray': 
    default: 
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

export const getStatusDotClasses = (color?: string) => {
  switch (color?.toLowerCase()) {
    case 'green': return 'bg-emerald-500';
    case 'blue': return 'bg-blue-500';
    case 'orange': return 'bg-amber-500';
    case 'red': return 'bg-rose-500';
    case 'gray': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};
