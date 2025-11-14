# Fix: EmailJS Template Not Published (400 Error)

## Issue

You're getting a 400 error because the EmailJS templates are in "Draft" mode and need to be published.

## Quick Fix Steps

### Step 1: Publish the Approval Template

1. **Go to EmailJS Dashboard**: https://dashboard.emailjs.com/admin/templates
2. **Find the "Approval" template** (Template ID: `template_d5qa8cd`)
3. **Click the "Edit" button** (pencil icon) on the Approval template
4. **Check the template status**:
   - If it says "Draft" at the top, you need to publish it
   - Look for a "Publish" button or toggle
5. **Publish the template**:
   - Click "Publish" button (usually at the top right)
   - Or toggle the "Published" switch
   - The status should change from "Draft" to "Published"

### Step 2: Publish the Rejection Template

1. **Find the "Rejection" template** (Template ID: `template_9508bwo`)
2. **Click the "Edit" button** (pencil icon)
3. **Publish the template** (same steps as above)

### Step 3: Verify Service Association

1. **In each template's edit page**, check the "Service" dropdown
2. **Make sure it's set to**: `service_2q8vvwm`
3. **If not**, change it to the correct service
4. **Save the template**

### Step 4: Verify Template Variables

Make sure your templates have these variables set up:

**For Approval Template (`template_d5qa8cd`):**
- `{{to_email}}` - Required (set in template settings)
- `{{to_name}}` - Optional
- `{{guest_name}}` - Optional
- `{{listing_title}}` - Optional
- `{{check_in}}` - Optional
- `{{check_out}}` - Optional
- `{{total_amount}}` - Optional
- `{{booking_date}}` - Optional

**For Rejection Template (`template_9508bwo`):**
- `{{to_email}}` - Required (set in template settings)
- `{{to_name}}` - Optional
- `{{guest_name}}` - Optional
- `{{listing_title}}` - Optional
- `{{check_in}}` - Optional
- `{{check_out}}` - Optional
- `{{booking_date}}` - Optional

### Step 5: Set "To Email" Field

1. **In the template editor**, find the "To Email" field
2. **Set it to**: `{{to_email}}`
3. **This is required** for EmailJS to know where to send the email

### Step 6: Test

1. **After publishing**, wait 1-2 minutes
2. **Try approving a booking** in your app
3. **Check browser console** - should see success message
4. **Check guest's email** - should receive the approval email

## Common Issues

### Issue 1: Template Still Shows as Draft

**Fix**:
- Make sure you clicked "Publish" (not just "Save")
- Check if there's a "Publish" toggle switch
- Some templates need to be saved first, then published separately

### Issue 2: Template Not Associated with Service

**Fix**:
- In template editor, check "Service" dropdown
- Select `service_2q8vvwm`
- Save the template

### Issue 3: "To Email" Field Not Set

**Fix**:
- In template editor, find "To Email" field
- Set it to `{{to_email}}`
- Save the template

### Issue 4: Template Variables Missing

**Fix**:
- Check template content
- Make sure variables are wrapped in double curly braces: `{{variable_name}}`
- Variables are case-sensitive

## Verification Checklist

After publishing:

- [ ] Approval template is published (not draft)
- [ ] Rejection template is published (not draft)
- [ ] Both templates are associated with service `service_2q8vvwm`
- [ ] "To Email" field is set to `{{to_email}}` in both templates
- [ ] Template variables are correctly formatted
- [ ] Waited 1-2 minutes after publishing
- [ ] Tested booking approval
- [ ] Checked browser console for success
- [ ] Checked guest email inbox

## Quick Reference

**Template IDs:**
- Approval: `template_d5qa8cd`
- Rejection: `template_9508bwo`

**Service ID:**
- `service_2q8vvwm`

**Required Variable:**
- `{{to_email}}` (must be set in template "To Email" field)

## If Still Not Working

1. **Check EmailJS Dashboard**:
   - Verify templates are published
   - Verify service association
   - Check template variables

2. **Check Browser Console**:
   - Look for specific error messages
   - Verify template ID matches

3. **Test with Different Template**:
   - Try creating a new template
   - Copy the template ID
   - Update `.env` file

4. **Contact EmailJS Support**:
   - If templates are published but still not working
   - Check EmailJS documentation

