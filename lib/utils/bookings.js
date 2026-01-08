/**
 * Transform booking data from API format to frontend format
 * @param {Object} apiBooking - Booking data from API
 * @returns {Object} - Transformed booking for frontend
 */
export function transformBookingFromAPI(apiBooking) {
    if (!apiBooking) return null;

    // Extract event type information
    const eventType = apiBooking.event_type || {};
    const eventName = eventType.name || 'Meeting';

    // Construct participants string
    const hostName = 'Host'; // Default, can be enhanced later
    const clientName = apiBooking.name || 'Guest';
    const participants = `You and ${clientName}`;

    // Map booking_status to status
    const status = apiBooking.booking_status || 'confirmed';

    // Format dates - backend returns ISO strings
    const startTime = apiBooking.start_time ? new Date(apiBooking.start_time) : null;
    const endTime = apiBooking.end_time ? new Date(apiBooking.end_time) : null;
    const date = apiBooking.date || (startTime ? startTime.toISOString().split('T')[0] : null);

    return {
        id: apiBooking.id,
        eventName: eventName,
        eventTypeId: apiBooking.event_type_id,
        eventType: eventType,
        date: date,
        startTime: startTime ? startTime.toISOString() : null,
        endTime: endTime ? endTime.toISOString() : null,
        clientName: apiBooking.name || '',
        clientEmail: apiBooking.client_email || '',
        name: apiBooking.name || '', // Alias for clientName
        additionalNotes: apiBooking.additional_notes || '',
        meetingLink: apiBooking.meeting_link || apiBooking.meeting_link || 'https://cal.com/video',
        status: status,
        bookingStatus: status, // Keep both for compatibility
        participants: participants,
        hostName: hostName,
        hostEmail: '', // Can be added later if available
        location: apiBooking.location || 'Cal Video',
        locationUrl: apiBooking.meeting_link || 'https://cal.com/video',
        timezone: apiBooking.timezone || 'UTC',
        createdAt: apiBooking.created_at,
        updatedAt: apiBooking.updated_at
    };
}

/**
 * Transform booking data from frontend format to API format
 * @param {Object} frontendBooking - Booking data from frontend
 * @returns {Object} - Transformed booking for API
 */
export function transformBookingToAPI(frontendBooking) {
    if (!frontendBooking) return null;

    return {
        event_type_id: frontendBooking.eventTypeId || frontendBooking.event_type_id,
        name: frontendBooking.name || frontendBooking.clientName,
        client_email: frontendBooking.clientEmail || frontendBooking.email,
        additional_notes: frontendBooking.additionalNotes || frontendBooking.additional_notes || null,
        start_time: frontendBooking.startTime || frontendBooking.start_time,
        end_time: frontendBooking.endTime || frontendBooking.end_time,
        date: frontendBooking.date,
        meeting_link: frontendBooking.meetingLink || frontendBooking.meeting_link || null,
        booking_status: frontendBooking.bookingStatus || frontendBooking.status || 'confirmed'
    };
}

/**
 * Transform array of bookings from API format to frontend format
 * @param {Array} apiBookings - Array of booking data from API
 * @returns {Array} - Array of transformed bookings for frontend
 */
export function transformBookingsFromAPI(apiBookings) {
    if (!Array.isArray(apiBookings)) return [];
    return apiBookings.map(booking => transformBookingFromAPI(booking));
}

/**
 * Create booking data for API from form data and event type
 * @param {Object} formData - Form data (name, email, additionalNotes)
 * @param {Object} eventType - Event type object with id
 * @param {Date} selectedDate - Selected date
 * @param {Date} selectedTime - Selected time
 * @returns {Object} - Booking data ready for API
 */
export function createBookingDataFromForm(formData, eventType, selectedDate, selectedTime) {
    if (!eventType || !eventType.id) {
        throw new Error('Event type is required');
    }

    if (!selectedDate || !selectedTime) {
        throw new Error('Date and time are required');
    }

    // Combine date and time for start_time
    const startTime = new Date(selectedDate);
    startTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

    // Calculate end_time based on duration
    const duration = eventType.duration || 30; // Default 30 minutes
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    // Format date as YYYY-MM-DD
    const date = selectedDate.toISOString().split('T')[0];

    return {
        event_type_id: eventType.id,
        name: formData.name || '',
        client_email: formData.email || '',
        additional_notes: formData.additionalNotes || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        date: date,
        meeting_link: 'https://cal.com/video', // Default meeting link
        booking_status: 'confirmed'
    };
}

