# 🔴 URGENT: Template ID Not Found - Quick Fix

## Error: "The template ID not found"

This means EmailJS cannot find the template with the ID you're using.

## ✅ IMMEDIATE FIXES:

### Fix 1: Verify Templates Are Published (MOST IMPORTANT!)

**Templates MUST be Published, not Draft!**

1. Go to https://dashboard.emailjs.com/
2. Click **Email Templates**
3. Click on **"Register Host"** template (`template_pjxc82i`)
4. Look for **"Published"** or **"Draft"** status
5. If it says **"Draft"**, click **"Save"** or **"Publish"** button
6. Repeat for **"Register Guest"** template (`template_z495ecl`)

### Fix 2: Verify Service Association

**Templates must be associated with the correct service!**

1. Go to EmailJS Dashboard → Email Templates
2. Click on **"Register Host"** template
3. Go to **Settings** tab
4. Check which **Service** it's associated with
5. **MUST be:** `service_2q8vvwm`
6. If different, change it to `service_2q8vvwm`
7. Click **Save**
8. Repeat for **"Register Guest"** template

### Fix 3: Verify Service ID Matches

1. Go to EmailJS Dashboard → Email Services
2. Check your service ID is `service_2q8vvwm`
3. If different, update your `.env` file:
   ```env
   VITE_EMAILJS_SERVICE_ID=your_actual_service_id
   ```
4. **Restart dev server**

### Fix 4: Test Template Directly in EmailJS

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
6. **If test works**, template is correct - check service association
7. **If test fails**, template might not be published or service is wrong

### Fix 5: Restart Dev Server

**CRITICAL:** After any changes, restart dev server!

1. Stop server (Ctrl+C)
2. Run `npm run dev` again
3. Clear browser cache (Ctrl+Shift+R)

## 🔍 CHECK BROWSER CONSOLE:

After registering, check browser console (F12) for:

**Look for these values:**
```
📧 EmailJS: Using template ID: template_pjxc82i for user type: host
📧 EmailJS Config: { PUBLIC_KEY: '...', SERVICE_ID: 'service_2q8vvwm', TEMPLATE_ID_HOST: 'template_pjxc82i', TEMPLATE_ID_GUEST: 'template_z495ecl' }
```

**If template ID is different:**
- Check `.env` file
- Restart dev server
- Clear browser cache

## 📝 CHECKLIST:

- [ ] Templates are **Published** (not draft) in EmailJS Dashboard
- [ ] Templates are associated with service `service_2q8vvwm`
- [ ] Service `service_2q8vvwm` is **Active** in EmailJS Dashboard
- [ ] `.env` file has correct template IDs (`template_pjxc82i` and `template_z495ecl`)
- [ ] `.env` file has correct service ID (`service_2q8vvwm`)
- [ ] Dev server restarted after updating `.env`
- [ ] Browser cache cleared
- [ ] Tested template directly in EmailJS Dashboard (test works)

## 🆘 IF STILL NOT WORKING:

1. **Check EmailJS Activity Log:**
   - Go to EmailJS Dashboard → Activity Log
   - Register a new user
   - Check if email attempt appears
   - Look for specific error messages

2. **Verify Template Exists:**
   - Go to EmailJS Dashboard → Email Templates
   - Make sure templates with IDs `template_pjxc82i` and `template_z495ecl` exist
   - Check template names match: "Register Host" and "Register Guest"

3. **Check Service Status:**
   - Go to EmailJS Dashboard → Email Services
   - Check service `service_2q8vvwm` is **Active**
   - If not active, reconnect it

4. **Verify Template Settings:**
   - Go to EmailJS Dashboard → Email Templates
   - Click on template → Settings tab
   - Check "To Email" is `{{to_email}}`
   - Check "Service" matches `service_2q8vvwm`
   - Click **Save** if you change anything

## 📧 MOST LIKELY ISSUE:

**Templates are in "Draft" mode or not associated with the correct service!**

**Fix:**
1. Publish templates (not draft)
2. Associate templates with service `service_2q8vvwm`
3. Save templates
4. Restart dev server
5. Test again

