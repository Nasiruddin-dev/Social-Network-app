# Adding Place and Tag Friends Feature

This update adds functionality to tag friends and add location when creating posts.

## Database Migration Required

Before using this feature, you need to update your MySQL database by adding two new columns to the `posts` table.

### Steps:

1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or command line)
2. Connect to your database
3. Run the SQL commands from: `api/migrations/add_place_and_taggedFriends_to_posts.sql`

Or run this directly:

```sql
ALTER TABLE posts 
ADD COLUMN place VARCHAR(255) NULL AFTER img,
ADD COLUMN taggedFriends TEXT NULL AFTER place;
```

## Features Added

### Frontend (Share Component):
- ✅ **Add Place**: Click "Add Place" button to add a location to your post
- ✅ **Tag Friends**: Click "Tag Friends" to open a searchable modal showing your friends
  - Search friends by name
  - Click on friends to tag/untag them
  - Selected friends show with a checkmark
- ✅ Display tagged friends and location before posting
- ✅ All fields clear after successful post

### Backend (Post Controller):
- ✅ Accept `place` and `taggedFriends` fields in post creation
- ✅ Store tagged friends as JSON string in database
- ✅ Handle null values for optional fields

### Post Display:
- ✅ Show location with 📍 icon (e.g., "John Doe is at Central Park")
- ✅ Show tagged friends (e.g., "with Jane Smith, Mike Johnson")
- ✅ Clickable friend names that link to their profiles (future enhancement)

## Usage

1. Run the database migration (see above)
2. Restart your backend server if it's running
3. Create a new post
4. Click "Add Place" to add a location
5. Click "Tag Friends" to select friends to tag
6. Post normally - the place and tags will be saved and displayed

## Notes

- Tagged friends are stored as JSON array: `[{"id": 1, "name": "John"}, ...]`
- Both place and tagged friends are optional
- The feature integrates with existing follow/friends system
