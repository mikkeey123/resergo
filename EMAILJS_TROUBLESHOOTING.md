# EmailJS Troubleshooting Guide

## Quick Debugging Steps

### Step 1: Check Browser Console

After registering a new user, open your browser's Developer Tools (F12) and check the Console tab. Look for:

**✅ Success Messages:**
- `📧 EmailJS: Starting welcome email send...`
- `📧 EmailJS Config: { PUBLIC_KEY: '...', SERVICE_ID: '...', ... }`
- `✅ Welcome email sent successfully!`

**❌ Error Messages:**
- `❌ EmailJS not configured`
- `❌ Error sending welcome email`
- `⚠️ Failed to send welcome email`

### Step 2: Verify EmailJS Configuration

Check if your credentials are loaded:

1. Open browser console
2. After registration, look for: `📧 EmailJS Config:`
3. Verify all values are present (not `undefined` or placeholder values)

### Step 3: Check EmailJS Dashboard

1. **Verify Service is Active:**
   - Go to EmailJS Dashboard → Email Services
   - Make sure your service shows as "Active"

2. **Verify Templates are Published:**
   - Go to EmailJS Dashboard → Email Templates
   - Both templates should show as "Published"
   - Check that Template IDs match your `.env` file:
     - Host: `template_pjxc82i` (or your custom template ID)
     - Guest: `template_z495ecl` (or your custom template ID)

3. **Check Template Settings:**
   - **To Email** should be: `{{to_email}}`
   - **From Email** should be your verified email
   - **Reply To** can be: `support@resergo.com` or your email

### Step 4: Test Templates Directly

1. Go to EmailJS Dashboard → Email Templates
2. Click on your template
3. Click **"Test It"** button
4. Fill in test values:
   - `to_email`: Your test email
   - `username`: Test User
   - `user_type`: guest or host
5. Click Send
6. Check if you receive the test email

### Step 5: Check Rate Limits

- Free tier: 200 emails/month
- Check EmailJS Dashboard → Account → Usage
- If limit reached, upgrade plan or wait for reset

## Common Issues and Solutions

### Issue 1: "EmailJS not configured"

**Symptoms:**
- Console shows: `❌ EmailJS not configured`

**Solutions:**
1. Check `.env` file has EmailJS variables
2. Restart dev server: `npm run dev`
3. Verify environment variables are loaded (check console for config)

### Issue 2: "Template not configured"

**Symptoms:**
- Console shows: `❌ EmailJS host/guest template not configured`

**Solutions:**
1. Verify Host Template ID in `.env` matches EmailJS dashboard (`VITE_EMAILJS_TEMPLATE_ID_HOST`)
2. Verify Guest Template ID in `.env` matches EmailJS dashboard (`VITE_EMAILJS_TEMPLATE_ID_GUEST`)
3. Check both templates are published in EmailJS
4. Verify userType is exactly "guest" or "host" (case-sensitive)
5. Make sure both template IDs are set in `.env` file

### Issue 3: EmailJS API Error

**Symptoms:**
- Console shows: `❌ Error sending welcome email`
- Error message with status code

**Common Error Codes:**
- **400**: Invalid parameters - Check template variables match
- **401**: Unauthorized - Check Public Key is correct
- **404**: Service/Template not found - Check IDs are correct
- **429**: Rate limit exceeded - Upgrade plan or wait

**Solutions:**
1. Verify all credentials in `.env` are correct
2. Check template variables in EmailJS match code
3. Test template directly in EmailJS dashboard

### Issue 4: No Email Received

**Symptoms:**
- Console shows success but no email arrives

**Check:**
1. **Spam/Junk Folder** - Check spam folder
2. **Email Address** - Verify email is correct in console logs
3. **EmailJS Logs** - Check EmailJS Dashboard → Activity Log
4. **Email Service** - Verify your email service (Gmail/Outlook) is working
5. **Template "To Email"** - Must be `{{to_email}}` not a hardcoded value

### Issue 5: Import Error

**Symptoms:**
- Console shows: `❌ Error importing or sending welcome email`
- Error about module not found

**Solutions:**
1. Verify file exists: `src/utils/emailService.js`
2. Check import path in `Config.js` is correct
3. Restart dev server

## Manual Test

You can test the email function directly in browser console:

```javascript
// Import and test
import('./src/utils/emailService.js').then(module => {
    module.sendWelcomeEmail('your-email@example.com', 'Test User', 'guest')
        .then(result => console.log('Result:', result))
        .catch(err => console.error('Error:', err));
});
```

## EmailJS Template Requirements

Make sure your templates have these variables:

### Both Host and Guest Templates:
- `{{to_email}}` - Required (recipient email)
- `{{to_name}}` - Optional (recipient name)
- `{{username}}` - Optional (username)
- `{{registration_date}}` - Optional (date)
- `{{message}}` - Optional (welcome message)

**Note:** No conditional logic needed - each template is separate!

## Verification Checklist

- [ ] `.env` file has all EmailJS credentials
- [ ] Dev server restarted after adding `.env` variables
- [ ] EmailJS service is active
- [ ] Host template is published
- [ ] Guest template is published
- [ ] Host Template ID matches `.env` file (`VITE_EMAILJS_TEMPLATE_ID_HOST`)
- [ ] Guest Template ID matches `.env` file (`VITE_EMAILJS_TEMPLATE_ID_GUEST`)
- [ ] Both templates "To Email" is `{{to_email}}`
- [ ] Browser console shows email attempt logs
- [ ] No errors in console
- [ ] Checked spam folder
- [ ] EmailJS Activity Log shows sent emails
- [ ] Tested with actual host registration
- [ ] Tested with actual guest registration

## Still Not Working?

1. **Check EmailJS Activity Log:**
   - Go to EmailJS Dashboard → Activity Log
   - See if emails are being sent
   - Check for error messages

2. **Test with EmailJS Playground:**
   - Use EmailJS "Playground" feature
   - Test sending directly from dashboard

3. **Contact Support:**
   - EmailJS Support: https://www.emailjs.com/support/
   - Check their documentation: https://www.emailjs.com/docs/

---

**Remember:** Email sending is non-blocking. Registration will succeed even if email fails. Check console logs to see what's happening!

