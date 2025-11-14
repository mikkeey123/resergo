# 🔴 Email Not Sending - Fix Steps

## Error: "The template ID not found" (400 Bad Request)

### ✅ FIX THIS IN 3 STEPS:

### Step 1: Verify Templates Are Published (MOST IMPORTANT!)

**Templates MUST be Published, not Draft!**

1. Go to https://dashboard.emailjs.com/
2. Click **Email Templates**
3. Click on **"Register Host"** template (`template_pjxc82i`)
4. **Look at the top right** - Does it say "Published" or "Draft"?
5. If it says **"Draft"**:
   - Click **"Save"** button (blue button at top right)
   - Or look for a **"Publish"** button
   - Make sure template shows as **"Published"**
6. Repeat for **"Register Guest"** template (`template_z495ecl`)

### Step 2: Verify Service Association

**Templates must be associated with service `service_2q8vvwm`!**

1. Go to EmailJS Dashboard → Email Templates
2. Click on **"Register Host"** template
3. Click **Settings** tab
4. Look for **"Service"** field
5. **MUST be:** `service_2q8vvwm`
6. If different:
   - Change it to `service_2q8vvwm`
   - Click **Save**
7. Repeat for **"Register Guest"** template

### Step 3: Restart Dev Server

**CRITICAL:** After any changes, restart dev server!

1. Stop server (Ctrl+C)
2. Run `npm run dev` again
3. Clear browser cache (Ctrl+Shift+R)
4. Test registration again

## 🔍 VERIFY IN BROWSER CONSOLE:

After registering, check browser console (F12) for:

**Expected:**
```
📧 EmailJS: Using template ID: template_pjxc82i for user type: host
📧 EmailJS Config: { PUBLIC_KEY: 'BCWKT-neLyeOkJ-Lz', SERVICE_ID: 'service_2q8vvwm', TEMPLATE_ID_HOST: 'template_pjxc82i', TEMPLATE_ID_GUEST: 'template_z495ecl' }
```

**If template ID is different:**
- Your `.env` file has wrong template IDs
- Restart dev server
- Clear browser cache

## 📧 TEST IN EMAILJS DASHBOARD:

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
6. **If test works:** Template is correct - check service association
7. **If test fails:** Template might not be published or service is wrong

## 🎯 MOST COMMON ISSUES:

### Issue 1: Template Not Published

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Click on template
3. Look for "Published" or "Draft" status
4. If "Draft", click **"Save"** or **"Publish"**
5. Make sure it shows as **"Published"**

### Issue 2: Template in Wrong Service

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Click on template → Settings tab
3. Check **Service** field
4. Must be `service_2q8vvwm`
5. If different, change it and click **Save**

### Issue 3: Service Not Active

**Fix:**
1. Go to EmailJS Dashboard → Email Services
2. Check service `service_2q8vvwm` is **Active**
3. If not active, reconnect it

## 📝 QUICK CHECKLIST:

- [ ] Templates are **Published** (not draft)
- [ ] Templates are associated with service `service_2q8vvwm`
- [ ] Service `service_2q8vvwm` is **Active**
- [ ] `.env` file has correct template IDs
- [ ] `.env` file has correct service ID
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Tested template directly in EmailJS Dashboard

## 🆘 STILL NOT WORKING?

1. Check EmailJS Activity Log for specific errors
2. Verify template IDs match exactly in `.env` and EmailJS Dashboard
3. Verify service ID matches exactly in `.env` and EmailJS Dashboard
4. Test template directly in EmailJS Dashboard
5. Check browser console for actual template ID being used

