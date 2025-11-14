# ⚠️ URGENT: Email Not Sending - Quick Fix

## 🔴 CRITICAL ISSUE: Template ID Mismatch

Your `.env` file has **wrong template IDs**! 

### Current .env File (WRONG):
```env
VITE_EMAILJS_TEMPLATE_ID_HOST=template_qclikqk
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_ztowwpc
```

### Should Be (CORRECT - Based on Your EmailJS Dashboard):
```env
VITE_EMAILJS_TEMPLATE_ID_HOST=template_pjxc82i
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_z495ecl
```

## 🔧 FIX THIS NOW:

### Step 1: Update .env File

Open your `.env` file and change:

```env
# OLD (WRONG):
VITE_EMAILJS_TEMPLATE_ID_HOST=template_qclikqk
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_ztowwpc

# NEW (CORRECT):
VITE_EMAILJS_TEMPLATE_ID_HOST=template_pjxc82i
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_z495ecl
```

### Step 2: Restart Dev Server

**IMPORTANT:** After updating `.env`, you MUST restart your dev server!

1. Stop server (Ctrl+C)
2. Run `npm run dev` again

### Step 3: Check Template "To Email" Field (MOST IMPORTANT!)

**This is the #1 reason emails don't send!**

1. Go to https://dashboard.emailjs.com/
2. Click **Email Templates**
3. Click on **"Register Host"** template (`template_pjxc82i`)
4. Click **Settings** tab
5. Find **"To Email"** field
6. **MUST be:** `{{to_email}}`
7. **NOT** empty
8. **NOT** a hardcoded email
9. Click **Save**
10. Repeat for **"Register Guest"** template (`template_z495ecl`)

### Step 4: Verify Templates Are Published

1. Make sure both templates are **Published** (not draft)
2. Click **Save** if you change anything

### Step 5: Test

1. Register a new user
2. Open browser console (F12)
3. Look for:
   - `📧 EmailJS: Using template ID: template_pjxc82i for user type: host`
   - `✅ Welcome email sent successfully!`
4. Check your Gmail inbox (and spam folder)

## 🎯 QUICK CHECKLIST

- [ ] Updated `.env` file with correct template IDs
- [ ] Restarted dev server
- [ ] Checked template "To Email" field is `{{to_email}}`
- [ ] Verified templates are published
- [ ] Tested registration
- [ ] Checked browser console for errors
- [ ] Checked Gmail inbox and spam folder

## 🔍 DEBUGGING

### Check Browser Console

After registering, open browser console (F12) and look for:

**✅ Good:**
- `📧 EmailJS: Using template ID: template_pjxc82i for user type: host`
- `✅ Welcome email sent successfully!`

**❌ Bad:**
- `❌ EmailJS host/guest template not configured`
- `❌ Error sending welcome email`
- `❌ Not Found - Check Service ID and Template ID are correct`

### Check EmailJS Activity Log

1. Go to EmailJS Dashboard → **Activity Log**
2. Register a new user
3. Check if email attempt appears
4. Look for error messages

## 📧 MOST COMMON ISSUES

### Issue 1: Template "To Email" Field Not Set

**Fix:** Set "To Email" to `{{to_email}}` in EmailJS Dashboard

### Issue 2: Template IDs Don't Match

**Fix:** Update `.env` file with correct template IDs (see above)

### Issue 3: Templates Not Published

**Fix:** Make sure templates are published (not draft)

### Issue 4: Service Not Active

**Fix:** Check EmailJS service is active

### Issue 5: Environment Variables Not Loaded

**Fix:** Restart dev server after changing `.env`

## 🆘 STILL NOT WORKING?

1. Check EmailJS Activity Log for specific errors
2. Test template directly in EmailJS Dashboard
3. Check browser Network tab for EmailJS API requests
4. Verify all template variables match:
   - `{{to_email}}`
   - `{{to_name}}`
   - `{{username}}`
   - `{{registration_date}}`
   - `{{message}}`

## 📝 FINAL .env FILE SHOULD BE:

```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=BCWKT-neLyeOkJ-Lz
VITE_EMAILJS_SERVICE_ID=service_2q8vvwm

# Email Template IDs - CORRECT IDs FROM YOUR EMAILJS DASHBOARD
VITE_EMAILJS_TEMPLATE_ID_HOST=template_pjxc82i
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_z495ecl
```

**After updating, RESTART your dev server!**

