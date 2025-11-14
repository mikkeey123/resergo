# Booking Email Setup Guide

## Overview

This guide explains how to set up EmailJS templates for booking approval and rejection emails. When a host approves or cancels a guest's booking, an email will be automatically sent to the guest.

**📄 For detailed template setup instructions, see: `BOOKING_EMAIL_TEMPLATE_SETUP.md`**

**📄 Template HTML files:**
- `TEMPLATE_BOOKING_APPROVAL.html` - Approval email template
- `TEMPLATE_BOOKING_REJECTION.html` - Rejection email template

## Template Information

- **Approval Template ID:** `template_d5qa8cd`
- **Rejection Template ID:** `template_9508bwo`
- **Environment Variables:**
  - `VITE_EMAILJS_TEMPLATE_ID_BOOKING_APPROVAL`
  - `VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION`

## Step 1: Verify Templates in EmailJS Dashboard

1. Go to https://dashboard.emailjs.com/
2. Click **Email Templates**
3. Verify these templates exist:
   - **Approval** (Template ID: `template_d5qa8cd`)
   - **Rejection** (Template ID: `template_9508bwo`)

## Step 2: Configure Template Settings

### For Approval Template (`template_d5qa8cd`):

1. Click on the **Approval** template
2. Go to **Settings** tab
3. Set **"To Email"** to: `{{to_email}}`
4. Make sure template is **Published** (not draft)
5. Verify template is associated with service: `service_2q8vvwm` (or your service ID)

### For Rejection Template (`template_9508bwo`):

1. Click on the **Rejection** template
2. Go to **Settings** tab
3. Set **"To Email"** to: `{{to_email}}`
4. Make sure template is **Published** (not draft)
5. Verify template is associated with service: `service_2q8vvwm` (or your service ID)

## Step 3: Configure Template Variables

### Approval Template Variables:

The following variables are available in your Approval template:

- `{{to_email}}` - Guest's email address (required for "To Email" field)
- `{{to_name}}` - Guest's name
- `{{guest_name}}` - Guest's name
- `{{listing_title}}` - Title of the listing
- `{{check_in}}` - Check-in date (formatted: "January 15, 2024")
- `{{check_out}}` - Check-out date (formatted: "January 20, 2024")
- `{{total_amount}}` - Total booking amount (formatted: "₱1,500.00")
- `{{booking_date}}` - Date when booking was approved

### Rejection Template Variables:

The following variables are available in your Rejection template:

- `{{to_email}}` - Guest's email address (required for "To Email" field)
- `{{to_name}}` - Guest's name
- `{{guest_name}}` - Guest's name
- `{{listing_title}}` - Title of the listing
- `{{check_in}}` - Check-in date (formatted: "January 15, 2024")
- `{{check_out}}` - Check-out date (formatted: "January 20, 2024")
- `{{booking_date}}` - Date when booking was rejected

## Step 4: Configure Environment Variables

Add these to your `.env` file:

```env
# Booking Email Templates
VITE_EMAILJS_TEMPLATE_ID_BOOKING_APPROVAL=template_d5qa8cd
VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION=template_9508bwo
```

**Important:** After updating `.env`, restart your dev server!

## Step 5: Test the Templates

### Test Approval Template:

1. Go to EmailJS Dashboard → Email Templates
2. Click on **Approval** template
3. Click **"Test It"** button
4. Enter test parameters:
   - `to_email`: your test email address
   - `to_name`: "Test Guest"
   - `guest_name`: "Test Guest"
   - `listing_title`: "Beautiful Beach House"
   - `check_in`: "January 15, 2024"
   - `check_out`: "January 20, 2024"
   - `total_amount`: "₱5,000.00"
   - `booking_date`: "January 10, 2024"
5. Click **Send Test Email**
6. Check your email inbox

### Test Rejection Template:

1. Go to EmailJS Dashboard → Email Templates
2. Click on **Rejection** template
3. Click **"Test It"** button
4. Enter test parameters:
   - `to_email`: your test email address
   - `to_name`: "Test Guest"
   - `guest_name`: "Test Guest"
   - `listing_title`: "Beautiful Beach House"
   - `check_in`: "January 15, 2024"
   - `check_out`: "January 20, 2024"
   - `booking_date`: "January 10, 2024"
5. Click **Send Test Email**
6. Check your email inbox

## How It Works

### When Host Approves a Booking:

1. Host clicks "Approve" on a pending booking
2. System processes payment (deducts from guest wallet, adds to host wallet)
3. Booking status is updated to "active"
4. **Email is automatically sent to guest** using Approval template
5. Guest receives confirmation email with booking details

### When Host Cancels/Rejects a Booking:

1. Host clicks "Cancel" on a pending booking
2. Booking status is updated to "canceled"
3. **Email is automatically sent to guest** using Rejection template
4. Guest receives notification that their booking was canceled

## Troubleshooting

### Email Not Sending

1. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for email-related logs:
     - `📧 EmailJS: Starting booking approval email send...`
     - `✅ Booking approval email sent successfully!` OR error messages

2. **Check Template Settings:**
   - Verify "To Email" is set to `{{to_email}}`
   - Verify templates are **Published** (not draft)
   - Verify templates are associated with correct service

3. **Check Environment Variables:**
   - Verify `.env` file has correct template IDs
   - Restart dev server after updating `.env`
   - Check browser console for actual template IDs being used

4. **Check EmailJS Activity Log:**
   - Go to EmailJS Dashboard → Activity Log
   - Look for email attempts
   - Check for error messages

### Common Issues

**Issue 1: Template "To Email" Field Not Set**
- **Fix:** Set "To Email" to `{{to_email}}` in EmailJS Dashboard

**Issue 2: Templates Not Published**
- **Fix:** Make sure templates are Published (not draft)

**Issue 3: Template IDs Don't Match**
- **Fix:** Update `.env` file with correct template IDs from EmailJS Dashboard

**Issue 4: Service Not Active**
- **Fix:** Check EmailJS service is active

## Email Template Examples

### Approval Email Should Include:

- Guest's name
- Listing title
- Check-in and check-out dates
- Total amount paid
- Confirmation message
- Next steps or instructions

### Rejection Email Should Include:

- Guest's name
- Listing title
- Check-in and check-out dates
- Apology message
- Alternative suggestions (optional)

## Notes

- Emails are sent asynchronously and won't block booking approval/rejection
- If email fails, booking will still be processed (error is logged only)
- Check browser console for email sending status
- EmailJS free tier: 200 emails/month

## Quick Checklist

- [ ] Templates exist in EmailJS Dashboard
- [ ] Templates are Published (not draft)
- [ ] "To Email" field is set to `{{to_email}}`
- [ ] Templates are associated with correct service
- [ ] `.env` file has correct template IDs
- [ ] Dev server restarted after updating `.env`
- [ ] Tested templates directly in EmailJS Dashboard
- [ ] Checked browser console for email logs
- [ ] Verified emails are received

