const fs = require('fs').promises;
const path = require('path');
async function alldats(object = {}){
async function findDatFiles(dir) {
  try {
    const files = await fs.readdir(dir);
    const hasEnglishDat = files.includes('English.dat');

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        // Recursively go into subdirectories
        await findDatFiles(filePath);
      } else if (path.extname(file) === '.dat') {
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const parsedData = parseDatContent(fileContent);
          
          //console.log(`Parsed data from ${filePath}:`);
          //console.log(parsedData);
          if (hasEnglishDat) {
            const englishFilePath = path.join(dir, 'English.dat');
            try {
              const englishFileContent = await fs.readFile(englishFilePath, 'utf-8');
              const parsedEnglishData = parseDatContent(englishFileContent);
              if(parsedData.ID){
                object[parsedData.ID] = parsedData;
                object[parsedData.ID]["Name"] = parsedEnglishData["Name"];
                object[parsedData.ID]["Description"] =  parsedEnglishData["Description"];
                object[parsedData.ID]["Icon"] = `https://bloomnetwork.online/images//${parsedData.ID}.png`;
              }

            } catch (readErr) {
              console.error(`Error reading ${englishFilePath}:`, readErr.message);
            }
          }
        } catch (readErr) {
          console.error(`Error reading ${filePath}:`, readErr.message);
        }
      }
    }

    // If English.dat exists, parse its content

  } catch (err) {
    console.error('Error:', err.message);
  }
}
await findDatFiles('C:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\304930\\2683620106\\Arid\\Bundles\\MAIN\\Items');
const jsonString = JSON.stringify(object, null, 2);
await fs.writeFile("items.json", jsonString, 'utf-8');
}

function parseDatContent(content) {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const jsonObject = {};
  lines.forEach(line => {
    const [key, ...values] = line.split(' ');
    const value = values.join(' ').trim();
    jsonObject[key] = isNaN(value) ? value : parseFloat(value) || value;
  });

  return jsonObject;
}


alldats();