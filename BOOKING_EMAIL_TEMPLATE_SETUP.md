# Booking Email Template Setup Guide

## Overview

This guide provides step-by-step instructions for setting up EmailJS templates for booking approval and cancellation emails.

## Template Files

- **Approval Template:** `TEMPLATE_BOOKING_APPROVAL.html`
- **Rejection Template:** `TEMPLATE_BOOKING_REJECTION.html`

## Step 1: Create Templates in EmailJS Dashboard

### Create Approval Template

1. Go to https://dashboard.emailjs.com/
2. Click **Email Templates** in the sidebar
3. Click **"+ Create New Template"** button
4. Name it: **"Approval"** (or "Booking Approval")
5. Click **"Create"**

### Create Rejection Template

1. Click **"+ Create New Template"** button again
2. Name it: **"Rejection"** (or "Booking Rejection")
3. Click **"Create"**

## Step 2: Copy Template HTML

### For Approval Template:

1. Open `TEMPLATE_BOOKING_APPROVAL.html` in your project
2. Copy **ALL** the HTML content (from `<!DOCTYPE html>` to `</html>`)
3. Go to EmailJS Dashboard → Email Templates → **Approval** template
4. Click **"Content"** tab
5. Click **"Edit Content"** button (pencil icon)
6. Switch to **"Code"** view (HTML editor)
7. **Delete all existing content**
8. **Paste** the copied HTML
9. Click **"Save"**

### For Rejection Template:

1. Open `TEMPLATE_BOOKING_REJECTION.html` in your project
2. Copy **ALL** the HTML content (from `<!DOCTYPE html>` to `</html>`)
3. Go to EmailJS Dashboard → Email Templates → **Rejection** template
4. Click **"Content"** tab
5. Click **"Edit Content"** button (pencil icon)
6. Switch to **"Code"** view (HTML editor)
7. **Delete all existing content**
8. **Paste** the copied HTML
9. Click **"Save"**

## Step 3: Configure Template Settings

### For Approval Template (`template_d5qa8cd`):

1. Click **"Settings"** tab
2. **Name:** Approval (or Booking Approval)
3. **Template ID:** Note this ID (should be `template_d5qa8cd` or similar)
4. **To Email:** `{{to_email}}` ⚠️ **CRITICAL - Must be exactly this!**
5. **From Name:** ReserGo Team
6. **From Email:** Use default email address (checked)
7. **Reply To:** (leave empty or set to support email)
8. Click **"Save"**

### For Rejection Template (`template_9508bwo`):

1. Click **"Settings"** tab
2. **Name:** Rejection (or Booking Rejection)
3. **Template ID:** Note this ID (should be `template_9508bwo` or similar)
4. **To Email:** `{{to_email}}` ⚠️ **CRITICAL - Must be exactly this!**
5. **From Name:** ReserGo Team
6. **From Email:** Use default email address (checked)
7. **Reply To:** (leave empty or set to support email)
8. Click **"Save"**

## Step 4: Configure Subject Line

### For Approval Template:

1. Go to **"Content"** tab
2. Find **"Subject"** field
3. Set subject to: `Booking Approved - {{listing_title}}`
   - Or: `Your booking for {{listing_title}} has been approved!`
4. Click **"Save"**

### For Rejection Template:

1. Go to **"Content"** tab
2. Find **"Subject"** field
3. Set subject to: `Booking Cancelled - {{listing_title}}`
   - Or: `Your booking for {{listing_title}} has been cancelled`
4. Click **"Save"**

## Step 5: Publish Templates

**CRITICAL:** Templates must be **Published** (not draft) to work!

### For Both Templates:

1. Make sure you're on the template page
2. Look for **"Published"** or **"Draft"** status
3. If it says **"Draft"**, click **"Save"** button (blue button at top right)
4. Verify it shows **"Published"** status
5. Repeat for both templates

## Step 6: Verify Service Association

### For Both Templates:

1. Go to **"Settings"** tab
2. Check **"Service"** field
3. **Must be:** `service_2q8vvwm` (or your service ID)
4. If different, change it to your service ID
5. Click **"Save"**

## Step 7: Configure Environment Variables

### Update `.env` file:

Add these lines to your `.env` file:

```env
# Booking Email Templates
VITE_EMAILJS_TEMPLATE_ID_BOOKING_APPROVAL=template_d5qa8cd
VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION=template_9508bwo
```

**Important:** 
- Replace `template_d5qa8cd` with your actual Approval template ID from EmailJS
- Replace `template_9508bwo` with your actual Rejection template ID from EmailJS
- After updating `.env`, **restart your dev server!**

## Step 8: Test Templates

### Test Approval Template:

