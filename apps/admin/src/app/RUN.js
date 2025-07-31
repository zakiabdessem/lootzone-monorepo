const fs = require("fs");
const path = require("path");

// Function to capitalize words in a string and handle hyphenated words
const formatTitle = (str) => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Function to scan directories and create layout.js files
const scanDirectories = (dir) => {
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        // Recursively scan subdirectories
        scanDirectories(filePath);
      } else if (file.isFile() && file.name === "page.tsx") {
        const layoutFilePath = path.join(dir, "layout.tsx");
        const folderName = path.basename(dir);
        const formattedTitle = formatTitle(folderName);

        // Create layout.js content
        const layoutContent = `
import { ReactNode } from "react";

export const metadata = {
  title: "${formattedTitle}",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

`;

        // Write the layout.js file
        fs.writeFile(layoutFilePath, layoutContent.trim(), (err) => {
          if (err) {
            console.error(`Error writing file ${layoutFilePath}:`, err);
          } else {
            console.log(`Created ${layoutFilePath}`);
          }
        });
      }
    });
  });
};

// Start scanning from the directory where the script is located
const startDirectory = path.resolve(__dirname);
scanDirectories(startDirectory);
