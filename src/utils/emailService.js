import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Get these values from your EmailJS Dashboard:
// - Public Key: Account > General > Public Key
// - Service ID: Email Services > Your Service > Service ID
// - Template IDs: Email Templates > Your Templates > Template ID

// EmailJS credentials - using environment variables
// Fallback values are provided for development (replace with your actual values if not using .env)
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'BCWKT-neLyeOkJ-Lz';
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_2q8vvwm';

// Registration templates - separate for host and guest
// Update these in .env file to match your EmailJS Dashboard template IDs
const TEMPLATE_ID_HOST = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_HOST || 'template_pjxc82i';
const TEMPLATE_ID_GUEST = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_GUEST || 'template_z495ecl';

// Booking templates - for approval and rejection
const TEMPLATE_ID_BOOKING_APPROVAL = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_BOOKING_APPROVAL || 'template_d5qa8cd';
const TEMPLATE_ID_BOOKING_REJECTION = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION || 'template_9508bwo';

// Initialize EmailJS
if (PUBLIC_KEY) {
    emailjs.init(PUBLIC_KEY);
}

/**
 * Send welcome email to newly registered user
 * @param {string} email - User's email address
 * @param {string} username - User's username
 * @param {string} userType - 'guest' or 'host'
 * @returns {Promise<Object>} - Promise that resolves with success status
 */
export const sendWelcomeEmail = async (email, username, userType) => {
    console.log('📧 EmailJS: Starting welcome email send...', { email, username, userType });
    
    // Validate email first
    if (!email || email.trim() === '') {
        console.error('❌ Email address is empty! Cannot send welcome email.');
        return { success: false, error: 'Email address is required' };
    }
    
    // Check if EmailJS is properly configured
    if (!PUBLIC_KEY || !SERVICE_ID) {
        console.warn('❌ EmailJS not configured. Skipping welcome email.');
        return { success: false, error: 'EmailJS not configured' };
    }

    // Validate userType
    if (userType !== 'host' && userType !== 'guest') {
        console.error('❌ Invalid user type:', userType);
        return { success: false, error: 'Invalid user type. Must be "host" or "guest"' };
    }

    try {
        // Use separate template based on user type
        const templateId = userType === 'host' ? TEMPLATE_ID_HOST : TEMPLATE_ID_GUEST;
        console.log('📧 EmailJS: Using template ID:', templateId, 'for user type:', userType);
        console.log('📧 EmailJS Config:', { PUBLIC_KEY, SERVICE_ID, TEMPLATE_ID_HOST, TEMPLATE_ID_GUEST });
        
        // Check if template ID is configured
        if (!templateId) {
            console.warn(`❌ EmailJS ${userType} template not configured. Skipping welcome email.`);
            return { success: false, error: `${userType} template not configured` };
        }

        // EmailJS requires the recipient email in the templateParams
        // The template's "To Email" field must be set to {{to_email}} in EmailJS dashboard
        const templateParams = {
            to_email: email.trim(), // Ensure no whitespace
            to_name: username || email.split('@')[0], // Fallback to email username if no name
            username: username || email.split('@')[0],
            registration_date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            message: `Welcome to ReserGo! We're excited to have you as a ${userType}.`,
        };

        console.log('📧 EmailJS: Sending email with params:', templateParams);
        console.log('📧 EmailJS: Recipient email:', email);

        const response = await emailjs.send(
            SERVICE_ID,
            templateId,
            templateParams
        );

        console.log('✅ Welcome email sent successfully!', response);
        console.log('📧 Email sent to:', email);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        console.error('❌ Error details:', {
            message: error.message,
            text: error.text,
            status: error.status,
            statusText: error.statusText
        });
        
        // More detailed error logging
        if (error.text) {
            console.error('❌ EmailJS Error Text:', error.text);
        }
        if (error.status) {
            console.error('❌ EmailJS Error Status:', error.status);
            if (error.status === 400) {
                console.error('❌ Bad Request (400) - Template ID not found or template not published!');
                console.error('❌ Template ID used:', templateId);
                console.error('❌ Service ID used:', SERVICE_ID);
                console.error('❌ Common issues:');
                console.error('   1. Template is in "Draft" mode (must be "Published")');
                console.error('   2. Template is associated with wrong service ID');
                console.error('   3. Template ID doesn\'t match EmailJS Dashboard');
                console.error('   4. Service ID doesn\'t match EmailJS Dashboard');
                console.error('❌ Fix: Go to EmailJS Dashboard → Email Templates → Check template is Published and associated with service:', SERVICE_ID);
            } else if (error.status === 401) {
                console.error('❌ Unauthorized (401) - Check Public Key is correct');
            } else if (error.status === 404) {
                console.error('❌ Not Found (404) - Check Service ID and Template ID are correct');
                console.error('❌ Template ID used:', templateId);
                console.error('❌ Service ID used:', SERVICE_ID);
            } else if (error.status === 429) {
                console.error('❌ Rate Limit Exceeded (429) - Check EmailJS quota');
            }
        }
        
        // Don't throw error - email failure shouldn't block registration
        return { success: false, error: error.message || 'Failed to send email', details: error.text };
    }
};

/**
 * Send registration confirmation email
 * @param {string} email - User's email address
 * @param {string} username - User's username
 * @param {string} userType - 'guest' or 'host'
 * @returns {Promise<Object>} - Promise that resolves with success status
 */
export const sendRegistrationConfirmation = async (email, username, userType) => {
    // Use the same welcome email function
    return sendWelcomeEmail(email, username, userType);
};