1. Go to EmailJS Dashboard → Email Templates → **Approval** template
2. Click **"Test It"** button (beaker icon)
3. Enter test parameters:
   ```
   to_email: your-test-email@gmail.com
   to_name: Test Guest
   guest_name: Test Guest
   listing_title: Beautiful Beach House
   check_in: January 15, 2024
   check_out: January 20, 2024
   total_amount: ₱5,000.00
   booking_date: January 10, 2024
   ```
4. Click **"Send Test Email"**
5. Check your email inbox (and spam folder)

### Test Rejection Template:

1. Go to EmailJS Dashboard → Email Templates → **Rejection** template
2. Click **"Test It"** button (beaker icon)
3. Enter test parameters:
   ```
   to_email: your-test-email@gmail.com
   to_name: Test Guest
   guest_name: Test Guest
   listing_title: Beautiful Beach House
   check_in: January 15, 2024
   check_out: January 20, 2024
   booking_date: January 10, 2024
   ```
4. Click **"Send Test Email"**
5. Check your email inbox (and spam folder)

## Template Variables Reference

### Approval Template Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Guest's email (required for "To Email") | `guest@example.com` |
| `{{to_name}}` | Guest's name | `John Doe` |
| `{{guest_name}}` | Guest's name | `John Doe` |
| `{{listing_title}}` | Title of the listing | `Beautiful Beach House` |
| `{{check_in}}` | Check-in date | `January 15, 2024` |
| `{{check_out}}` | Check-out date | `January 20, 2024` |
| `{{total_amount}}` | Total booking amount | `₱5,000.00` |
| `{{booking_date}}` | Date when booking was approved | `January 10, 2024` |

### Rejection Template Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Guest's email (required for "To Email") | `guest@example.com` |
| `{{to_name}}` | Guest's name | `John Doe` |
| `{{guest_name}}` | Guest's name | `John Doe` |
| `{{listing_title}}` | Title of the listing | `Beautiful Beach House` |
| `{{check_in}}` | Check-in date | `January 15, 2024` |
| `{{check_out}}` | Check-out date | `January 20, 2024` |
| `{{booking_date}}` | Date when booking was rejected | `January 10, 2024` |

## Troubleshooting

### Issue 1: "To Email" Field Not Set

**Symptoms:**
- Email not sending
- Error: "The recipients address is empty"

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Click on template → **Settings** tab
3. Set **"To Email"** to: `{{to_email}}`
4. Click **"Save"**

### Issue 2: Template Not Published

**Symptoms:**
- Error: "Template ID not found"
- Template not working

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Click on template
3. Make sure it shows **"Published"** (not draft)
4. Click **"Save"** if needed

### Issue 3: Template IDs Don't Match

**Symptoms:**
- Error: "Template ID not found"
- Wrong template being used

**Fix:**
1. Check actual Template IDs in EmailJS Dashboard
2. Update `.env` file with correct IDs
3. Restart dev server

### Issue 4: Service Not Associated

**Symptoms:**
- Email not sending
- Service error

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Click on template → **Settings** tab
3. Check **"Service"** field
4. Must match your service ID (`service_2q8vvwm`)
5. Click **"Save"**

## Quick Checklist

- [ ] Created Approval template in EmailJS
- [ ] Created Rejection template in EmailJS
- [ ] Copied HTML from `TEMPLATE_BOOKING_APPROVAL.html` to Approval template
- [ ] Copied HTML from `TEMPLATE_BOOKING_REJECTION.html` to Rejection template
- [ ] Set "To Email" to `{{to_email}}` for both templates
- [ ] Configured subject lines for both templates
- [ ] Published both templates (not draft)
- [ ] Verified service association for both templates
- [ ] Updated `.env` file with template IDs
- [ ] Restarted dev server after updating `.env`
- [ ] Tested both templates in EmailJS Dashboard
- [ ] Verified emails are received

## Testing in Application

### Test Approval Email:

1. Log in as a host
2. Go to Bookings page
3. Find a pending booking
4. Click **"Approve"** button
5. Check browser console for email logs:
   - `📧 EmailJS: Starting booking approval email send...`
   - `✅ Booking approval email sent successfully!`
6. Check guest's email inbox

### Test Rejection Email:

1. Log in as a host
2. Go to Bookings page
3. Find a pending booking
4. Click **"Cancel"** button
5. Check browser console for email logs:
   - `📧 EmailJS: Starting booking rejection email send...`
   - `✅ Booking rejection email sent successfully!`
6. Check guest's email inbox

## Notes

- Emails are sent automatically when host approves or cancels a booking
- Email sending is non-blocking (won't fail booking if email fails)
- Check browser console for email status logs
- EmailJS free tier: 200 emails/month
- Templates are responsive and work on mobile devices
- Green theme for approval emails (success)
- Red theme for rejection emails (cancellation)

## Support

If you encounter any issues:

1. Check EmailJS Activity Log for errors
2. Check browser console for detailed error messages
3. Verify all template variables are set correctly
4. Test templates directly in EmailJS Dashboard
5. Contact EmailJS support if needed

