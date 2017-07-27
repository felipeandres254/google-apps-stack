## Google Script Backend

This is a Google Script project that implements a simple backend on top of a Google Spreadsheet.

It provides the functions needed to handle a CRUD system using Sheets as tables of a single database.

### Setup

This project is published as an Apps Script library, so you can follow these steps to add it

1. Create a new Google Script project
2. Go to Libraries menu in "Resources > Libraries..."
3. Enter the Script ID `1Bw9l0LWrUfg7DPkhvxNtsudVpJiIwr_YeCkvnieTr14IAvAPUNKb1QDi`
4. Select the latest version (currently ' **30** v0.3 ') and click the "Save" button

Optionally, you can copy and paste the minified release in [`gscript.min.gs`][gscript.min]

### Usage

Follow [this guide][gapi_service] to deploy the project as API Executable and call it using Google API Service.

Make sure anyone has access and the API execute as yourself, the project owner.

[gscript.min]: ../blob/master/gscript.min.gs
[gapi_service]: https://developers.google.com/apps-script/guides/rest/api
