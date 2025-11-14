// Quick test script to verify email sending
// Run this in browser console after registering

// Test email sending function
async function testEmailSending() {
    const emailService = await import('./src/utils/emailService.js');
    
    console.log('🧪 Testing email sending...');
    
    // Test host email
    console.log('📧 Testing Host email...');
    const hostResult = await emailService.sendWelcomeEmail(
        'your-email@gmail.com', // Replace with your email
        'Test Host',
        'host'
    );
    console.log('Host email result:', hostResult);
    
    // Test guest email
    console.log('📧 Testing Guest email...');
    const guestResult = await emailService.sendWelcomeEmail(
        'your-email@gmail.com', // Replace with your email
        'Test Guest',
        'guest'
    );
    console.log('Guest email result:', guestResult);
}

// Check EmailJS configuration
function checkEmailJSConfig() {
    console.log('🔍 Checking EmailJS Configuration...');
    console.log('Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
    console.log('Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
    console.log('Host Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID_HOST);
    console.log('Guest Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID_GUEST);
    
    // Check if values are loaded
    if (!import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
        console.error('❌ Public Key not loaded!');
    }
    if (!import.meta.env.VITE_EMAILJS_SERVICE_ID) {
        console.error('❌ Service ID not loaded!');
    }
    if (!import.meta.env.VITE_EMAILJS_TEMPLATE_ID_HOST) {
        console.error('❌ Host Template ID not loaded!');
    }
    if (!import.meta.env.VITE_EMAILJS_TEMPLATE_ID_GUEST) {
        console.error('❌ Guest Template ID not loaded!');
    }
}

// Run checks
checkEmailJSConfig();

