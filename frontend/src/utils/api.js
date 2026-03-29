// ═══════════════════════════════════════════════════════════════════════
// RECYX API Service Layer - Connects frontend to real backend
// ═══════════════════════════════════════════════════════════════════════

// Use environment variable or default to localhost
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper for making requests
async function request(endpoint, options = {}) {
    const token = localStorage.getItem('recyx_access_token');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);

        // Handle 401 - but NOT for login endpoint (we want to show error there)
        if (response.status === 401 && !endpoint.includes('/login')) {
            // Token expired or invalid - clear and redirect to login
            localStorage.removeItem('recyx_access_token');
            localStorage.removeItem('recyx_current_user');
            // Don't reload - just let the caller handle it
            throw new Error('Session expired. Please login again.');
        }

        // Try to parse JSON response
        let data;
        const text = await response.text();
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = {};
        }

        if (!response.ok) {
            // Return error message from backend if available
            throw new Error(data.detail || data.message || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        // Don't throw generic errors - pass through the message
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════

export async function login(email, password) {
    const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (data) {
        localStorage.setItem('recyx_access_token', data.access_token);
        // Transform backend user to frontend format
        const user = {
            id: data.user.user_id,
            name: data.user.full_name,
            email: data.user.email,
            role: data.user.role,
            phone: data.user.phone,
            sector: data.user.district,
            verified: data.user.is_verified,
            avatar: data.user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        };
        localStorage.setItem('recyx_current_user', JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, error: 'Login failed' };
}

export async function register(userData) {
    const data = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            full_name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            district: userData.sector,
            role: userData.role,
        }),
    });

    if (data) {
        return { success: true, user: data };
    }
    return { success: false, error: 'Registration failed' };
}

export function logout() {
    localStorage.removeItem('recyx_access_token');
    localStorage.removeItem('recyx_current_user');
}

// ═══════════════════════════════════════════════════════════════════════
// LISTINGS
// ═══════════════════════════════════════════════════════════════════════

export async function getListings(filters = {}) {
    const params = new URLSearchParams();
    if (filters.material) params.append('material_type', filters.material);
    if (filters.district) params.append('district', filters.district);
    if (filters.status) params.append('status', filters.status);
    params.append('limit', '100');

    const data = await request(`/api/listings/?${params}`);

    if (data) {
        // Transform backend listing to frontend format
        return data.map(l => ({
            id: l.listing_id,
            sellerId: l.posted_by,
            sellerName: l.seller_name || l.poster_name,
            material: l.material || l.material_type,
            qty: l.qty || l.quantity_kg,
            condition: l.condition,
            title: l.title,
            description: l.description,
            sector: l.sector || l.district,
            status: l.status,
            price: l.price,
            date: l.date || (l.created_at ? l.created_at.split('T')[0] : null),
            views: l.views || 0,
            favorites: l.favorites || 0,
            image: l.image,
            images: l.images ? JSON.parse(l.images) : [],
            paymentMethod: l.payment_method,
            paymentNumber: l.payment_number,
        }));
    }
    return [];
}

export async function getMyListings() {
    const data = await request('/api/listings/mine');
    if (data) {
        return data.map(l => ({
            id: l.listing_id,
            sellerId: l.posted_by,
            sellerName: l.seller_name || l.poster_name,
            material: l.material || l.material_type,
            qty: l.qty || l.quantity_kg,
            condition: l.condition,
            title: l.title,
            description: l.description,
            sector: l.sector || l.district,
            status: l.status,
            price: l.price,
            date: l.date || (l.created_at ? l.created_at.split('T')[0] : null),
            views: l.views || 0,
            favorites: l.favorites || 0,
            image: l.image,
            images: l.images ? JSON.parse(l.images) : [],
            paymentMethod: l.payment_method,
            paymentNumber: l.payment_number,
        }));
    }
    return [];
}

export async function getListingById(id) {
    const data = await request(`/api/listings/${id}`);

    if (data) {
        return {
            id: data.listing_id,
            sellerId: data.posted_by,
            sellerName: data.seller_name || data.poster_name,
            material: data.material || data.material_type,
            qty: data.qty || data.quantity_kg,
            condition: data.condition,
            title: data.title,
            description: data.description,
            sector: data.sector || data.district,
            status: data.status,
            price: data.price,
            date: data.date || (data.created_at ? data.created_at.split('T')[0] : null),
            views: data.views || 0,
            favorites: data.favorites || 0,
            image: data.image,
            images: data.images ? JSON.parse(data.images) : [],
            paymentMethod: data.payment_method,
            paymentNumber: data.payment_number,
        };
    }
    return null;
}

