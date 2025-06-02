const fs = require('fs');
const path = require('path');

// List of function folders to update
const functionFolders = [
  'createCrateInZohoFunction',
  'createDonationBatch',
  'createProductionOrder',
  'dispatchOrderFunction',
  'fetchCrateDetailsFunction',
  'reportFunction',
  'submitCrateData',
  'submitCrateDataToZohoFunction',
  'userManagement'
];

const templatePath = path.join(__dirname, 'function.template.js');
const templateContent = fs.readFileSync(templatePath, 'utf8');

function updateFunction(folderName) {
  const functionPath = path.join(__dirname, folderName, 'index.js');
  
  // Skip if function doesn't exist
  if (!fs.existsSync(functionPath)) {
    console.log(`Skipping ${folderName} - index.js not found`);
    return;
  }
  
  // Read the original function
  const originalContent = fs.readFileSync(functionPath, 'utf8');
  
  // Extract the specific function logic (between the handler's try block)
  const functionMatch = originalContent.match(/try\s*{([\s\S]*?)}(?:\s*catch\s*\(|$)/);
  
  if (!functionMatch) {
    console.log(`Skipping ${folderName} - could not extract function logic`);
    return;
  }
  
  // Create the new content by inserting the function logic into the template
  const newContent = templateContent.replace(
    /\/\/ Your function logic here[\s\S]*?\/\/ ------------------------/,
    `// Your function logic here\n    // ------------------------\n    ${functionMatch[1].trim()}\n    // ------------------------`
  );
  
  // Save the updated function
  fs.writeFileSync(functionPath, newContent);
  console.log(`Updated ${folderName}`);
}

// Update all functions
functionFolders.forEach(updateFunction);
console.log('Function updates complete!');
