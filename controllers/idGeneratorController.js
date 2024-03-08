// let lastUsedId = 0; // Initialize with the last used ID

// // Function to generate a new unique ID
// const generateUniqueId = () => {
//   lastUsedId += 1; // Increment the last used ID
//   const paddedId = String(lastUsedId).padStart(4, '0'); // Pad with leading zeros
//   return paddedId;
// };

// module.exports = generateUniqueId;

// 2
// const express = require("express");
// const router = express.Router();
// const { v4: uuidv4 } = require("uuid");

// router.get("/generate-id", (req, res) => {
//   // Generate a unique ID number (you can customize this logic)
//   const generatedId = generateUniqueId();

//   res.json({ generatedId });
// });

// function generateUniqueId() {
//   // Your logic to generate a unique ID
//   const randomNumber = Math.floor(Math.random() * 10000);
//   const paddedNumber = String(randomNumber).padStart(4, "0");
//   const generatedId = `ID-${paddedNumber}`;
//   return generatedId;
// }

// module.exports = router;


const { generateID } = require("../utils/idGenerator"); // Import the generateID function

// Your existing code for handling ID generation
const generateUniqueID = (req, res) => {
  const id = generateID(); // Use the generateID function to get a unique ID
  res.status(200).json({ id });
};

module.exports = {
  generateUniqueID,
};

