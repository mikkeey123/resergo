# Fix: EmailJS Booking Approval Template Error (400)

## Issue

Getting a 400 error when trying to send booking approval emails:
```
api.emailjs.com/api/v1.0/email/send:1 Failed to load resource: the server responded with a status of 400
```

## Root Cause

The EmailJS template ID `template_d5qa8cd` is either:
1. **Not found** - Template doesn't exist in your EmailJS account
2. **Not published** - Template is in "Draft" mode
3. **Wrong Service ID** - Template is associated with a different service
4. **Missing variables** - Template requires variables that aren't being sent

## Solution Options

### Option 1: Create/Update the Template in EmailJS (Recommended)

1. **Go to EmailJS Dashboard**:
   - Visit https://dashboard.emailjs.com/admin/templates
   - Log in to your account

2. **Check if template exists**:
   - Look for a template with ID `template_d5qa8cd`
   - If it doesn't exist, create a new template

3. **Create/Edit Template**:
   - Click "Create New Template" or edit existing one
   - Set template ID to: `template_d5qa8cd`
   - Associate it with service: `service_2q8vvwm`

4. **Add Template Variables**:
   The template should use these variables:
   - `{{to_email}}` - Recipient email (required)
   - `{{to_name}}` - Recipient name
   - `{{guest_name}}` - Guest's name
   - `{{listing_title}}` - Listing title
   - `{{check_in}}` - Check-in date
   - `{{check_out}}` - Check-out date
   - `{{total_amount}}` - Total booking amount (formatted as ₱X,XXX.XX)
   - `{{booking_date}}` - Booking date

5. **Publish Template**:
   - Make sure template status is "Published" (not "Draft")
   - Save the template

6. **Verify Template ID**:
   - Copy the template ID from EmailJS Dashboard
   - Update your `.env` file:
     ```
     VITE_EMAILJS_TEMPLATE_ID_BOOKING_APPROVAL=template_d5qa8cd
     ```

7. **Restart dev server** after updating `.env`

### Option 2: Use Existing Template

1. **Check your EmailJS Dashboard** for existing templates
2. **Find a template** that works for booking approvals
3. **Copy its template ID**
4. **Update your `.env` file**:
   ```
   VITE_EMAILJS_TEMPLATE_ID_BOOKING_APPROVAL=your_actual_template_id_here
   ```
5. **Restart dev server**

### Option 3: Disable Email (Temporary)

If you don't need emails right now, the booking approval will still work. The email error is non-blocking - it just logs a warning.

## Template Variables Reference

The booking approval email sends these variables:

```javascript
{
  to_email: "guest@example.com",           // Required
  to_name: "Guest Name",
  guest_name: "Guest Name",
  listing_title: "Beautiful Apartment",
  check_in: "January 15, 2024",
  check_out: "January 20, 2024",
  total_amount: "₱5,000.00",
  booking_date: "January 10, 2024"
}
```

## EmailJS Template Example

Here's a simple template you can use:

**Subject**: Your Booking Has Been Approved!

**Body**:
```
Hello {{to_name}},

Great news! Your booking has been approved.

Booking Details:
- Listing: {{listing_title}}
- Check-in: {{check_in}}
- Check-out: {{check_out}}
- Total Amount: {{total_amount}}
- Booking Date: {{booking_date}}

We look forward to hosting you!

Best regards,
ReserGo Team
```

## Verification Steps

1. **Check EmailJS Dashboard**:
   - Template exists and is published
   - Template ID matches: `template_d5qa8cd`
   - Service ID matches: `service_2q8vvwm`

2. **Check `.env` file**:
   - `VITE_EMAILJS_TEMPLATE_ID_BOOKING_APPROVAL=template_d5qa8cd`
   - `VITE_EMAILJS_SERVICE_ID=service_2q8vvwm`
   - `VITE_EMAILJS_PUBLIC_KEY=BCWKT-neLyeOkJ-Lz`

3. **Restart dev server** after updating `.env`

4. **Test booking approval**:
   - Approve a booking
   - Check browser console for email success message
   - Check guest's email inbox

## Troubleshooting

### Error: "Template ID not found"

**Fix**:
1. Go to EmailJS Dashboard → Templates
2. Verify template ID exists
3. If not, create template with ID `template_d5qa8cd`
4. Update `.env` file
5. Restart dev server

### Error: "Template not published"

**Fix**:
1. Go to EmailJS Dashboard → Templates
2. Find template `template_d5qa8cd`
3. Click "Publish" button
4. Make sure status shows "Published"

### Error: "Service ID mismatch"

**Fix**:
1. Go to EmailJS Dashboard → Templates
2. Edit template `template_d5qa8cd`
3. Verify it's associated with service `service_2q8vvwm`
4. If not, change the service association

### Error: "Missing required variables"

**Fix**:
1. Check template variables in EmailJS Dashboard
2. Make sure all required variables are present
3. Verify variable names match exactly (case-sensitive)
4. Check that `{{to_email}}` is set in template settings

## Important Notes

- **Email errors are non-blocking**: Booking approval will still work even if email fails
- **Template must be published**: Draft templates won't work
- **Service must match**: Template must be associated with the correct service
- **Variables are case-sensitive**: `{{to_email}}` is different from `{{To_Email}}`
- **Restart required**: After updating `.env`, restart your dev server

## Quick Fix Checklist

- [ ] Template exists in EmailJS Dashboard
- [ ] Template ID is `template_d5qa8cd`
- [ ] Template is published (not draft)
- [ ] Template is associated with service `service_2q8vvwm`
- [ ] Template has `{{to_email}}` variable set
- [ ] `.env` file has `VITE_EMAILJS_TEMPLATE_ID_BOOKING_APPROVAL=template_d5qa8cd`
- [ ] Dev server restarted after updating `.env`
- [ ] Test booking approval and check console for success

## Support

If you continue to have issues:
1. Check EmailJS Dashboard for template status
2. Verify template ID and service ID match
3. Check browser console for specific error messages
4. Test with a different template ID
5. Contact EmailJS support if needed

