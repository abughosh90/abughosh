"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, Copy, Database, Archive, FileText, ExternalLink } from "lucide-react"

export function GoogleAppsScriptTemplate() {
  const [copied, setCopied] = useState("")

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(""), 2000)
    })
  }

  const mainScript = `// Enhanced Google Apps Script for WWTP Progress Tracker
// Deploy this as a web app with execute permissions set to "Anyone"

function doGet(e) {
  const action = e.parameter.action || 'ping';
  const params = e.parameter;
  
  try {
    switch(action) {
      case 'ping':
        return createResponse({
          success: true,
          message: 'Google Apps Script is working!',
          timestamp: new Date().toISOString(),
          version: '2.0'
        });
        
      case 'loadStructures':
        return loadStructuresData();
        
      case 'getSystemInfo':
        return getSystemInfo();
        
      case 'listBackups':
        return listBackups();
        
      case 'restoreBackup':
        return restoreBackup(params.backupId);
        
      default:
        return createResponse({
          success: false,
          error: 'Unknown action: ' + action
        });
    }
  } catch (error) {
    return createResponse({
      success: false,
      error: error.toString()
    });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'saveData';
    
    switch(action) {
      case 'ping':
        return createResponse({
          success: true,
          message: 'Google Apps Script is working!',
          timestamp: new Date().toISOString(),
          version: '2.0'
        });
        
      case 'saveStructures':
        return saveStructuresData(data.data);
        
      case 'generateProgressReport':
        return generateProgressReport(data.data);
        
      case 'generateActivityReport':
        return generateActivityReport(data.data);
        
      case 'createBackup':
        return createBackup(data.data);
        
      case 'syncImages':
        return syncImages(data.data);
        
      case 'exportToCSV':
        return exportToCSV(data.data);
        
      default:
        return createResponse({
          success: false,
          error: 'Unknown action: ' + action
        });
    }
  } catch (error) {
    return createResponse({
      success: false,
      error: error.toString()
    });
  }
}

// ✅ CRITICAL: Always return proper JSON with correct MIME type
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function saveStructuresData(structures) {
  try {
    // Create or get existing spreadsheet
    let spreadsheet = getOrCreateSpreadsheet('WWTP Progress Tracker Data');
    let sheet = spreadsheet.getActiveSheet();
    
    // Clear existing data
    sheet.clear();
    
    // Set headers
    const headers = [
      'Structure Code', 'Structure Name', 'Structure Description', 
      'Structure Priority', 'Structure Classification',
      'Activity Name', 'Activity Type', 'Activity Progress', 
      'Activity Responsibility', 'Activity Subcontractor', 
      'Activity Priority', 'Activity Notes', 'Activity Obstacles',
      'Image Count', 'Last Updated'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Add data
    const rows = [];
    structures.forEach(structure => {
      if (structure.activities && structure.activities.length > 0) {
        structure.activities.forEach(activity => {
          rows.push([
            structure.code,
            structure.name,
            structure.description,
            structure.priority,
            structure.classification,
            activity.name,
            activity.type,
            activity.progress,
            activity.responsibility,
            activity.subcontractor || '',
            activity.priority,
            activity.notes || '',
            activity.obstacles || '',
            (activity.images && activity.images.length) || 0,
            new Date().toISOString()
          ]);
        });
      } else {
        rows.push([
          structure.code,
          structure.name,
          structure.description,
          structure.priority,
          structure.classification,
          '', '', '', '', '', '', '', '', 0,
          new Date().toISOString()
        ]);
      }
    });
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    
    // Format the sheet
    formatSheet(sheet, headers.length);
    
    // Update system info
    updateSystemInfo(structures.length, rows.length);
    
    return createResponse({
      success: true,
      message: 'Data saved successfully to Google Sheets',
      spreadsheetUrl: spreadsheet.getUrl(),
      rowCount: rows.length
    });
      
  } catch (error) {
    return createResponse({
      success: false,
      error: 'Failed to save data: ' + error.toString()
    });
  }
}

function loadStructuresData() {
  try {
    const spreadsheet = getSpreadsheetByName('WWTP Progress Tracker Data');
    
    if (!spreadsheet) {
      return createResponse({
        success: false,
        error: 'No data file found'
      });
    }
    
    const sheet = spreadsheet.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createResponse({
        success: true,
        data: [],
        message: 'No data found in spreadsheet'
      });
    }
    
    // Convert spreadsheet data back to structures format
    const structures = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const structureCode = row[0];
      
      if (!structures[structureCode]) {
        structures[structureCode] = {
          id: structureCode,
          code: structureCode,
          name: row[1],
          description: row[2],
          priority: row[3],
          classification: row[4],
          activities: []
        };
      }
      
      if (row[5]) { // Has activity name
        structures[structureCode].activities.push({
          id: structureCode + '-' + Date.now() + '-' + Math.random(),
          name: row[5],
          type: row[6],
          progress: row[7],
          responsibility: row[8],
          subcontractor: row[9],
          priority: row[10],
          notes: row[11],
          obstacles: row[12],
          images: []
        });
      }
    }
    
    const structuresArray = Object.values(structures);
    
    return createResponse({
      success: true,
      data: structuresArray,
      message: \`Loaded \${structuresArray.length} structures\`
    });
      
  } catch (error) {
    return createResponse({
      success: false,
      error: 'Failed to load data: ' + error.toString()
    });
  }
}

function generateProgressReport(reportData) {
  try {
    const doc = getOrCreateDocument('WWTP Progress Report');
    const body = doc.getBody();
    body.clear();
    
    // Add title and header
    const title = body.appendParagraph('WWTP Construction Progress Report');
    title.setHeading(DocumentApp.ParagraphHeading.TITLE);
    
    body.appendParagraph(\`Generated on: \${new Date().toLocaleString()}\`);
    body.appendParagraph(\`Report Version: 2.0\`);
    body.appendParagraph('');
    
    // Executive Summary
    const execSummary = body.appendParagraph('Executive Summary');
    execSummary.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph(\`Total Structures: \${reportData.totalStructures}\`);
    body.appendParagraph(\`Total Activities: \${reportData.totalActivities}\`);
    body.appendParagraph(\`Overall Progress: \${Math.round(reportData.overallProgress)}%\`);
    
    if (reportData.statistics) {
      body.appendParagraph('');
      const statsHeading = body.appendParagraph('Project Statistics');
      statsHeading.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      
      // Progress distribution
      const progressDist = reportData.statistics.progressDistribution;
      body.appendParagraph(\`Not Started: \${progressDist.notStarted} activities\`);
      body.appendParagraph(\`In Progress: \${progressDist.inProgress} activities\`);
      body.appendParagraph(\`Completed: \${progressDist.completed} activities\`);
      body.appendParagraph(\`Activities with Obstacles: \${reportData.statistics.withObstacles}\`);
      body.appendParagraph(\`Activities with Images: \${reportData.statistics.withImages}\`);
    }
    
    body.appendParagraph('');
    
    // Detailed structure information
    const details = body.appendParagraph('Detailed Progress by Structure');
    details.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    reportData.structures.forEach(structure => {
      const structureHeading = body.appendParagraph(\`\${structure.code} - \${structure.name}\`);
      structureHeading.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      
      body.appendParagraph(\`Description: \${structure.description}\`);
      body.appendParagraph(\`Priority: \${structure.priority}\`);
      body.appendParagraph(\`Classification: \${structure.classification}\`);
      body.appendParagraph(\`Total Activities: \${structure.activities.length}\`);
      
      if (structure.activities.length > 0) {
        const avgProgress = structure.activities.reduce((sum, a) => sum + a.progress, 0) / structure.activities.length;
        body.appendParagraph(\`Average Progress: \${Math.round(avgProgress)}%\`);
        
        const activitiesHeading = body.appendParagraph('Activities:');
        activitiesHeading.setHeading(DocumentApp.ParagraphHeading.HEADING3);
        
        structure.activities.forEach(activity => {
          body.appendParagraph(\`  • \${activity.name} (\${activity.type}) - \${activity.progress}% - \${activity.responsibility}\`);
          if (activity.obstacles) {
            body.appendParagraph(\`    ⚠️ Obstacles: \${activity.obstacles}\`);
          }
          if (activity.notes) {
            body.appendParagraph(\`    📝 Notes: \${activity.notes}\`);
          }
        });
      }
      
      body.appendParagraph('');
    });
    
    doc.saveAndClose();
    
    return createResponse({
      success: true,
      message: 'Comprehensive progress report generated successfully',
      documentUrl: doc.getUrl()
    });
      
  } catch (error) {
    return createResponse({
      success: false,
      error: 'Failed to generate progress report: ' + error.toString()
    });
  }
}

// Helper functions
function getOrCreateSpreadsheet(name) {
  const files = DriveApp.getFilesByName(name);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  } else {
    return SpreadsheetApp.create(name);
  }
}

function getOrCreateDocument(name) {
  const files = DriveApp.getFilesByName(name);
  if (files.hasNext()) {
    return DocumentApp.open(files.next());
  } else {
    return DocumentApp.create(name);
  }
}

function getSpreadsheetByName(name) {
  const files = DriveApp.getFilesByName(name);
  return files.hasNext() ? SpreadsheetApp.open(files.next()) : null;
}

function formatSheet(sheet, columnCount) {
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, columnCount);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, columnCount);
  
  // Add borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
}

function updateSystemInfo(structureCount, recordCount) {
  try {
    const props = PropertiesService.getScriptProperties();
    props.setProperties({
      'lastUpdated': new Date().toISOString(),
      'totalStructures': structureCount.toString(),
      'totalRecords': recordCount.toString()
    });
  } catch (error) {
    console.log('Failed to update system info:', error);
  }
}

function getSystemInfo() {
  try {
    const props = PropertiesService.getScriptProperties();
    const info = {
      lastUpdated: props.getProperty('lastUpdated') || 'Never',
      totalStructures: parseInt(props.getProperty('totalStructures')) || 0,
      totalRecords: parseInt(props.getProperty('totalRecords')) || 0,
      backupCount: getBackupCount(),
      storageUsed: getStorageUsage()
    };
    
    return createResponse({
      success: true,
      data: info
    });
  } catch (error) {
    return createResponse({
      success: false,
      error: 'Failed to get system info: ' + error.toString()
    });
  }
}

function getBackupCount() {
  try {
    const folder = getOrCreateFolder('WWTP Backups');
    const files = folder.getFiles();
    let count = 0;
    while (files.hasNext()) {
      files.next();
      count++;
    }
    return count;
  } catch (error) {
    return 0;
  }
}

function getStorageUsage() {
  try {
    return DriveApp.getStorageUsed() + ' bytes';
  } catch (error) {
    return 'Unknown';
  }
}

function getOrCreateFolder(name, parentFolder = null) {
  const folders = parentFolder ? parentFolder.getFoldersByName(name) : DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder ? parentFolder.createFolder(name) : DriveApp.createFolder(name);
  }
}`

  const backupScript = `// Backup and restore functions

function createBackup(data) {
  try {
    const backupFolder = getOrCreateFolder('WWTP Backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = 'WWTP-Backup-' + timestamp;
    
    // Create backup spreadsheet
    const backupSpreadsheet = SpreadsheetApp.create(backupName);
    const sheet = backupSpreadsheet.getActiveSheet();
    
    // Save backup data
    const backupData = {
      timestamp: new Date().toISOString(),
      structures: data.structures,
      backupName: data.backupName || backupName,
      version: '2.0'
    };
    
    // Write backup info
    sheet.getRange(1, 1).setValue('Backup Information');
    sheet.getRange(2, 1).setValue('Created:');
    sheet.getRange(2, 2).setValue(backupData.timestamp);
    sheet.getRange(3, 1).setValue('Name:');
    sheet.getRange(3, 2).setValue(backupData.backupName);
    sheet.getRange(4, 1).setValue('Structures:');
    sheet.getRange(4, 2).setValue(data.structures.length);
    
    // Write structures data
    sheet.getRange(6, 1).setValue('Backup Data (JSON):');
    sheet.getRange(7, 1).setValue(JSON.stringify(backupData, null, 2));
    
    // Move to backup folder
    const file = DriveApp.getFileById(backupSpreadsheet.getId());
    backupFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    return createResponse({
      success: true,
      message: 'Backup created successfully',
      backupId: backupSpreadsheet.getId(),
      backupName: backupName
    });
    
  } catch (error) {
    return createResponse({
      success: false,
      error: 'Failed to create backup: ' + error.toString()
    });
  }
}

function listBackups() {
  try {
    const backupFolder = getOrCreateFolder('WWTP Backups');
    const files = backupFolder.getFiles();
    const backups = [];
    
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().startsWith('WWTP-Backup-')) {
        backups.push({
          id: file.getId(),
          name: file.getName(),
          created: file.getDateCreated().toISOString(),
          size: file.getSize()
        });
      }
    }
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    return createResponse({
      success: true,
      data: backups,
      message: 'Found ' + backups.length + ' backups'
    });
    
  } catch (error) {
    return createResponse({
      success: false,
      error: 'Failed to list backups: ' + error.toString()
    });
  }
}

function restoreBackup(backupId) {
  try {
    const backupFile = DriveApp.getFileById(backupId);
    const backupSpreadsheet = SpreadsheetApp.open(backupFile);
    const sheet = backupSpreadsheet.getActiveSheet();
    
    // Read backup data
    const backupDataJson = sheet.getRange(7, 1).getValue();
    const backupData = JSON.parse(backupDataJson);
    
    // Restore the data by saving it as current data
    const result = saveStructuresData(backupData.structures);
    
    if (result.success) {
      return createResponse({
        success: true,
        message: 'Successfully restored backup: ' + backupData.backupName,
        restoredStructures: backupData.structures.length
      });
    } else {
      return result;
    }
    
  } catch (error) {
    return createResponse({
      success: false,
      error: 'Failed to restore backup: ' + error.toString()
    });
  }
}`

  const reportScript = `// Enhanced reporting functions

function generateActivityReport(data) {
  try {
    const doc = getOrCreateDocument('WWTP Activity Summary Report');
    const body = doc.getBody();
    body.clear();
    
    // Title
    const title = body.appendParagraph('WWTP Activity Summary Report');
    title.setHeading(DocumentApp.ParagraphHeading.TITLE);
    
    body.appendParagraph('Generated on: ' + new Date().toLocaleString());
    body.appendParagraph('');
    
    // Summary statistics
    const summary = body.appendParagraph('Activity Summary');
    summary.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph('Total Activities: ' + data.summary.total);
    body.appendParagraph('Average Progress: ' + Math.round(data.summary.averageProgress) + '%');
    body.appendParagraph('Not Started: ' + data.summary.byStatus.notStarted);
    body.appendParagraph('In Progress: ' + data.summary.byStatus.inProgress);
    body.appendParagraph('Completed: ' + data.summary.byStatus.completed);
    body.appendParagraph('');
    
    // Activities by responsibility
    const respHeading = body.appendParagraph('Activities by Responsibility');
    respHeading.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    
    const responsibilities = {};
    data.activities.forEach(activity => {
      if (!responsibilities[activity.responsibility]) {
        responsibilities[activity.responsibility] = [];
      }
      responsibilities[activity.responsibility].push(activity);
    });
    
    Object.keys(responsibilities).forEach(resp => {
      const activities = responsibilities[resp];
      body.appendParagraph(resp + ': ' + activities.length + ' activities');
      
      activities.forEach(activity => {
        body.appendParagraph('  • ' + activity.structureCode + ' - ' + activity.name + ' (' + activity.progress + '%)');
      });
      body.appendParagraph('');
    });
    
    doc.saveAndClose();
    
    return createResponse({
      success: true,
      message: 'Activity summary report generated successfully',
      documentUrl: doc.getUrl()
    });
    
  } catch (error) {
    return createResponse({
      success: false,
      error: 'Failed to generate activity report: ' + error.toString()
    });
  }
}

function exportToCSV(structures) {
  try {
    // Create CSV content
    const headers = [
      'Structure Code', 'Structure Name', 'Structure Description',
      'Structure Priority', 'Structure Classification',
      'Activity Name', 'Activity Type', 'Activity Progress',
      'Activity Responsibility', 'Activity Subcontractor',
      'Activity Priority', 'Activity Notes', 'Activity Obstacles',
      'Image Count', 'Export Date'
    ];
    
    let csvContent = headers.join(',') + '\\n';
    
    structures.forEach(structure => {
      if (structure.activities && structure.activities.length > 0) {
        structure.activities.forEach(activity => {
          const row = [
            structure.code,
            structure.name,
            structure.description,
            structure.priority,
            structure.classification,
            activity.name,
            activity.type,
            activity.progress,
            activity.responsibility,
            activity.subcontractor || '',
            activity.priority,
            activity.notes || '',
            activity.obstacles || '',
            (activity.images && activity.images.length) || 0,
            new Date().toISOString()
          ].map(field => '"' + String(field).replace(/"/g, '""') + '"');
          
          csvContent += row.join(',') + '\\n';
        });
      }
    });
    
    // Create CSV file
    const blob = Utilities.newBlob(csvContent, 'text/csv', 'WWTP-Export-' + new Date().toISOString().split('T')[0] + '.csv');
    const file = DriveApp.createFile(blob);
    
    return createResponse({
      success: true,
      message: 'CSV export created successfully',
      fileUrl: file.getUrl(),
      fileName: file.getName()
    });
    
  } catch (error) {
    return createResponse({
      success: false,
      error: 'Failed to export CSV: ' + error.toString()
    });
  }
}

function syncImages(imagesData) {
  try {
    const imageFolder = getOrCreateFolder('WWTP Activity Images');
    let syncedCount = 0;
    
    imagesData.forEach(activityData => {
      const activityFolder = getOrCreateFolder(activityData.structureCode + '-' + activityData.activityName, imageFolder);
      
      activityData.images.forEach((imageBase64, index) => {
        try {
          // Convert base64 to blob
          const imageBlob = Utilities.newBlob(
            Utilities.base64Decode(imageBase64.split(',')[1]),
            'image/jpeg',
            'image-' + (index + 1) + '.jpg'
          );
          
          // Create file in Google Drive
          activityFolder.createFile(imageBlob);
          syncedCount++;
        } catch (imageError) {
          console.log('Failed to sync image:', imageError);
        }
      });
    });
    
    return createResponse({
      success: true,
      message: 'Successfully synced ' + syncedCount + ' images to Google Drive',
      syncedCount: syncedCount
    });
    
  } catch (error) {
    return createResponse({
      success: false,
      error: 'Failed to sync images: ' + error.toString()
    });
  }
}`

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            <CardTitle>Enhanced Google Apps Script Setup</CardTitle>
          </div>
          <Badge variant="outline">Cloud Storage Solution</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Your Current Setup:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>
              <strong>Deployment ID:</strong> AKfycbzmrV3FdARLNFxZ628mVXWOkVygeuR4c55IvP4DXq_DGA0tP__Ts0NJB1cf6oxwatw
            </li>
            <li>
              <strong>Web App URL:</strong> https://script.google.com/macros/s/.../exec
            </li>
            <li>
              <strong>Library ID:</strong> 17tiagr4nImA_fZEM1OR9tSCNctyl6tbOVH_ZHhwDqHb8fCax44XLHQwX
            </li>
            <li>
              <strong>Status:</strong> Ready to use with enhanced features
            </li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">✅ Correct Integration Method:</h4>
          <p className="text-sm text-green-700 mb-2">
            The app correctly calls your Google Apps Script as an API endpoint using fetch() - no imports needed!
          </p>
          <div className="bg-white p-3 rounded border text-xs font-mono">
            <div className="text-green-600">// ✅ Correct way (already implemented):</div>
            <div>await fetch("https://script.google.com/macros/s/YOUR_ID/exec", {`{`}</div>
            <div>&nbsp;&nbsp;method: "POST",</div>
            <div>&nbsp;&nbsp;headers: {`{ "Content-Type": "application/json" }`},</div>
            <div>&nbsp;&nbsp;body: JSON.stringify(data)</div>
            <div>{`});`}</div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Copy the code from the tabs below to your Google Apps Script</li>
            <li>Deploy as web app with "Execute as: Me" and "Who has access: Anyone"</li>
            <li>The app will automatically use your deployment URL as an API</li>
            <li>Test the connection using the "Test Connection" button</li>
            <li>Enable auto-save for seamless data synchronization</li>
          </ol>
        </div>

        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="main" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Main Script
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Backup System
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Quick Setup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Main Google Apps Script Code:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(mainScript, "main")}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied === "main" ? "Copied!" : "Copy Code"}
              </Button>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                <code>{mainScript}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Backup & Restore Functions:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(backupScript, "backup")}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied === "backup" ? "Copied!" : "Copy Code"}
              </Button>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                <code>{backupScript}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Enhanced Reporting Functions:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(reportScript, "reports")}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied === "reports" ? "Copied!" : "Copy Code"}
              </Button>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                <code>{reportScript}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Quick Actions:</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open("https://script.google.com", "_blank")}
                    className="w-full flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Google Apps Script
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const allCode = mainScript + "\n\n" + backupScript + "\n\n" + reportScript
                      copyToClipboard(allCode, "all")
                    }}
                    className="w-full flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {copied === "all" ? "All Code Copied!" : "Copy All Code"}
                  </Button>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">What You'll Get:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Automatic data backup to Google Sheets</li>
                  <li>Professional progress reports in Google Docs</li>
                  <li>Image storage in Google Drive</li>
                  <li>CSV export functionality</li>
                  <li>Version control and restore points</li>
                  <li>Real-time sync capabilities</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
