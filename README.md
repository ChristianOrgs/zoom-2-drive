# zoom-2-drive

## What it is about?

- Google Apps Script

## What do I need?

- Google Account & Drive
- Access to the Apps Scripts
- Zoom Account
- Access to the user meeting recordings

## Why did I do this?

I faced the issue that I don't wanted to spend loads of money for Zoom cloud space. Usually you will get 5GB there for a premium account and need to buy more additionally. In our agency we use Google Drive on daily bases as probably many peps will do out there.

## Description

This Google Apps Script solves the common problem of limited storage space on Zoom by automatically moving completed recordings to Google Drive and deleting them from Zoom. With the use of server-to-server OAuth credentials, the script fetches all recordings from the last 30 days and moves them to a specified Google Drive folder. The script also includes a function to clean up the Google Drive folder after a specified number of days to prevent clutter. The script can be easily customized with the user's own API key, secret, ID, Google Drive folder ID, and cleanup period. Save money on Zoom storage fees and keep your recordings organized with this efficient and easy-to-use script.

### Instructions

#### Zoom Setup

1. First, you'll need to go to the Zoom website and log in to your account.
2. Next, you'll need to go to the Zoom App Marketplace and click on the "Develop" tab.
3. Once you're on the Develop page, click on the "Build App" button.
4. From there, you can select the type of app you want to build. In this case, you'll want to select "Server-to-Server OAuth" as the app type.
5. Next, you'll need to give your app a name and a description, developer name & email, scopes (Meeting: full permission, Recording: full permission, User: full permission, Account: full permission)
6. Activate your app

#### Google Apps Script

1. Create a new Google Apps Script and get from your Zoom app "App Credential" tab Account ID -> zoomApiID, Client ID -> zoomApiKey, Client secret -> zoomApiSecret and add these into your script
2. Navigate in Zoom to Admin -> Users -> YOUR_USER and within the URL you should see smth like https://zoom.us/user/{YOUR_USER_ID}/profile which you need to paste in the variable -> zoomAccountID
3. We will need now the Google folder ID as last variable which you can find within the folder you want to move your videos in. This can be found if you right click the folder you want to move this and copy the sharable link. This link should look like drivehttps://drive.google.com/drive/folders/YOUR_FOLDER_ID?usp=share_link. This you will write into the variable -> zoomAccountID
4. Now you need to set up within the tab trigger a new time trigger which got invoked everyday at a specific time. Alternatively you can try a testrun by invoke the function: InitCopyZoomRecordingsToDrive()
5. Everytime this script will be invoked it checks for files which are older than the variable "deletedRecordingsOlder" and delete these if the file is older to prevent to much recording piling up.

Enjoy!
