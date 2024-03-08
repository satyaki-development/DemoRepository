const axios = require("axios");

const roleVerified = async (username, password) => {
  const status = await axios
    .get("http://localhost:5000/roles/", {
      auth: { username: "admin", password: "password123" },
    })
    .then(({ data }) => {
      if (data[username] === password) {
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      console.log("Error in Verification");
      return false;
    });
  return status;
};

module.exports = { roleVerified };
