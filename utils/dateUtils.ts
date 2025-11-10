export const MONTH_NAMES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const getMonthYear = (date: Date): string => {
    // Use a reliable method with getMonth() to avoid locale string inconsistencies.
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Fecha Inválida';
    }
    const year = date.getFullYear();
    const monthIndex = date.getMonth(); // 0-11
    const formattedMonth = MONTH_NAMES_SHORT[monthIndex];
    return `${formattedMonth} ${year}`;
};

export const getMonthName = (date: Date): string => {
    const month = date.toLocaleString('es-ES', { month: 'long' });
    // Capitalize first letter of month name
    return month.charAt(0).toUpperCase() + month.slice(1);
};

export const getDayOfWeek = (dayIndex: number): string => {
    // Monday - Sunday : 0 - 6
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return days[dayIndex];
};

export const getWeekYear = (date: Date): string => {
    // Create a new date to avoid modifying the original date
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    // Return week number and year
    return `Sem ${weekNo.toString().padStart(2, '0')} ${d.getUTCFullYear()}`;
};

export const getDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};