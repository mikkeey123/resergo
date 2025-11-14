# ⚠️ URGENT: Template ID Not Found Error

## 🔴 Error Message:
```
The template ID not found. To find this ID, visit https://dashboard.emailjs.com/admin/templates
```

## 🔍 What This Means:

EmailJS cannot find the template with the ID you're using. This usually means:

1. **Template doesn't exist** - The template ID doesn't match any template in EmailJS
2. **Template not published** - The template exists but is in "Draft" mode
3. **Template in wrong service** - The template is associated with a different service ID
4. **Template ID is wrong** - The template ID in `.env` doesn't match EmailJS Dashboard

## 🔧 STEP-BY-STEP FIX:

### Step 1: Verify Template IDs in EmailJS Dashboard

1. Go to https://dashboard.emailjs.com/
2. Click **Email Templates**
3. Find your **"Register Host"** template
4. **Copy the exact Template ID** shown in EmailJS (should be `template_pjxc82i`)
5. Find your **"Register Guest"** template
6. **Copy the exact Template ID** shown in EmailJS (should be `template_z495ecl`)

### Step 2: Verify Templates Are Published

**CRITICAL:** Templates must be **Published** (not draft)!

1. Go to EmailJS Dashboard → Email Templates
2. Click on **"Register Host"** template
3. Check if it shows **"Published"** status
4. If it shows **"Draft"**, click **"Save"** or **"Publish"** button
5. Repeat for **"Register Guest"** template

### Step 3: Verify Templates Are Associated with Correct Service

1. Go to EmailJS Dashboard → Email Templates
2. Click on **"Register Host"** template
3. Go to **Settings** tab
4. Check which **Service** it's associated with
5. **MUST be:** `service_2q8vvwm` (or your service ID)
6. If different, change it to the correct service
7. Repeat for **"Register Guest"** template

### Step 4: Verify Service ID Matches

1. Go to EmailJS Dashboard → Email Services
2. Check your service ID is `service_2q8vvwm`
3. If different, update your `.env` file:
   ```env
   VITE_EMAILJS_SERVICE_ID=your_actual_service_id
   ```
4. Restart dev server

### Step 5: Update .env File

Make sure your `.env` file has the **exact** template IDs from EmailJS:

```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=BCWKT-neLyeOkJ-Lz
VITE_EMAILJS_SERVICE_ID=service_2q8vvwm

# Email Template IDs - MUST MATCH EMAILJS DASHBOARD EXACTLY!
VITE_EMAILJS_TEMPLATE_ID_HOST=template_pjxc82i
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_z495ecl
```

### Step 6: Restart Dev Server

**IMPORTANT:** After updating `.env`, **MUST restart dev server!**

1. Stop server (Ctrl+C)
2. Run `npm run dev` again
3. Clear browser cache (Ctrl+Shift+R)

### Step 7: Test Template Directly in EmailJS

1. Go to EmailJS Dashboard → Email Templates
2. Click on **"Register Host"** template
3. Click **"Test It"** button
4. Enter test parameters:
   - `to_email`: your Gmail address
   - `username`: "Test Host"
   - `registration_date`: "January 15, 2024"
   - `message`: "Welcome to ReserGo!"
   - `to_name`: "Test Host"
5. Click **Send Test Email**
6. Check if email is received
7. If test works, the template is correct
8. Repeat for **"Register Guest"** template

### Step 8: Check Browser Console

After registering, open browser console (F12) and look for:

**Check these values:**
- `📧 EmailJS: Using template ID: template_pjxc82i for user type: host`
- `📧 EmailJS Config: { PUBLIC_KEY: '...', SERVICE_ID: '...', TEMPLATE_ID_HOST: 'template_pjxc82i', TEMPLATE_ID_GUEST: 'template_z495ecl' }`

**If template ID doesn't match:**
- Check `.env` file has correct values
- Restart dev server
- Clear browser cache

## 🎯 MOST COMMON ISSUES:

### Issue 1: Template Not Published

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Click on template
3. Make sure it's **Published** (not draft)
4. Click **Save** if you change anything

### Issue 2: Template in Wrong Service

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Click on template
3. Go to **Settings** tab
4. Check **Service** field
5. Must match your `VITE_EMAILJS_SERVICE_ID` in `.env`
6. If different, change it or update `.env`

### Issue 3: Template ID Doesn't Match

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Check actual Template ID shown
3. Update `.env` file with exact Template ID
4. Restart dev server

### Issue 4: Service ID Doesn't Match

**Fix:**
1. Go to EmailJS Dashboard → Email Services
2. Check actual Service ID
3. Update `.env` file with exact Service ID
4. Restart dev server

### Issue 5: Environment Variables Not Loaded

**Fix:**
1. Make sure `.env` file is in project root
2. Verify variables start with `VITE_`
3. **Restart dev server** after changing `.env`
4. Clear browser cache

## 📝 CHECKLIST:

- [ ] Verified template IDs in EmailJS Dashboard
- [ ] Templates are **Published** (not draft)
- [ ] Templates are associated with correct service (`service_2q8vvwm`)
- [ ] `.env` file has correct template IDs
- [ ] `.env` file has correct service ID
- [ ] Dev server restarted after updating `.env`
- [ ] Browser cache cleared
- [ ] Tested template directly in EmailJS Dashboard
- [ ] Checked browser console for correct template IDs
- [ ] Verified service is active in EmailJS Dashboard

## 🔍 DEBUGGING:

### Check What Template ID Is Being Used

Open browser console and run:

```javascript
console.log('Host Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID_HOST);
console.log('Guest Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID_GUEST);
console.log('Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
```

### Expected Values:

```
Host Template ID: template_pjxc82i
Guest Template ID: template_z495ecl
Service ID: service_2q8vvwm
```

### If Values Don't Match:

1. Check `.env` file has correct values
2. Restart dev server
3. Clear browser cache
4. Check browser console for actual values

## 🆘 STILL NOT WORKING?

1. **Check EmailJS Activity Log:**
   - Go to EmailJS Dashboard → Activity Log
   - See if email attempts appear
   - Look for specific error messages

2. **Verify Template Exists:**
   - Go to EmailJS Dashboard → Email Templates
   - Make sure templates with IDs `template_pjxc82i` and `template_z495ecl` exist
   - If not, create new templates or update `.env` with existing template IDs

3. **Verify Service Association:**
   - Go to EmailJS Dashboard → Email Templates
   - Click on template → Settings tab
   - Check which service it's associated with
   - Must match `service_2q8vvwm` in your `.env`

4. **Check Template Status:**
   - Templates must be **Published** (not draft)
   - Templates must be **Active** (not deleted)

5. **Contact EmailJS Support:**
   - EmailJS Support: https://www.emailjs.com/support/
   - Check EmailJS documentation: https://www.emailjs.com/docs/

