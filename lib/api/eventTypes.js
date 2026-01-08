const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchEventTypes() {
    try {
        const response = await fetch(`${API_BASE_URL}/event-type`, {
            cache: 'no-store',
        });
        if (!response.ok) throw new Error('Failed to fetch event types');
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching event types:', error);
        return [];
    }
}

export async function fetchEventTypeById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/event-type/${id}`, {
            cache: 'no-store',
        });
        if (!response.ok) throw new Error('Failed to fetch event type');
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching event type:', error);
        return null;
    }
}

export async function fetchEventTypeBySlug(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/event-type/slug/${slug}`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Event type not found');
            }
            throw new Error('Failed to fetch event type');
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching event type by slug:', error);
        throw error;
    }
}

export async function createEventType(eventTypeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/event-type`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventTypeData),
        });
        if (!response.ok) throw new Error('Failed to create event type');
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error creating event type:', error);
        throw error;
    }
}

export async function updateEventType(id, eventTypeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/event-type/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventTypeData),
        });
        if (!response.ok) throw new Error('Failed to update event type');
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error updating event type:', error);
        throw error;
    }
}

export async function deleteEventType(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/event-type/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete event type');
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error deleting event type:', error);
        throw error;
    }
}

