var config = {
    // Add API KEY / SECRET / ID from created zoom app (server-to-server oauth credentials)
     zoomApiKey:"",
     zoomApiSecret:"",
     zoomApiID:"",
     zoomAccountID:"",
    //Add GOGGLE DRIVE ID
     googleDriveFolderId:"",
    //CLEANUP GOOGLE DRIVE AFTER DAYS
     deletedRecordingsOlder: 14
}

function getZoomAccessToken() {
  var response = UrlFetchApp.fetch(`https://api.zoom.us/oauth/token?grant_type=account_credentials&account_id=${config.zoomApiID}`, {
    "method": "POST",
    "headers": {
      "Authorization": "Basic " + Utilities.base64Encode(config.zoomApiKey + ":" + config.zoomApiSecret)
    }
  });
  var tokenResponse = JSON.parse(response.getContentText());
  console.log('TOKEN:',tokenResponse)
  return tokenResponse.access_token;
}

function getZoomRecordings(accessToken) {
  //Timestamp 30Days ago
  var thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  //Fetch all recording of the last 30 days
  var response = UrlFetchApp.fetch(`https://api.zoom.us/v2/users/${config.zoomAccountID}/recordings?status=completed&from=${thirtyDaysAgo}`, {
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + accessToken
    }
  });
  var recordingsResponse = JSON.parse(response.getContentText());
  return recordingsResponse.meetings;
}

//Check if the current filename is already in the folder
function isFileInFolder(fileName) {
  var files = DriveApp.getFolderById(config.googleDriveFolderId).getFilesByName(fileName);
  return files.hasNext();
}

function removeZoomFiles(token, record, index, recording){
  var deleteRecordingUrl = `https://api.zoom.us/v2/meetings/${record.meeting_id}/recordings/${record.id}`;
  var deleteResponse = UrlFetchApp.fetch(deleteRecordingUrl, {
    "method": "DELETE",
    "headers": {
      "Authorization": "Bearer " + token
    }
  });
  console.log(`Record Deleted - ${recording.topic} (${index}/${recording.recording_count}) `)
}

//Move the given recording into drive if not exists and delete from zoom
function moveRecordingsToDrive(zoomRecordings,token){
  console.log(zoomRecordings)
  for (var i = 0; i < zoomRecordings.length; i++) {
    var recording = zoomRecordings[i];
    //Run trough all files within recording create blob and move
    recording.recording_files.forEach((elem,index)=>{
      var driveFile = null
      var blob = UrlFetchApp.fetch(elem.download_url, {
        headers: {
          Authorization: "Bearer " + token
        }
      }).getBlob();
      // Create a filename for this recording file
      var meetingDate = new Date(recording.start_time);
      var filename = `${meetingDate.getFullYear()}-${(meetingDate.getMonth() + 1)}-${meetingDate.getDate()}-${recording.topic}(${index}) - ${recording.id}` + ".mp4";
      var file = {
        "title": filename,
        "parents": [{"id": config.googleDriveFolderId}]
      };
      console.log(filename)
      //Check if the file already exists
      var fileContains = isFileInFolder(filename)
      if(fileContains == false){
        driveFile = Drive.Files.insert(file, blob);
        if (driveFile != null) {
          //Remove file because its moved
          removeZoomFiles(token, elem, index+1, recording)
        }
      }
    })
  }
}

function cleanupDrive(){
  //Get the timeframe for deletion
  var someDaysAgo = new Date(Date.now() - config.deletedRecordingsOlder * 24 * 60 * 60 * 1000).getTime();
  //Get all files from drive folder  
  var files = DriveApp.getFolderById(config.googleDriveFolderId).getFiles();

  while (files.hasNext()) {
    var file = files.next();
    var lastUpdated = file.getLastUpdated().getTime();

    //Delete if older than our config    
    if (lastUpdated < someDaysAgo) {
      file.setTrashed(true);
      Logger.log("Deleted file: " + file.getName());
    }
  }
}

function InitCopyZoomRecordingsToDrive() {
  DriveApp.getRootFolder();
  //Get a zoom token
  var token = getZoomAccessToken()
  //Get all recordings associate to the user
  var recordings = getZoomRecordings(token)
  //Move to drive and delete in Zoom
  moveRecordingsToDrive(recordings,token)
  //Cleanup Drive folder if there videos older than config
  cleanupDrive()
}

