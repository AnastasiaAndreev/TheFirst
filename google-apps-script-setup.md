# Google Apps Script Setup for The First Hookah Bar

## Step 1: Create Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "The First - Bookings & Users"
4. Create 2 sheets (tabs):
   - **bookings** - for table reservations
   - **users** - for customer accounts and discounts

## Step 2: Set up the "bookings" sheet
Add these headers in row 1:
```
A1: timestamp | B1: name | C1: phone | D1: date | E1: time | F1: guests | G1: tableType | H1: comment | I1: userName | J1: userPhone | K1: userEmail
```

## Step 3: Set up the "users" sheet  
Add these headers in row 1:
```
A1: name | B1: phone | C1: email | D1: password | E1: bookingsCount | F1: discount | G1: lastUpdated
```

## Step 4: Create Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Name it "The First Web App"
4. Replace the default code with the code below
5. Save the project

## Step 5: Deploy as Web App
1. Click "Deploy" → "New deployment"
2. Choose "Web app"
3. Set "Execute as": "Me"
4. Set "Who has access": "Anyone"
5. Click "Deploy"
6. Copy the Web App URL

## Step 6: Update Website URLs
Replace the placeholder URLs in these files:
- `js/booking.js` line 8: `this.googleSheetsURL = 'YOUR_WEB_APP_URL'`
- `js/auth.js` line 3: `SHEETS_BOOKINGS_URL = 'YOUR_SHEET_URL'`

## Apps Script Code:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'booking') {
      return handleBooking(data);
    } else if (action === 'upsertUser') {
      return handleUserUpsert(data);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid action'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleBooking(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('bookings');
  const row = [
    data.timestamp || new Date().toISOString(),
    data.name,
    data.phone,
    data.date,
    data.time,
    data.guests,
    data.tableType,
    data.comment || '',
    data.userName || '',
    data.userPhone || '',
    data.userEmail || ''
  ];
  
  sheet.appendRow(row);
  
  // Update user bookings count if user exists
  if (data.userPhone) {
    updateUserBookings(data.userPhone);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Booking saved successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleUserUpsert(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
  const phone = data.phone;
  
  // Find existing user
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  let userRow = -1;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][1] === phone) { // phone is in column B
      userRow = i + 1;
      break;
    }
  }
  
  const userData = [
    data.name,
    data.phone,
    data.email || '',
    data.password || '',
    data.bookingsCount || 0,
    data.discount || 0,
    new Date().toISOString()
  ];
  
  if (userRow > 0) {
    // Update existing user
    sheet.getRange(userRow, 1, 1, userData.length).setValues([userData]);
  } else {
    // Add new user
    sheet.appendRow(userData);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'User saved successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateUserBookings(phone) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][1] === phone) { // phone is in column B
      const currentCount = values[i][4] || 0; // bookingsCount is in column E
      sheet.getRange(i + 1, 5).setValue(currentCount + 1); // Update bookings count
      
      // Update discount based on bookings
      let discount = 0;
      if (currentCount + 1 >= 10) discount = 10;
      else if (currentCount + 1 >= 5) discount = 5;
      
      sheet.getRange(i + 1, 6).setValue(discount); // Update discount
      break;
    }
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'The First Hookah Bar API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

## Step 7: Test the Integration
1. Open your website
2. Try booking a table
3. Check the "bookings" sheet - new rows should appear
4. Register a user account
5. Check the "users" sheet - user data should appear
6. Login as admin (password: admin123)
7. Click "Открыть таблицу бронирований" - should open your sheet

## Troubleshooting:
- If bookings don't save: Check the Web App URL in js/booking.js
- If admin button doesn't work: Check the sheet URL in js/auth.js
- If you get CORS errors: Make sure the Web App is deployed with "Anyone" access
- If data doesn't appear: Check that sheet names are exactly "bookings" and "users"

## Security Notes:
- The admin password is stored in the browser (not secure for production)
- Consider adding proper authentication for production use
- The Web App URL should be kept private in production

