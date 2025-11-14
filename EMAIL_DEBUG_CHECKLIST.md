# Email Not Sending - Debug Checklist

## Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Register a new user
4. Look for these logs:

### ✅ What to Look For:

**Good Signs:**
- `📧 EmailJS: Starting welcome email send...`
- `📧 EmailJS Config: { PUBLIC_KEY: '...', SERVICE_ID: '...', TEMPLATE_ID_HOST: '...', TEMPLATE_ID_GUEST: '...' }`
- `📧 EmailJS: Using template ID: template_xxxxx for user type: guest/host`
- `📧 EmailJS: Sending email with params: { ... }`
- `✅ Welcome email sent successfully!`

**Bad Signs:**
- `❌ EmailJS not configured`
- `❌ EmailJS host/guest template not configured`
- `❌ Error sending welcome email`
- `⚠️ No email address available, skipping welcome email`
- `❌ Error details: { message: '...', text: '...', status: ... }`

## Step 2: Check Your .env File

Your `.env` file should have:

```env
VITE_EMAILJS_PUBLIC_KEY=BCWKT-neLyeOkJ-Lz
VITE_EMAILJS_SERVICE_ID=service_2q8vvwm
VITE_EMAILJS_TEMPLATE_ID_HOST=template_qclikqk
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_ztowwpc
```

**Important:** After changing `.env`, restart your dev server!

## Step 3: Check EmailJS Dashboard

### A. Verify Service is Active

1. Go to https://dashboard.emailjs.com/
2. Click **Email Services**
3. Find your service (`service_2q8vvwm`)
4. Make sure it shows as **"Active"**
5. If not active, click on it and reconnect

### B. Verify Templates Exist and Are Published

1. Go to **Email Templates**
2. Check these templates exist:
   - **Register Host** (Template ID: `template_qclikqk`)
   - **Register Guest** (Template ID: `template_ztowwpc`)
3. Make sure both templates are **"Published"** (not draft)

### C. Check Template "To Email" Field (CRITICAL!)

For **BOTH** templates:

1. Click on the template
2. Go to **Settings** tab
3. Find **"To Email"** field
4. **It MUST be:** `{{to_email}}`
5. **NOT** empty
6. **NOT** a hardcoded email like `your-email@gmail.com`
7. **NOT** `{{email}}` or any other variable name
8. Click **Save** if you changed it

### D. Check Template Subject

For **BOTH** templates:

1. Subject should be: `Welcome to ReserGo, {{username}}!`
2. Or similar with `{{username}}` variable

### E. Check EmailJS Activity Log

1. Go to **Activity Log** in EmailJS Dashboard
2. Register a new user
3. Check if an email attempt appears in the log
4. Look for error messages

## Step 4: Test Templates Directly

### Test Host Template:

1. Go to EmailJS Dashboard → Email Templates
2. Click on **Register Host** template
3. Click **"Test It"** button
4. Enter test parameters:
   - `to_email`: your Gmail address
   - `username`: "Test Host"
   - `registration_date`: "January 15, 2024"
   - `message`: "Welcome to ReserGo!"
   - `to_name`: "Test Host"
5. Click **Send Test Email**
6. Check your Gmail inbox (and spam folder)

### Test Guest Template:

1. Go to EmailJS Dashboard → Email Templates
2. Click on **Register Guest** template
3. Click **"Test It"** button
4. Enter test parameters:
   - `to_email`: your Gmail address
   - `username`: "Test Guest"
   - `registration_date`: "January 15, 2024"
   - `message`: "Welcome to ReserGo!"
   - `to_name`: "Test Guest"
5. Click **Send Test Email**
6. Check your Gmail inbox (and spam folder)

## Step 5: Check EmailJS Quota

1. Go to EmailJS Dashboard → **Account** → **Usage**
2. Check if you've exceeded the free tier limit (200 emails/month)
3. If limit reached, upgrade plan or wait for reset

## Step 6: Check Browser Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Filter by "emailjs" or "api.emailjs.com"
4. Register a new user
5. Look for network requests to EmailJS
6. Check the response:
   - **200 OK** = Email sent successfully
   - **400/401/404** = Configuration error
   - **429** = Rate limit exceeded

## Common Issues and Fixes

### Issue 1: "To Email" Field Not Set Correctly

**Problem:** Template "To Email" field is empty or wrong

**Fix:**
1. Open template in EmailJS
2. Go to Settings tab
3. Set "To Email" to: `{{to_email}}`
4. Save template

### Issue 2: Template IDs Don't Match

**Problem:** Template IDs in `.env` don't match EmailJS dashboard

**Fix:**
1. Check EmailJS Dashboard for actual Template IDs
2. Update `.env` file with correct IDs
3. Restart dev server

### Issue 3: Templates Not Published

**Problem:** Templates are in "Draft" mode

**Fix:**
1. Open template in EmailJS
2. Make sure it's **Published** (not draft)
3. Save template

### Issue 4: Service Not Active

**Problem:** Email service is not connected

**Fix:**
1. Go to EmailJS Dashboard → Email Services
2. Click on your service
3. Reconnect if necessary
4. Verify service is active

### Issue 5: Environment Variables Not Loaded

**Problem:** `.env` variables not being read

**Fix:**
1. Make sure `.env` file is in project root
2. Verify variables start with `VITE_`
3. Restart dev server: `npm run dev`
4. Check browser console for config values

### Issue 6: Email in Spam Folder

**Problem:** Email is being sent but goes to spam

**Fix:**
1. Check Gmail spam/junk folder
2. Mark as "Not Spam"
3. Add sender to contacts

## Quick Fix Steps

1. ✅ Check browser console for errors
2. ✅ Verify `.env` file has correct values
3. ✅ Restart dev server after changing `.env`
4. ✅ Check EmailJS Dashboard → Templates → "To Email" is `{{to_email}}`
5. ✅ Verify templates are published
6. ✅ Test template directly in EmailJS
7. ✅ Check EmailJS Activity Log
8. ✅ Check spam folder
9. ✅ Verify EmailJS quota not exceeded

## Still Not Working?

1. **Copy the exact error message from browser console**
2. **Check EmailJS Activity Log for specific errors**
3. **Test template directly in EmailJS Dashboard**
4. **Verify all template variables match:**
   - `{{to_email}}`
   - `{{to_name}}`
   - `{{username}}`
   - `{{registration_date}}`
   - `{{message}}`

## Contact Information

If still not working after checking all above:
- EmailJS Support: https://www.emailjs.com/support/
- EmailJS Documentation: https://www.emailjs.com/docs/
- Check EmailJS Dashboard for error messages