/**
 * Send booking approval email to guest
 * @param {string} guestEmail - Guest's email address
 * @param {string} guestName - Guest's name
 * @param {string} listingTitle - Title of the listing
 * @param {string} checkIn - Check-in date
 * @param {string} checkOut - Check-out date
 * @param {number} totalAmount - Total booking amount
 * @returns {Promise<Object>} - Promise that resolves with success status
 */
export const sendBookingApprovalEmail = async (guestEmail, guestName, listingTitle, checkIn, checkOut, totalAmount) => {
    console.log('📧 EmailJS: Starting booking approval email send...', { guestEmail, guestName, listingTitle });
    
    // Validate email first
    if (!guestEmail || guestEmail.trim() === '') {
        console.error('❌ Email address is empty! Cannot send booking approval email.');
        return { success: false, error: 'Email address is required' };
    }
    
    // Check if EmailJS is properly configured
    if (!PUBLIC_KEY || !SERVICE_ID) {
        console.warn('❌ EmailJS not configured. Skipping booking approval email.');
        return { success: false, error: 'EmailJS not configured' };
    }

    // Check if template ID is configured
    if (!TEMPLATE_ID_BOOKING_APPROVAL) {
        console.warn('❌ EmailJS booking approval template not configured. Skipping email.');
        return { success: false, error: 'Booking approval template not configured' };
    }

    try {
        const templateParams = {
            to_email: guestEmail.trim(),
            to_name: guestName || guestEmail.split('@')[0],
            guest_name: guestName || guestEmail.split('@')[0],
            listing_title: listingTitle || 'Your Booking',
            check_in: checkIn || 'N/A',
            check_out: checkOut || 'N/A',
            total_amount: totalAmount ? `₱${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
            booking_date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
        };

        console.log('📧 EmailJS: Sending booking approval email with params:', templateParams);
        console.log('📧 EmailJS: Recipient email:', guestEmail);

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID_BOOKING_APPROVAL,
            templateParams
        );

        console.log('✅ Booking approval email sent successfully!', response);
        console.log('📧 Email sent to:', guestEmail);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error sending booking approval email:', error);
        console.error('❌ Error details:', {
            message: error.message,
            text: error.text,
            status: error.status,
            statusText: error.statusText
        });
        
        // More detailed error logging for 400 errors
        if (error.status === 400) {
            console.error('❌ Bad Request (400) - Template ID not found or template not published!');
            console.error('❌ Template ID used:', TEMPLATE_ID_BOOKING_APPROVAL);
            console.error('❌ Service ID used:', SERVICE_ID);
            console.error('❌ Common issues:');
            console.error('   1. Template is in "Draft" mode (must be "Published")');
            console.error('   2. Template ID doesn\'t match EmailJS Dashboard');
            console.error('   3. Template is associated with wrong service ID');
            console.error('   4. Missing required template variables');
            console.error('❌ Fix: Go to EmailJS Dashboard → Email Templates → Check template is Published and ID matches:', TEMPLATE_ID_BOOKING_APPROVAL);
        }
        
        // Don't throw error - email failure shouldn't block booking approval
        return { success: false, error: error.message || 'Failed to send email', details: error.text };
    }
};

/**
 * Send booking rejection email to guest
 * @param {string} guestEmail - Guest's email address
 * @param {string} guestName - Guest's name
 * @param {string} listingTitle - Title of the listing
 * @param {string} checkIn - Check-in date
 * @param {string} checkOut - Check-out date
 * @returns {Promise<Object>} - Promise that resolves with success status
 */
export const sendBookingRejectionEmail = async (guestEmail, guestName, listingTitle, checkIn, checkOut) => {
    console.log('📧 EmailJS: Starting booking rejection email send...', { guestEmail, guestName, listingTitle });
    
    // Validate email first
    if (!guestEmail || guestEmail.trim() === '') {
        console.error('❌ Email address is empty! Cannot send booking rejection email.');
        return { success: false, error: 'Email address is required' };
    }
    
    // Check if EmailJS is properly configured
    if (!PUBLIC_KEY || !SERVICE_ID) {
        console.warn('❌ EmailJS not configured. Skipping booking rejection email.');
        return { success: false, error: 'EmailJS not configured' };
    }

    // Check if template ID is configured
    if (!TEMPLATE_ID_BOOKING_REJECTION) {
        console.warn('❌ EmailJS booking rejection template not configured. Skipping email.');
        return { success: false, error: 'Booking rejection template not configured' };
    }

    try {
        const templateParams = {
            to_email: guestEmail.trim(),
            to_name: guestName || guestEmail.split('@')[0],
            guest_name: guestName || guestEmail.split('@')[0],
            listing_title: listingTitle || 'Your Booking',
            check_in: checkIn || 'N/A',
            check_out: checkOut || 'N/A',
            booking_date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
        };

        console.log('📧 EmailJS: Sending booking rejection email with params:', templateParams);
        console.log('📧 EmailJS: Recipient email:', guestEmail);

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID_BOOKING_REJECTION,
            templateParams
        );

        console.log('✅ Booking rejection email sent successfully!', response);
        console.log('📧 Email sent to:', guestEmail);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error sending booking rejection email:', error);
        console.error('❌ Error details:', {
            message: error.message,
            text: error.text,
            status: error.status,
            statusText: error.statusText
        });
        
        // Don't throw error - email failure shouldn't block booking rejection
        return { success: false, error: error.message || 'Failed to send email', details: error.text };
    }
};

