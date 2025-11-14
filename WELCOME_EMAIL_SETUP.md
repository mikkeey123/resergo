# Welcome Email Setup Guide

This guide explains how to set up the welcome email template in EmailJS for the ReserGo application.

## Overview

The welcome email is sent to users when they register as either a guest or host. **Separate templates are used for host and guest** - no conditional logic needed!

## Template Information

- **Host Template ID:** `template_pjxc82i` (or your custom template ID)
- **Guest Template ID:** `template_z495ecl` (or your custom template ID)
- **Host Template File:** `TEMPLATE_REGISTRATION_HOST.html`
- **Guest Template File:** `TEMPLATE_REGISTRATION_GUEST.html`
- **Environment Variables:** 
  - `VITE_EMAILJS_TEMPLATE_ID_HOST`
  - `VITE_EMAILJS_TEMPLATE_ID_GUEST`

## Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service

1. Log in to EmailJS Dashboard: https://dashboard.emailjs.com/
2. Go to **Email Services**
3. Click **Add New Service**
4. Choose your email provider (Gmail, Outlook, etc.)
5. Follow the setup instructions to connect your email
6. Copy the **Service ID** (e.g., `service_xxxxx`)

## Step 3: Create Email Templates

You need to create **TWO separate templates** - one for hosts and one for guests.

### Create Host Template

1. Go to **Email Templates** in EmailJS Dashboard
2. Click **Create New Template**
3. Name it: **"Register Host"** or **"Host Welcome Email"**
4. Copy the **Template ID** (e.g., `template_pjxc82i`)

### Create Guest Template

1. Click **Create New Template** again
2. Name it: **"Register Guest"** or **"Guest Welcome Email"**
3. Copy the **Template ID** (e.g., `template_z495ecl`)

### Template Settings (Both Templates)

1. **Subject Line:**
   ```
   Welcome to ReserGo, {{username}}!
   ```

2. **To Email Field:**
   ```
   {{to_email}}
   ```

3. **From Name:**
   ```
   ReserGo
   ```

4. **From Email:**
   - Use your verified sender email

## Step 4: Copy Template Designs

### For Host Template:

1. Open `TEMPLATE_REGISTRATION_HOST.html` in your project
2. Copy all the HTML content
3. In EmailJS template editor (for Host template), click on the **HTML** tab
4. Paste the HTML content
5. Click **Save**

### For Guest Template:

1. Open `TEMPLATE_REGISTRATION_GUEST.html` in your project
2. Copy all the HTML content
3. In EmailJS template editor (for Guest template), click on the **HTML** tab
4. Paste the HTML content
5. Click **Save**

## Step 5: Configure Environment Variables

Add these to your `.env` file:

```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here

# Email Template IDs (separate for host and guest)
# IMPORTANT: Update these to match your actual EmailJS Dashboard template IDs!
VITE_EMAILJS_TEMPLATE_ID_HOST=template_pjxc82i
VITE_EMAILJS_TEMPLATE_ID_GUEST=template_z495ecl
```

### How to Get Public Key

1. Go to EmailJS Dashboard
2. Click on **Account** > **General**
3. Copy the **Public Key**

### How to Get Service ID

1. Go to **Email Services** in EmailJS Dashboard
2. Click on your service
3. Copy the **Service ID**

### How to Get Template IDs

1. Go to **Email Templates** in EmailJS Dashboard
2. Click on your **Host** template
3. Copy the **Template ID** (this is your Host Template ID)
4. Click on your **Guest** template
5. Copy the **Template ID** (this is your Guest Template ID)

## Step 6: Test the Templates

### Test Host Template:

1. In EmailJS template editor (Host template), click **Test** button
2. Enter test parameters:
   - `to_email`: your test email
   - `username`: "Test Host"
   - `registration_date`: "January 15, 2024"
   - `message`: "Welcome to ReserGo!"
3. Click **Send Test Email**
4. Check your email inbox

### Test Guest Template:

1. In EmailJS template editor (Guest template), click **Test** button
2. Enter test parameters:
   - `to_email`: your test email
   - `username`: "Test Guest"
   - `registration_date`: "January 15, 2024"
   - `message`: "Welcome to ReserGo!"
3. Click **Send Test Email**
4. Check your email inbox

## Template Variables

The template uses the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Recipient email address | user@example.com |
| `{{to_name}}` | Recipient name | John Doe |
| `{{username}}` | Username | john_doe |
| `{{registration_date}}` | Registration date | January 15, 2024 |
| `{{message}}` | Welcome message | Welcome to ReserGo! |

## Template Features

### Host Template

- **Green color scheme** - Professional host branding
- **Host-specific welcome message** - "Your Host Journey Begins!"
- **"Start Listing Your Property" button** - Clear call-to-action
- **Host-specific features list** - List creation, pricing, bookings, earnings

### Guest Template

- **Blue color scheme** - Professional guest branding
- **Guest-specific welcome message** - "Start Your Journey!"
- **"Explore Listings" button** - Clear call-to-action
- **Guest-specific features list** - Explore, book, save favorites, manage bookings

### Design Elements (Both Templates)

