# Fix: Email Not Sending After Registration

## ⚠️ CRITICAL ISSUE FOUND

Your `.env` file has **different template IDs** than what's shown in your EmailJS Dashboard screenshots!

### Your .env File Has:
```
VITE_EMAILJS_TEMPLATE_ID_HOST=template_qclikqk
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_ztowwpc
```

### But Your EmailJS Dashboard Shows:
```
Host Template ID: template_pjxc82i
Guest Template ID: template_z495ecl
```

## 🔧 FIX THIS FIRST!

### Option 1: Update .env File (Recommended)

Update your `.env` file to match your EmailJS Dashboard:

```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=BCWKT-neLyeOkJ-Lz
VITE_EMAILJS_SERVICE_ID=service_2q8vvwm

# Email Template IDs - UPDATE THESE TO MATCH YOUR EMAILJS DASHBOARD!
VITE_EMAILJS_TEMPLATE_ID_HOST=template_pjxc82i
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_z495ecl
```

**IMPORTANT:** After updating `.env`, **RESTART your dev server!**
1. Stop server (Ctrl+C)
2. Run `npm run dev` again

### Option 2: Update EmailJS Template IDs

If you want to use the template IDs in your `.env` file:
1. Check if templates with IDs `template_qclikqk` and `template_ztowwpc` exist in EmailJS
2. If not, create new templates with those IDs
3. Or update your `.env` to match your existing templates (Option 1 - Recommended)

## ✅ STEP-BY-STEP FIX

### Step 1: Check Template "To Email" Field (MOST IMPORTANT!)

**This is the #1 reason emails don't send!**

For **BOTH** templates in EmailJS Dashboard:

1. Go to https://dashboard.emailjs.com/
2. Click **Email Templates**
3. Click on **"Register Host"** template (`template_pjxc82i`)
4. Click on **Settings** tab
5. Find **"To Email"** field
6. **MUST be:** `{{to_email}}`
7. **NOT** empty
8. **NOT** a hardcoded email
9. Click **Save**
10. Repeat for **"Register Guest"** template (`template_z495ecl`)

### Step 2: Verify Template IDs Match

1. Go to EmailJS Dashboard → Email Templates
2. Check actual Template IDs:
   - **Register Host**: `template_pjxc82i`
   - **Register Guest**: `template_z495ecl`
3. Update `.env` file to match (see above)
4. **Restart dev server**

### Step 3: Verify Templates Are Published

1. Go to EmailJS Dashboard → Email Templates
2. Make sure both templates are **Published** (not draft)
3. Click **Save** if you change anything

### Step 4: Verify Service is Active

1. Go to EmailJS Dashboard → Email Services
2. Check service (`service_2q8vvwm`) is **Active**
3. If not active, reconnect it

### Step 5: Test Templates Directly

1. Go to EmailJS Dashboard → Email Templates
2. Click on **"Register Host"** template
3. Click **"Test It"** button
4. Enter:
   - `to_email`: your Gmail address
   - `username`: "Test Host"
   - `registration_date`: "January 15, 2024"
   - `message`: "Welcome to ReserGo!"
   - `to_name`: "Test Host"
5. Click **Send Test Email**
6. Check your Gmail inbox (and spam folder)
7. Repeat for **"Register Guest"** template

### Step 6: Check Browser Console

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Register a new user
4. Look for these logs:

**✅ Good Signs:**
- `📧 EmailJS: Starting welcome email send...`
- `📧 EmailJS Config: { PUBLIC_KEY: '...', SERVICE_ID: '...', TEMPLATE_ID_HOST: 'template_pjxc82i', TEMPLATE_ID_GUEST: 'template_z495ecl' }`
- `📧 EmailJS: Using template ID: template_pjxc82i for user type: host`
- `✅ Welcome email sent successfully!`

**❌ Bad Signs:**
- `❌ EmailJS not configured`
- `❌ EmailJS host/guest template not configured`
- `❌ Error sending welcome email`
- `❌ Not Found - Check Service ID and Template ID are correct`

### Step 7: Check EmailJS Activity Log

1. Go to EmailJS Dashboard → **Activity Log**
2. Register a new user
3. Check if email attempt appears in log
4. Look for error messages
5. Check if email was sent successfully

### Step 8: Check Spam Folder

1. Check Gmail spam/junk folder
2. Mark as "Not Spam" if found
3. Add sender to contacts

## 🎯 QUICK FIX CHECKLIST

- [ ] Update `.env` file with correct Template IDs (`template_pjxc82i` and `template_z495ecl`)
- [ ] Restart dev server after updating `.env`
- [ ] Check template "To Email" field is `{{to_email}}` in EmailJS Dashboard
- [ ] Verify templates are published (not draft)
- [ ] Verify service is active
- [ ] Test templates directly in EmailJS Dashboard
- [ ] Check browser console for errors
- [ ] Check EmailJS Activity Log
- [ ] Check spam folder

## 🔍 DEBUGGING

### Check Current Configuration

Open browser console and run:

```javascript
console.log('Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
console.log('Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
console.log('Host Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID_HOST);
console.log('Guest Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID_GUEST);
```

### Expected Values:

```
Public Key: BCWKT-neLyeOkJ-Lz
Service ID: service_2q8vvwm
Host Template ID: template_pjxc82i
Guest Template ID: template_z495ecl
```

### If Values Don't Match:

1. Check `.env` file is in project root
2. Verify variables start with `VITE_`
3. Restart dev server
4. Check browser console for actual values

## 📧 TEST EMAIL SENDING

After fixing the configuration, test by:

1. Register a new user
2. Check browser console for email logs
3. Check EmailJS Activity Log
4. Check Gmail inbox (and spam folder)

## 🆘 STILL NOT WORKING?

1. **Check EmailJS Activity Log** for specific error messages
2. **Test template directly** in EmailJS Dashboard
3. **Check browser Network tab** for EmailJS API requests
4. **Verify all template variables** match:
   - `{{to_email}}`
   - `{{to_name}}`
   - `{{username}}`
   - `{{registration_date}}`
   - `{{message}}`
5. **Contact EmailJS Support** if issue persists

