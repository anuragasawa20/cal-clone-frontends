import { DAYS } from '@/constants/availability';

/**
 * Get default availability: Mon-Fri ON, Sat-Sun OFF, 9:00 AM - 5:00 PM
 */
export const getDefaultAvailability = () => ({
    0: { enabled: false, timeRanges: [{ startTime: '09:00', endTime: '17:00' }] }, // Sunday
    1: { enabled: true, timeRanges: [{ startTime: '09:00', endTime: '17:00' }] }, // Monday
    2: { enabled: true, timeRanges: [{ startTime: '09:00', endTime: '17:00' }] }, // Tuesday
    3: { enabled: true, timeRanges: [{ startTime: '09:00', endTime: '17:00' }] }, // Wednesday
    4: { enabled: true, timeRanges: [{ startTime: '09:00', endTime: '17:00' }] }, // Thursday
    5: { enabled: true, timeRanges: [{ startTime: '09:00', endTime: '17:00' }] }, // Friday
    6: { enabled: false, timeRanges: [{ startTime: '09:00', endTime: '17:00' }] }, // Saturday
});

/**
 * Format time string to 12-hour format
 */
const formatTime = (time) => {
    try {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const mins = minutes || '00';
        return `${displayHour}:${mins} ${ampm}`;
    } catch {
        return time;
    }
};

/**
 * Get summary text for availability schedule
 */
export const getSummaryText = (availability) => {
    const enabledDays = DAYS.filter(day => availability[day.value]?.enabled);
    if (enabledDays.length === 0) return ['No availability set'];

    const ranges = [];
    let currentRange = null;

    enabledDays.forEach((day) => {
        const timeRange = availability[day.value]?.timeRanges[0];
        if (!timeRange) return;

        const timeStr = `${formatTime(timeRange.startTime)} - ${formatTime(timeRange.endTime)}`;

        if (!currentRange || currentRange.time !== timeStr) {
            if (currentRange) ranges.push(currentRange);
            currentRange = { days: [day.label], time: timeStr };
        } else {
            currentRange.days.push(day.label);
        }
    });

    if (currentRange) ranges.push(currentRange);

    return ranges.map(r => {
        let dayStr;
        if (r.days.length === 1) {
            dayStr = r.days[0];
        } else if (r.days.length === 2) {
            dayStr = `${r.days[0]} - ${r.days[1]}`;
        } else {
            // Check if days are consecutive
            const firstDay = DAYS.findIndex(d => d.label === r.days[0]);
            const lastDay = DAYS.findIndex(d => d.label === r.days[r.days.length - 1]);
            if (lastDay - firstDay === r.days.length - 1) {
                dayStr = `${r.days[0]} - ${r.days[r.days.length - 1]}`;
            } else {
                dayStr = r.days.join(', ');
            }
        }
        return `${dayStr}: ${r.time}`;
    });
};

/**
 * Convert backend time format (HH:MM:SS) to frontend format (HH:MM)
 */
const convertTimeToFrontend = (time) => {
    if (!time) return '09:00';
    // If already in HH:MM format, return as is
    if (time.match(/^\d{2}:\d{2}$/)) return time;
    // Convert from HH:MM:SS to HH:MM
    return time.substring(0, 5);
};

/**
 * Convert frontend time format (HH:MM) to backend format (HH:MM:SS)
 */
const convertTimeToBackend = (time) => {
    if (!time) return '09:00:00';
    // If already in HH:MM:SS format, return as is
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) return time;
    // Convert from HH:MM to HH:MM:SS
    return `${time}:00`;
};

/**
 * Convert backend day_of_week (1-7, Monday=1, Sunday=7) to frontend day key (0-6, Sunday=0, Monday=1)
 */
const convertDayToFrontend = (dayOfWeek) => {
    // Backend: 1=Monday, 2=Tuesday, ..., 7=Sunday
    // Frontend: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
    return dayOfWeek === 7 ? 0 : dayOfWeek;
};

/**
 * Convert frontend day key (0-6, Sunday=0, Monday=1) to backend day_of_week (1-7, Monday=1, Sunday=7)
 */
const convertDayToBackend = (dayKey) => {
    // Frontend: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
    // Backend: 1=Monday, 2=Tuesday, ..., 7=Sunday
    return dayKey === 0 ? 7 : dayKey;
};

/**
 * Transform availability data from API format to frontend format
 * @param {Object} apiAvailability - Availability data from API
 * @returns {Object} - Transformed availability in frontend format
 */
export function transformAvailabilityFromAPI(apiAvailability) {
    if (!apiAvailability) return null;

    // Initialize all days with disabled state and default time range
    const availability = {};
    for (let i = 0; i <= 6; i++) {
        availability[i] = {
            enabled: false,
            timeRanges: [{ startTime: '09:00', endTime: '17:00' }]
        };
    }

    // Transform intervals from backend format
    if (apiAvailability.intervals && Array.isArray(apiAvailability.intervals)) {
        // Group intervals by day
        const intervalsByDay = {};
        apiAvailability.intervals.forEach(interval => {
            const frontendDay = convertDayToFrontend(interval.day_of_week);
            if (!intervalsByDay[frontendDay]) {
                intervalsByDay[frontendDay] = [];
            }
            intervalsByDay[frontendDay].push({
                startTime: convertTimeToFrontend(interval.start_time),
                endTime: convertTimeToFrontend(interval.end_time)
            });
        });

        // Set enabled days and their time ranges
        Object.keys(intervalsByDay).forEach(day => {
            const dayNum = parseInt(day);
            availability[dayNum] = {
                enabled: true,
                timeRanges: intervalsByDay[dayNum]
            };
        });
    }

    return {
        id: apiAvailability.id,
        name: apiAvailability.name || '',
        timezone: apiAvailability.timezone || 'UTC',
        availability
    };
}

/**
 * Transform availability data from frontend format to API format
 * @param {Object} frontendAvailability - Availability object with day keys (0-6)
 * @param {string} name - Availability name
 * @param {string} timezone - Timezone
 * @returns {Object} - Transformed availability for API
 */
export function transformAvailabilityToAPI(frontendAvailability, name, timezone) {
    const intervals = [];

    // Extract intervals from enabled days
    Object.keys(frontendAvailability).forEach(dayKey => {
        const day = parseInt(dayKey);
        const dayData = frontendAvailability[day];

        if (dayData && dayData.enabled && dayData.timeRanges && Array.isArray(dayData.timeRanges)) {
            dayData.timeRanges.forEach(range => {
                if (range.startTime && range.endTime) {
                    intervals.push({
                        day_of_week: convertDayToBackend(day),
                        start_time: convertTimeToBackend(range.startTime),
                        end_time: convertTimeToBackend(range.endTime)
                    });
                }
            });
        }
    });

    return {
        name,
        timezone: timezone || 'UTC',
        intervals
    };
}

/**
 * Transform array of availabilities from API format to frontend format
 * @param {Array} apiAvailabilities - Array of availability data from API
 * @returns {Array} - Transformed availabilities
 */
export function transformAvailabilitiesFromAPI(apiAvailabilities) {
    if (!Array.isArray(apiAvailabilities)) return [];
    return apiAvailabilities.map(avail => transformAvailabilityFromAPI(avail));
}