- Professional gradient header
- Responsive design
- Color-coded sections (Green for host, Blue for guest)
- Clear call-to-action buttons
- Footer with support contact
- No conditional logic needed - each template is separate!

## Troubleshooting

### Email Not Sending - Most Common Issues

#### Issue 1: Template "To Email" Field Not Set (MOST COMMON!)

**Problem:** Template "To Email" field is empty or wrong in EmailJS Dashboard

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Click on your template (Host or Guest)
3. Go to **Settings** tab
4. Find **"To Email"** field
5. **MUST be:** `{{to_email}}`
6. **NOT** empty
7. **NOT** a hardcoded email
8. **NOT** `{{email}}` or any other variable
9. Click **Save**

This is the #1 reason emails don't send!

#### Issue 2: Environment Variables Not Loaded

**Problem:** `.env` variables not being read by the app

**Fix:**
1. Make sure `.env` file is in project root (same level as `package.json`)
2. Verify variables start with `VITE_`
3. **RESTART your dev server** after changing `.env`
   - Stop server (Ctrl+C)
   - Run `npm run dev` again
4. Check browser console for config values

#### Issue 3: Template IDs Don't Match

**Problem:** Template IDs in `.env` don't match EmailJS Dashboard

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Check actual Template IDs:
   - Host: Should be `template_qclikqk` (or your custom ID)
   - Guest: Should be `template_ztowwpc` (or your custom ID)
3. Update `.env` file with correct IDs
4. Restart dev server

#### Issue 4: Templates Not Published

**Problem:** Templates are in "Draft" mode

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Make sure templates are **Published** (not draft)
3. Click **Save** if you change anything

#### Issue 5: Service Not Active

**Problem:** Email service is not connected

**Fix:**
1. Go to EmailJS Dashboard → Email Services
2. Check service (`service_2q8vvwm`) is **Active**
3. If not active, click on it and reconnect
4. Verify connection with your email provider (Gmail, etc.)

#### Issue 6: Check Browser Console

**What to Look For:**
- Open Developer Tools (F12)
- Go to Console tab
- Register a new user
- Look for:
  - `📧 EmailJS: Starting welcome email send...`
  - `📧 EmailJS Config: { ... }`
  - `✅ Welcome email sent successfully!` OR error messages

**Common Errors:**
- `❌ EmailJS not configured` → Check `.env` file
- `❌ EmailJS host/guest template not configured` → Check Template IDs
- `❌ Error sending welcome email` → Check error details
- `⚠️ No email address available` → Check user email is valid

#### Issue 7: Check EmailJS Activity Log

1. Go to EmailJS Dashboard → **Activity Log**
2. Register a new user
3. Check if email attempt appears in log
4. Look for error messages
5. Check if email was sent successfully

#### Issue 8: Check Spam Folder

1. Check Gmail spam/junk folder
2. Mark as "Not Spam" if found
3. Add sender to contacts

#### Issue 9: EmailJS Quota Exceeded

1. Go to EmailJS Dashboard → Account → Usage
2. Check if you've exceeded free tier limit (200 emails/month)
3. If limit reached, upgrade plan or wait for reset

### Template Not Displaying Correctly

1. **Check HTML Format:**
   - Make sure HTML is properly formatted
   - Check for missing closing tags
   - Verify inline styles are preserved

2. **Check Email Client:**
   - Test in different email clients
   - Some email clients don't support all HTML/CSS features

3. **Check Variables:**
   - Verify all variables are being sent
   - Check variable names match exactly (case-sensitive)

### Wrong Template Used

1. **Check Template IDs:**
   - Verify Host Template ID in `.env` matches EmailJS dashboard
   - Verify Guest Template ID in `.env` matches EmailJS dashboard
   - Make sure the correct template is being used for each user type

2. **Check User Type:**
   - Verify user type is exactly "guest" or "host" (case-sensitive)
   - Check browser console logs to see which template is being used

## Quick Setup Checklist

- [ ] Created EmailJS account
- [ ] Created email service
- [ ] Created Host email template
- [ ] Created Guest email template
- [ ] Copied Host template HTML design
- [ ] Copied Guest template HTML design
- [ ] Configured template settings (Subject, To Email, From Name) for both templates
- [ ] Added environment variables to `.env` (Host and Guest Template IDs)
- [ ] Tested Host template with test data
- [ ] Tested Guest template with test data
- [ ] Verified Host email is received
- [ ] Verified Guest email is received
- [ ] Tested with actual host registration
- [ ] Tested with actual guest registration

## Support

If you encounter issues:
1. Check EmailJS documentation: https://www.emailjs.com/docs/
2. Check EmailJS dashboard for error logs
3. Verify all environment variables are set correctly
4. Test template in EmailJS test feature
5. Check browser console for errors

## Notes

- EmailJS free tier has limits on the number of emails per month
- Email failure won't block user registration (emails are sent asynchronously)
- **Separate templates** are used for host and guest (no conditional logic)
- Templates are responsive and work on desktop and mobile
- Templates use inline CSS for better email client compatibility
- Each template has its own unique design and branding
- Host template uses green color scheme
- Guest template uses blue color scheme

