'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function BookingForm({
    onSubmit,
    onBack,
    initialValues = {},
    eventType,
    className
}) {
    const [formData, setFormData] = useState({
        name: initialValues.name || '',
        email: initialValues.email || '',
        additionalNotes: initialValues.additionalNotes || '',
        guests: initialValues.guests || []
    });
    const [showAddGuest, setShowAddGuest] = useState(false);
    const [newGuestEmail, setNewGuestEmail] = useState('');
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateEmail = (email) => {
        if (!email || !email.trim()) {
            return 'Email address is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const validateName = (name) => {
        if (!name || !name.trim()) {
            return 'Name is required';
        }
        return '';
    };

    const handleAddGuest = () => {
        if (newGuestEmail.trim() && !formData.guests.includes(newGuestEmail.trim())) {
            setFormData(prev => ({
                ...prev,
                guests: [...prev.guests, newGuestEmail.trim()]
            }));
            setNewGuestEmail('');
            setShowAddGuest(false);
        }
    };

    const handleRemoveGuest = (email) => {
        setFormData(prev => ({
            ...prev,
            guests: prev.guests.filter(g => g !== email)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate form fields
        const nameError = validateName(formData.name);
        const emailError = validateEmail(formData.email);
        
        const newErrors = {};
        if (nameError) {
            newErrors.name = nameError;
        }
        if (emailError) {
            newErrors.email = emailError;
        }
        
        setErrors(newErrors);
        
        // Only submit if there are no errors
        if (!nameError && !emailError) {
            onSubmit && onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("flex flex-col", className)}>
            {/* Name field */}
            <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Your name <span className="text-white">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={cn(
                        "w-full px-3 py-2 bg-[#181818] border rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent",
                        errors.name ? "border-red-500" : "border-zinc-700"
                    )}
                    placeholder="Enter your name"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
            </div>

            {/* Email field */}
            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email address <span className="text-white">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={cn(
                        "w-full px-3 py-2 bg-[#181818] border rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent",
                        errors.email ? "border-red-500" : "border-zinc-700"
                    )}
                    placeholder="Enter your email"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
            </div>

            {/* Additional notes */}
            <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-white mb-2">
                    Additional notes
                </label>
                <textarea
                    id="notes"
                    rows={4}
                    value={formData.additionalNotes}
                    onChange={(e) => handleChange('additionalNotes', e.target.value)}
                    className="w-full h-32 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Please share anything that will help prepare for our meeting."
                />
            </div>

            {/* Add guests */}
            <div className="mb-6">
                {formData.guests.length > 0 && (
                    <div className="mb-2 space-y-2">
                        {formData.guests.map((guest, index) => (
                            <div key={index} className="flex items-center justify-between px-3 py-2 bg-zinc-800 rounded-md">
                                <span className="text-sm text-white">{guest}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveGuest(guest)}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {showAddGuest ? (
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={newGuestEmail}
                            onChange={(e) => setNewGuestEmail(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGuest())}
                            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Enter guest email"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleAddGuest}
                            className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-zinc-100 transition-colors"
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddGuest(false);
                                setNewGuestEmail('');
                            }}
                            className="px-4 py-2 bg-zinc-800 text-white rounded-md font-medium hover:bg-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowAddGuest(true)}
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add guests</span>
                    </button>
                )}
            </div>

            {/* Terms and Privacy */}
            <div className="mb-6">
                <p className="text-xs text-gray-500">
                    By proceeding, you agree to our{' '}
                    <a href="#" className="text-white hover:underline">Terms</a>
                    {' '}and{' '}
                    <a href="#" className="text-white hover:underline">Privacy Policy</a>.
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-100 transition-colors"
                >
                    Confirm
                </button>
            </div>
        </form>
    );
}