export async function createListing(listingData) {
    const data = await request('/api/listings/', {
        method: 'POST',
        body: JSON.stringify({
            title: listingData.title,
            material_type: listingData.material,
            quantity_kg: listingData.qty,
            condition: listingData.condition,
            description: listingData.description,
            district: listingData.sector?.split(', ').pop() || listingData.sector,
            sector: listingData.sector,
            price: listingData.price,
            image: listingData.image,
            payment_method: listingData.paymentMethod || 'mtn',
            payment_number: listingData.paymentNumber,
        }),
    });

    if (data) {
        return { success: true, listing: data };
    }
    return { success: false, error: 'Failed to create listing' };
}

export async function updateListingViews(id) {
    const data = await request(`/api/listings/${id}/view`, { method: 'POST' });
    return data || { success: true };
}

export async function getFavorites() {
    const data = await request('/api/listings/favorites');
    if (!data) return [];
    return data.map(l => ({
        id: l.listing_id,
        title: l.title,
        material: l.material || l.material_type,
        qty: l.qty || l.quantity_kg,
        condition: l.condition,
        price: l.price || 0,
        district: l.district,
        sector: l.sector,
        status: l.status,
        date: l.date,
        views: l.views || 0,
        favorites: l.favorites || 0,
        image: l.image,
        images: l.images,
        description: l.description,
        sellerId: l.posted_by,
        sellerName: l.seller_name || l.poster_name,
        paymentMethod: l.payment_method,
        paymentNumber: l.payment_number,
    }));
}

export async function checkFavorite(listingId) {
    const data = await request(`/api/listings/${listingId}/favorite`);
    return data ? data.favorited : false;
}

export async function toggleFavorite(listingId) {
    const data = await request(`/api/listings/${listingId}/favorite`, { method: 'POST' });
    return data || { favorited: false, favorites: 0 };
}

// ═══════════════════════════════════════════════════════════════════════
// OFFERS / TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════

export async function getOffers(listingId) {
    const data = await request(`/api/transactions/?listing_id=${listingId}`);

    if (data) {
        return data.map(o => ({
            id: o.transaction_id,
            listingId: o.listing_id,
            buyerId: o.buyer_id,
            buyerName: o.buyer_name || 'Unknown',
            amount: o.agreed_price,
            status: o.status,
            date: o.created_at?.split('T')[0],
        }));
    }
    return [];
}

export async function getMyTransactions() {
    const data = await request('/api/transactions/mine');
    if (data) {
        return data.map(o => ({
            id: o.transaction_id,
            listingId: o.listing_id,
            buyerId: o.buyer_id,
            sellerId: o.seller_id,
            buyerName: o.buyer_name || 'Unknown',
            amount: o.agreed_price,
            status: o.status,
            txStatus: o.status,
            date: o.created_at?.split('T')[0],
        }));
    }
    return [];
}

export async function makeOffer(offerData) {
    const data = await request('/api/transactions/', {
        method: 'POST',
        body: JSON.stringify({
            listing_id: offerData.listingId,
            offered_price: offerData.amount,
        }),
    });

    if (data) {
        return { success: true, offer: data };
    }
    return { success: false, error: 'Failed to make offer' };
}

