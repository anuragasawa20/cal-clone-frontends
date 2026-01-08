const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchAvailabilities() {
    try {
        const response = await fetch(`${API_BASE_URL}/availability`, {
            cache: 'no-store',
        });
        if (!response.ok) throw new Error('Failed to fetch availabilities');
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching availabilities:', error);
        throw error;
    }
}

export async function fetchAvailabilityById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/availability/${id}`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Availability not found');
            }
            throw new Error('Failed to fetch availability');
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching availability:', error);
        throw error;
    }
}

export async function fetchDefaultAvailability() {
    try {
        const response = await fetch(`${API_BASE_URL}/availability/default`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error('Failed to fetch default availability');
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching default availability:', error);
        throw error;
    }
}

export async function createAvailability(availabilityData) {
    try {
        const response = await fetch(`${API_BASE_URL}/availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(availabilityData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create availability');
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error creating availability:', error);
        throw error;
    }
}

export async function updateAvailability(id, availabilityData) {
    try {
        const response = await fetch(`${API_BASE_URL}/availability/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(availabilityData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update availability');
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error updating availability:', error);
        throw error;
    }
}

export async function deleteAvailability(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/availability/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete availability');
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error deleting availability:', error);
        throw error;
    }
}
