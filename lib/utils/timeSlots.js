/**
 * Check if a day-of-week has any availability intervals
 * @param {Object} availability - Availability object with intervals
 * @param {number} dayOfWeek - Day of week (0-6, where 0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @returns {boolean} - True if the day has availability intervals
 */
export function hasAvailabilityForDay(availability, dayOfWeek) {
    if (!availability || !availability.intervals || !Array.isArray(availability.intervals)) {
        return false;
    }

    // Convert frontend day-of-week (0-6, Sunday=0) to backend format (1-7, Monday=1, Sunday=7)
    const backendDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    // Check if any intervals exist for this day
    return availability.intervals.some(interval => interval.day_of_week === backendDayOfWeek);
}

/**
 * Get all days-of-week that have availability intervals
 * @param {Object} availability - Availability object with intervals
 * @returns {Array<number>} - Array of day-of-week values (0-6) that have availability
 */
export function getDaysWithAvailability(availability) {
    if (!availability || !availability.intervals || !Array.isArray(availability.intervals)) {
        return [];
    }

    // Get unique day_of_week values from intervals
    const backendDays = [...new Set(availability.intervals.map(interval => interval.day_of_week))];

    // Convert backend format (1-7, Monday=1, Sunday=7) to frontend format (0-6, Sunday=0, Monday=1)
    return backendDays.map(backendDay => backendDay === 7 ? 0 : backendDay);
}

/**
 * Generate time slots from availability intervals for a specific date
 * @param {Object} availability - Availability object with intervals
 * @param {Date} date - Selected date
 * @param {number} duration - Event duration in minutes
 * @param {Date} now - Current date/time (for filtering past slots)
 * @returns {Array<Date>} - Array of available time slot dates
 */
export function generateTimeSlotsFromAvailability(availability, date, duration = 30, now = new Date()) {
    if (!availability || !availability.intervals || !Array.isArray(availability.intervals)) {
        return [];
    }

    const slots = [];
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    // Backend uses 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
    const dayOfWeek = selectedDate.getDay(); // 0-6 (Sunday = 0)
    // Convert to backend format: 1 = Monday, 7 = Sunday
    const backendDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    // Find intervals for this day
    const dayIntervals = availability.intervals.filter(
        interval => interval.day_of_week === backendDayOfWeek
    );

    if (dayIntervals.length === 0) {
        return [];
    }

    // Generate slots for each interval
    dayIntervals.forEach(interval => {
        // Parse time - handle both "HH:MM:SS" and "HH:MM" formats
        const startParts = interval.start_time.split(':');
        const endParts = interval.end_time.split(':');

        const startHour = parseInt(startParts[0], 10);
        const startMinute = parseInt(startParts[1] || '0', 10);
        const endHour = parseInt(endParts[0], 10);
        const endMinute = parseInt(endParts[1] || '0', 10);

        // Validate parsed times
        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
            console.warn('Invalid time format in interval:', interval);
            return; // Skip this interval
        }

        // Create start and end times for this date
        const intervalStart = new Date(selectedDate);
        intervalStart.setHours(startHour, startMinute, 0, 0);

        const intervalEnd = new Date(selectedDate);
        intervalEnd.setHours(endHour, endMinute, 0, 0);

        // Handle edge case: if end time is before start time (shouldn't happen due to backend validation, but handle gracefully)
        if (intervalEnd <= intervalStart) {
            console.warn('Invalid interval: end time is before or equal to start time', interval);
            return; // Skip this interval
        }

        // Generate slots based on event duration (2min, 5min, 15min, 30min, etc.)
        // Validate duration: must be positive number, default to 15 if invalid
        const slotInterval = (duration && duration > 0) ? duration : 15;
        let currentSlot = new Date(intervalStart);

        // Check if selected date is today
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const isToday = selectedDate.getTime() === today.getTime();

        while (currentSlot < intervalEnd) {
            // Check if adding duration would exceed the interval end
            const slotEnd = new Date(currentSlot);
            slotEnd.setMinutes(slotEnd.getMinutes() + duration);

            if (slotEnd <= intervalEnd) {
                // Only filter past times if the selected date is today
                // For future dates, all times within the interval are available
                if (isToday) {
                    // For today, only add slots that are in the future
                    // Add a 5-minute buffer to avoid booking too close to current time
                    const bufferTime = new Date(now);
                    bufferTime.setMinutes(bufferTime.getMinutes() + 5);
                    if (currentSlot >= bufferTime) {
                        slots.push(new Date(currentSlot));
                    }
                } else {
                    // For future dates, all slots are available
                    slots.push(new Date(currentSlot));
                }
            }

            // Move to next slot
            currentSlot.setMinutes(currentSlot.getMinutes() + slotInterval);
        }
    });

    // Sort slots by time
    slots.sort((a, b) => a.getTime() - b.getTime());

    return slots;
}

/**
 * Filter out already booked time slots
 * @param {Array<Date>} timeSlots - Available time slots
 * @param {Array} existingBookings - Existing bookings for the date
 * @param {number} duration - Event duration in minutes
 * @returns {Array<Date>} - Filtered time slots
 */
export function filterBookedSlots(timeSlots, existingBookings, duration) {
    if (!existingBookings || existingBookings.length === 0) {
        return timeSlots;
    }

    return timeSlots.filter(slot => {
        // Ensure slot is a Date object - slots are created in local timezone
        const slotStart = slot instanceof Date ? new Date(slot.getTime()) : new Date(slot);
        const slotEnd = new Date(slotStart.getTime());
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);

        // Get slot timestamps (JavaScript Date stores internally as UTC milliseconds)
        const slotStartTime = slotStart.getTime();
        const slotEndTime = slotEnd.getTime();

        // Check if this slot conflicts with any existing booking
        return !existingBookings.some(booking => {
            // Skip cancelled bookings (check both status and booking_status fields)
            const bookingStatus = booking.booking_status || booking.status;
            if (bookingStatus === 'cancelled') return false;

            // Validate booking has required time fields
            if (!booking.start_time || !booking.end_time) {
                console.warn('Booking missing start_time or end_time:', booking);
                return false; // Skip invalid bookings
            }

            // Parse booking times - these are ISO strings from the API (stored in UTC)
            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);

            // Validate booking times are valid dates
            if (isNaN(bookingStart.getTime()) || isNaN(bookingEnd.getTime())) {
                console.warn('Invalid booking times:', booking);
                return false; // Skip invalid bookings
            }

            // Get booking timestamps
            const bookingStartTime = bookingStart.getTime();
            const bookingEndTime = bookingEnd.getTime();

            // Check for overlap using timestamps (timezone-agnostic comparison)
            // Slot overlaps booking if:
            // - Slot starts during the booking, OR
            // - Slot ends during the booking, OR
            // - Slot completely contains the booking
            const hasOverlap = (
                (slotStartTime >= bookingStartTime && slotStartTime < bookingEndTime) ||
                (slotEndTime > bookingStartTime && slotEndTime <= bookingEndTime) ||
                (slotStartTime <= bookingStartTime && slotEndTime >= bookingEndTime)
            );

            if (hasOverlap) {
                console.log('Slot conflicts with booking:', {
                    slotTime: slotStart.toISOString(),
                    slotEndTime: slotEnd.toISOString(),
                    bookingStart: bookingStart.toISOString(),
                    bookingEnd: bookingEnd.toISOString()
                });
            }

            return hasOverlap;
        });
    });
}

