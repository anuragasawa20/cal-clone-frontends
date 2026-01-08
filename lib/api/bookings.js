const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchBookings(filters = {}) {
    try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.event_type_id) queryParams.append('event_type_id', filters.event_type_id);
        if (filters.date) queryParams.append('date', filters.date);
        if (filters.booking_status) queryParams.append('booking_status', filters.booking_status);
        if (filters.client_email) queryParams.append('client_email', filters.client_email);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/bookings${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            cache: 'no-store',
        });
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
}

export async function fetchBookingById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Booking not found');
            }
            throw new Error('Failed to fetch booking');
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching booking:', error);
        throw error;
    }
}

export async function createBooking(bookingData) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create booking');
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

export async function updateBooking(id, bookingData) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update booking');
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
}

export async function deleteBooking(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete booking');
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
    }
}

export async function cancelBooking(id) {
    try {
        return await updateBooking(id, { booking_status: 'cancelled' });
    } catch (error) {
        console.error('Error canceling booking:', error);
        throw error;
    }
}

