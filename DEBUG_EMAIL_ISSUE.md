# Email Not Sending - Debugging Guide

## Quick Checks

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab when you register. Look for:

**✅ Success Messages:**
- `📧 EmailJS: Starting welcome email send...`
- `📧 EmailJS Config: { PUBLIC_KEY: '...', SERVICE_ID: '...', ... }`
- `✅ Welcome email sent successfully!`

**❌ Error Messages:**
- `❌ EmailJS not configured`
- `❌ EmailJS host/guest template not configured`
- `❌ Error sending welcome email`
- `⚠️ No email address available, skipping welcome email`

### 2. Check Environment Variables

Make sure your `.env` file has these variables:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID_HOST=template_pjxc82i
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_z495ecl
```

**Important:** After adding/changing `.env` variables, you MUST restart your dev server!

### 3. Check EmailJS Dashboard

1. **Verify Service is Active:**
   - Go to EmailJS Dashboard → Email Services
   - Make sure your service shows as "Active"

2. **Verify Templates are Published:**
   - Go to EmailJS Dashboard → Email Templates
   - Both templates should show as "Published"
   - Check that Template IDs match:
     - Host: `template_pjxc82i`
     - Guest: `template_z495ecl`

3. **Check Template "To Email" Field:**
   - Open each template in EmailJS
   - Go to Settings tab
   - **"To Email" must be:** `{{to_email}}`
   - **NOT** a hardcoded email
   - **NOT** empty

4. **Check EmailJS Activity Log:**
   - Go to EmailJS Dashboard → Activity Log
   - See if emails are being sent
   - Check for error messages

### 4. Check EmailJS Quota

- Free tier: 200 emails/month
- Check EmailJS Dashboard → Account → Usage
- If limit reached, upgrade plan or wait for reset

### 5. Check Spam Folder

- Emails might be in spam/junk folder
- Check your Gmail spam folder

## Common Issues

### Issue 1: Environment Variables Not Loaded

**Symptoms:**
- Console shows: `❌ EmailJS not configured`
- Template IDs show as `undefined` in console

**Solution:**
1. Check `.env` file exists in project root
2. Verify variables start with `VITE_`
3. Restart dev server: `npm run dev`
4. Check browser console for config values

### Issue 2: Template IDs Don't Match

**Symptoms:**
- Console shows: `❌ EmailJS host/guest template not configured`
- EmailJS returns 404 error

**Solution:**
1. Verify Template IDs in `.env` match EmailJS dashboard
2. Check templates are published in EmailJS
3. Verify userType is exactly "guest" or "host" (case-sensitive)

### Issue 3: Template "To Email" Field Not Set

**Symptoms:**
- EmailJS returns error: "The recipients address is empty"
- Console shows EmailJS error

**Solution:**
1. Open template in EmailJS Dashboard
2. Go to Settings tab
3. Set "To Email" to: `{{to_email}}`
4. Save template

### Issue 4: EmailJS Service Not Connected

**Symptoms:**
- EmailJS returns authentication error
- Service shows as "Inactive" in dashboard

**Solution:**
1. Go to EmailJS Dashboard → Email Services
2. Check service is connected
3. Reconnect if necessary
4. Verify service is active

### Issue 5: Invalid Email Address

**Symptoms:**
- Console shows: `⚠️ No email address available, skipping welcome email`
- Email is empty or invalid

**Solution:**
1. Check user's email address is valid
2. Verify email is being passed to `sendWelcomeEmail` function
3. Check browser console for email value

## Step-by-Step Debugging

1. **Open Browser Console (F12)**
2. **Register a new user**
3. **Look for email-related logs:**
   - `📧 EmailJS: Starting welcome email send...`
   - `📧 EmailJS Config: { ... }`
   - `📧 EmailJS: Using template ID: ...`
   - `✅ Welcome email sent successfully!` or error messages

4. **Check EmailJS Dashboard:**
   - Activity Log → See if emails are being sent
   - Check for error messages
   - Verify service is active
   - Verify templates are published

5. **Check Environment Variables:**
   - Verify `.env` file has all required variables
   - Restart dev server after changing `.env`
   - Check console for config values

6. **Test Template Directly:**
   - Go to EmailJS Dashboard → Email Templates
   - Click "Test It" button
   - Enter test parameters
   - Send test email
   - Check if test email is received

## Quick Fix Checklist

- [ ] `.env` file has all EmailJS variables
- [ ] Dev server restarted after adding `.env` variables
- [ ] EmailJS service is active
- [ ] Host template is published
- [ ] Guest template is published
- [ ] Template IDs match `.env` file
- [ ] Template "To Email" is `{{to_email}}`
- [ ] Browser console shows email attempt logs
- [ ] No errors in console
- [ ] Checked spam folder
- [ ] EmailJS Activity Log shows sent emails
- [ ] EmailJS quota not exceeded

## Still Not Working?

1. **Check EmailJS Activity Log:**
   - Go to EmailJS Dashboard → Activity Log
   - See if emails are being sent
   - Check for specific error messages

2. **Test Template Directly:**
   - Use EmailJS "Test It" feature
   - Test with your email address
   - Verify template works

3. **Check Browser Network Tab:**
   - Open Developer Tools → Network tab
   - Filter by "emailjs"
   - Register a user
   - Check network requests to EmailJS
   - Look for error responses

4. **Verify EmailJS Configuration:**
   - Check Public Key is correct
   - Check Service ID is correct
   - Check Template IDs are correct
   - Verify all values are loaded (check console)

5. **Contact Support:**
   - EmailJS Support: https://www.emailjs.com/support/
   - Check EmailJS documentation: https://www.emailjs.com/docs/

