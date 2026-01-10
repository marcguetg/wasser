function getConfig() {
  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = spreadsheet.getSheetByName('Config');
  const config = sheet.getRange('A1').getDisplayValue();
  return ContentService.createTextOutput(config);
}


function pushData(data) {
  const spreadsheet = SpreadsheetApp.getActive();
  const data_sheet = spreadsheet.getSheetByName('Data');
  data_sheet.appendRow([Date.now() / 1000, data.waterline, data.raw, new Date(), data.txt]);

  const config_sheet = spreadsheet.getSheetByName('Config');
  const alarm_threshold = config_sheet.getRange('A2').getValue();
  
  if (data.waterline >= alarm_threshold) {
    const email_address = config_sheet.getRange('A3').getValue();
    const msg = config_sheet.getRange('A4').getValue();
    MailApp.sendEmail(
      email_address,
      msg,
      data.waterline
    );
    return ContentService.createTextOutput('Alarm');
    
  } else {
    return ContentService.createTextOutput('OK');
  }
}


function getData() {
  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = spreadsheet.getSheetByName('Data');
  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2);
  const raw = range.getValues();
  return ContentService.createTextOutput(JSON.stringify(raw))
    .setMimeType(ContentService.MimeType.JSON);
}


function doGet(e) {
  const type = e?.parameter?.type;
  if (!type) {
    return ContentService.createTextOutput('Missing action parameter');
  }

  if (type === 'config') {
    return getConfig();
  } else if (type === 'pushData') {
    return pushData(e.parameter);
  } else if (type === 'getData') {
    return getData();
  } else {
    return ContentService.createTextOutput('Invalid action');
  }
}