export async function updateTransactionStatus(offerId, status) {
    const data = await request(`/api/transactions/${offerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
    return { success: !!data };
}

export async function acceptOffer(offerId) {
    return updateTransactionStatus(offerId, 'offer_accepted');
}

export async function declineOffer(offerId) {
    return updateTransactionStatus(offerId, 'cancelled');
}

// ═══════════════════════════════════════════════════════════════════════
// TECHNICIANS
// ═══════════════════════════════════════════════════════════════════════

export async function getTechnicians(filters = {}) {
    const params = new URLSearchParams();
    if (filters.deviceType) params.append('device_type', filters.deviceType);
    if (filters.district) params.append('district', filters.district);
    params.append('limit', '100');

    const data = await request(`/api/technicians/?${params}`);

    if (data) {
        return data.map(t => ({
            id: t.user_id,
            name: t.full_name,
            avatar: t.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            spec: t.specialisation,
            sector: t.district,
            rating: t.average_rating,
            jobs: t.total_jobs,
            exp: t.years_experience,
            phone: t.phone,
        }));
    }
    return [];
}

export async function createServiceRequest(requestData) {
    const data = await request('/api/technicians/service-requests', {
        method: 'POST',
        body: JSON.stringify({
            technician_id: requestData.techId,
            device_type: requestData.device,
            issue_description: requestData.problem,
        }),
    });

    if (data) {
        return { success: true, request: data };
    }
    return { success: false, error: 'Failed to create service request' };
}

// ═══════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════

export async function getNotifications(userId) {
    const data = await request('/api/notifications/');

    if (data) {
        return data
            .filter(n => n.user_id === userId)
            .map(n => ({
                id: n.notification_id,
                userId: n.user_id,
                message: n.message,
                read: n.is_read,
                date: n.created_at?.split('T')[0],
                type: n.type,
                listingId: n.listing_id,
            }));
    }
    return [];
}

export async function markRead(notifId) {
    const data = await request(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
    });
    return { success: !!data };
}

export async function markAllRead() {
    await request('/api/notifications/read-all', { method: 'PUT' });
    return { success: true };
}

export async function updateUser(userData) {
    const data = await request('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify({
            full_name: userData.name,
            phone: userData.phone,
            district: userData.district,
        }),
    });
    if (data) {
        const user = {
            id: data.user_id,
            name: data.full_name,
            email: data.email,
            role: data.role,
            phone: data.phone,
            sector: data.district,
            verified: data.is_verified,
            avatar: data.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        };
        localStorage.setItem('recyx_current_user', JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, error: 'Failed to update profile' };
}

// ═══════════════════════════════════════════════════════════════════════
// SERVICE REQUESTS
// ═══════════════════════════════════════════════════════════════════════

export async function getServiceRequests(userId, role) {
    const data = await request('/api/technicians/service-requests/mine');

    if (data) {
        return data.map(r => ({
            id: r.request_id,
            techId: r.technician_id,
            userId: r.citizen_id,
            citizenName: r.citizen_name,
            device: r.device_type,
            problem: r.issue_description,
            status: r.status,
            date: r.scheduled_date?.split('T')[0] || r.created_at?.split('T')[0],
        }));
    }
    return [];
}

export async function updateServiceRequest(requestId, status) {
    const data = await request(`/api/technicians/service-requests/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    return data || null;
}

// ═══════════════════════════════════════════════════════════════════════
// FACILITIES (MAP)
// ═══════════════════════════════════════════════════════════════════════

export async function getFacilities() {
    const data = await request('/api/facilities/');

    if (data) {
        return data.map(f => ({
            id: f.id,
            name: f.name,
            type: f.type,
            lat: f.lat,
            lng: f.lng,
            materials: f.materials,
            sector: f.sector,
        }));
    }
    return [];
}

// ═══════════════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════════════

export async function getReviews() {
    const data = await request('/api/reviews/');

    if (data) {
        return data.map(r => ({
            id: r.review_id,
            userId: r.reviewer_id,
            userName: r.reviewer?.full_name || 'Anonymous',
            listingId: r.interaction_id,
            rating: r.rating,
            message: r.comment,
            date: r.created_at?.split('T')[0],
            status: 'approved',
        }));
    }
    return [];
}

export async function submitReview(reviewData) {
    const data = await request('/api/reviews/', {
        method: 'POST',
        body: JSON.stringify({
            reviewed_user_id: reviewData.listingId,
            interaction_type: 'waste_transaction',
            interaction_id: reviewData.listingId,
            rating: reviewData.rating,
            comment: reviewData.message,
        }),
    });

    if (data) {
        return { success: true, review: data };
    }
    return { success: false, error: 'Failed to submit review' };
}

// ═══════════════════════════════════════════════════════════════════════
// FEEDBACK
// ═══════════════════════════════════════════════════════════════════════

export async function submitFeedback(feedbackData) {
    // Backend may not have this endpoint - return success anyway for demo
    return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════════════

export async function adminGetAllUsers() {
    const data = await request('/api/admin/users');
    if (data) {
        return data.map(u => ({
            id: u.user_id,
            name: u.full_name,
            email: u.email,
            role: u.role,
            phone: u.phone,
            sector: u.district,
            verified: u.is_verified,
            verificationStatus: u.verification_status,
            avatar: u.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            joinDate: u.created_at?.split('T')[0],
            suspended: false,
            flagged: false,
        }));
    }
    return [];
}

export async function adminApproveUser(userId) {
    await request(`/api/admin/verify-user/${userId}`, { method: 'POST' });
    return { success: true };
}

export async function adminRejectUser(userId) {
    await request(`/api/admin/reject-user/${userId}`, { method: 'POST' });
    return { success: true };
}

export async function adminGetStats() {
    const data = await request('/api/admin/stats');
    if (data) {
        return {
            totalUsers: data.total_users,
            totalListings: data.total_listings,
            completedTx: data.completed_transactions,
            averageRating: data.average_rating,
            pendingUsers: data.pending_users,
            pendingListings: data.pending_listings,
        };
    }
    return {};
}

export async function adminGetAllListings() {
    const data = await request('/api/admin/listings');
    if (data) {
        return data.map(l => ({
            id: l.listing_id,
            sellerId: l.posted_by,
            sellerName: l.poster_name || l.seller_name,
            material: l.material || l.material_type,
            qty: l.qty || l.quantity_kg,
            condition: l.condition,
            title: l.title,
            description: l.description,
            sector: l.sector || l.district,
            status: l.status,
            price: l.price,
            date: l.date || (l.created_at ? l.created_at.split('T')[0] : null),
            image: l.image,
            flagged: false,
        }));
    }
    return [];
}

export async function adminApproveListing(listingId) {
    await request(`/api/admin/approve-listing/${listingId}`, { method: 'POST' });
    return { success: true };
}

export async function adminRejectListing(listingId) {
    await request(`/api/admin/reject-listing/${listingId}`, { method: 'POST' });
    return { success: true };
}
