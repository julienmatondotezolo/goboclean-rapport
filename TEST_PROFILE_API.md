# Testing Profile API - Quick Guide

## Prerequisites
✅ Backend is running on `http://localhost:3001`
✅ Frontend is running
✅ User is logged in

## Test 1: Dashboard Profile Display

1. Navigate to the dashboard page
2. **Expected Result**: 
   - Welcome card shows your profile picture (not the default "Marc" avatar)
   - Your first name appears instead of "Marc"
   - If you completed onboarding, your picture should be visible

## Test 2: Profile Page Display

1. Navigate to `/profile` page
2. **Expected Result**:
   - Your profile picture is displayed in the large circular avatar
   - Your full name (first + last) is shown below the picture
   - Your role (Worker/Administrator) is displayed

## Test 3: Update Profile Picture

1. Go to `/profile` page
2. Click the green pencil icon (edit button) on the bottom-right of the avatar
3. Select an image file from your device
   - Try different formats: JPG, PNG, WEBP
4. **Expected Result**:
   - Loading spinner appears briefly
   - Picture updates immediately after upload
   - Success toast message appears: "Profile picture updated"
   - New picture is visible

## Test 4: Validation Tests

### Test Invalid File Type
1. Try to upload a PDF or text file
2. **Expected Result**: Error message "Please select an image file"

### Test Large File
1. Try to upload an image larger than 5MB
2. **Expected Result**: Error message "Image size must be less than 5MB"

## Test 5: Persistence

1. Update your profile picture
2. Refresh the page
3. **Expected Result**: New picture persists after refresh

4. Navigate to dashboard
5. **Expected Result**: New picture also appears in dashboard welcome card

## API Endpoints to Test Manually

### Get Profile
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "profile_picture_url": "https://...",
  "role": "worker",
  "is_onboarded": true
}
```

### Update Profile Picture
```bash
curl -X PUT http://localhost:3001/auth/profile/picture \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "profilePicture=@/path/to/image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile picture updated successfully",
  "user": {
    "id": "user-id",
    "profile_picture_url": "https://...",
    ...
  }
}
```

## Troubleshooting

### Picture Not Showing
- Check browser console for errors
- Verify Supabase Storage bucket `profile-pictures` exists
- Check RLS policies allow public read access
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in backend `.env`

### Upload Fails
- Check backend logs in terminal
- Verify user is authenticated (valid session)
- Check file size and type
- Verify Supabase Storage permissions

### Old Picture Still Shows
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
- Check if URL includes cache-busting parameter
- Clear browser cache

## Success Criteria

✅ Dashboard shows user's profile picture and first name
✅ Profile page displays user's profile picture
✅ Clicking edit button opens file picker
✅ Uploading new picture updates the UI immediately
✅ Success message appears after upload
✅ Invalid files are rejected with appropriate errors
✅ Picture persists after page refresh
✅ Picture appears consistently across dashboard and profile pages
