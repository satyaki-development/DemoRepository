const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const config = require("config");
const nodemailer = require("nodemailer");
const basicAuth = require("basic-auth");
const mongoose = require("mongoose");
// const generateUniqueId=require('./idGeneratorController');
// const User=require('../models/user')
const ObjectId = require("mongoose").Types.ObjectId;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "workmanagementapp02@gmail.com", //secure_configuration.EMAIL_USERNAME,
    pass: "ljprpbfwrkrejmnu", //secure_configuration.PASSWORD
  },
});

const User = require("../models/user");
const { roleVerified } = require("./roleVerify");


// const router = express.Router();



const JWT_SECRET = "anythingoverhere8";

const signinController = async (req, res) => {
  const collection = mongoose.connection.collection("users");
  if (req.body.googleAccessToken) {

    // gogole-auth
    const { googleAccessToken } = req.body;

    axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      })
      .then(async (response) => {
        const DATA = response.data;
        const companyEmail = response.data.email;
        const picture = response.data.picture;

        const existingUser = await collection
          .find({ companyEmail: { $eq: companyEmail } })
          .toArray()
          .then((values) => {
            if (values.length > 0) {
              return values[0];
            }
          });
        // console.warn("COnfig: ", config);
        if (!existingUser) {
          console.error("User Doesnt Exist");
          return res.status(404).json({ message: "User doesn't exist!" });
        }

        // console.log("existingUser2", existingUser);
        // console.log("existingUser.companyEmail", existingUser.companyEmail);
        // console.log("existingUser._id", existingUser._id);

        const token = jwt.sign(
          {
            email: existingUser.companyEmail,
            id: existingUser._id,
          },
          config.get("JWT_SECRET"),
          // JWT_SECRET,
          { expiresIn: "1h" }
        );

        // console.log("token", token);
        res.status(200).json({ result: existingUser, token });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: "Invalid access token!" });
      });
  } else {
    // normal-auth
    const { email, password } = req.body;
    if (email === "" || password === "")
      return res.status(400).json({ message: "Invalid field!" });
    try {
      const existingUser = await User.findOne({ email });

      if (!existingUser)
        return res.status(404).json({ message: "User don't exist!" });

      const isPasswordOk = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isPasswordOk)
        return res.status(400).json({ message: "Invalid credintials!" });

      const token = jwt.sign(
        {
          email: existingUser.email,
          id: existingUser._id,
        },
        config.get("JWT_SECRET"),
        { expiresIn: "1h" }
      );
      console.log("About to send");
      res.status(200).json({ result: existingUser, token });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
};

const signupController = async (req, res) => {
  console.log("Im in signup controller");
  if (req.body.accessToken.token.accessToken) {
    const googleAccessToken = req.body.accessToken.token.accessToken;

    const myobj = req.body;

    const companyName = myobj.data.companyName.value;
    const firstName = myobj.data.firstName.value;
    const companyEmail = myobj.data.companyEmail.value;
    const locations = myobj.data.locations.value;
    const mobileNumber = myobj.data.mobileNumber.value;

    const existingUser = await User.findOne({ companyEmail });

    try {
      if (existingUser) {
        const result = await User.updateMany({
          companyName,
          firstName,
          companyEmail,
          locations,
          mobileNumber,
        });
        const token = jwt.sign(
          {
            email: result.companyEmail,
            id: result._id,
          },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.status(200).json({ result, token });
      } else {
        return res
          .status(400)
          .json({ message: "User does not have admin rights" });
      }
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: "Something went wrong!" });
    }
  } else {
    // normal form signup
    const myobj = req.body;
    // console.log(myobj);

    const companyName = myobj.data.companyName.value;
    const firstName = myobj.data.firstName.value;
    const companyEmail = myobj.data.companyEmail.value;
    const locations = myobj.data.locations.value;
    const mobileNumber = myobj.data.mobileNumber.value;

    try {
      if (
        companyName === "" ||
        firstName === "" ||
        companyEmail === "" ||
        locations === "" ||
        mobileNumber === ""
      )
        // console.log("Im in");
        return res.status(400).json({ message: "Invalid field!" });

      const existingUser = await User.findOne({ companyEmail });
      if (existingUser)
        return res.status(400).json({ message: "User already exist!" });

      //   const hashedPassword = await bcrypt.hash(password, 12);

      const result = await User.create({
        companyName,
        firstName,
        companyEmail,
        locations,
        mobileNumber,
      });

      // 
      const token = jwt.sign(
        {
          email: result.email,
          id: result._id,
        },
        config.get("JWT_SECRET"),
        { expiresIn: "1h" }
      );

      console.log(token);

      res.status(200).json({ result, token });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
};

const adduserController = async (req, res) => {
  if (req.body.accessToken.token.accessToken) {
    const googleAccessToken = req.body.accessToken.token.accessToken;

    const myobj = req.body;
    const firstName = myobj.data.firstName.value;
    const lastName = myobj.data.lastName.value;
    const department = myobj.data.departments.value;
    const userRole = myobj.data.userroles.value;
    const idNumber = myobj.data.idNumber.value;
    const locations = myobj.data.locations.value;
    const companyEmail = myobj.data.companyEmail.value;
    const mobileNumber = myobj.data.mobileNumber.value;
   
   
    // const existingUser = await User.findOne({ companyEmail });
    // console.log("Existing", existingUser);
   try{
    const existingUser = await User.findOne({ companyEmail });
    // console.log("Existing", existingUser);
      if (!existingUser) {   //no existing user
        // Get the prefilled idNumber from the request body
        // const idNumber = myobj.data.idNumber.value;
        // Generate a unique 4-digit serial-wise ID
        // const serialId = await generateSerialId();

        const result = await User.create({
          // serialId,
          firstName,
          lastName,
          department,
          userRole,
          // idNumber:serialId,
          idNumber,
          companyEmail,
          locations,
          mobileNumber,
        });

        // If an existing user is not found, a new user is created using the -
        // - provided details. A JWT token is generated for the user's authentication.
        const token = jwt.sign(
          {
            email: result.companyEmail,
            id: result._id,
          },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        const mailConfigurations = {
          // It should be a string of sender/server email
          from: "workmanagementapp02@gmail.com",

          to: companyEmail,

          // Subject of Email
          subject: "Email Verification",

          // This would be the text of email body
          text: `Hi! There, You have recently visited
          our website and entered your email.
          Please follow the given link to verify your email
          http://localhost:5000/verify/${token}
          Thanks`,
        };


        // An email verification link is sent to the user's provided company email using the transporter.sendMail function (which presumably uses a library like Nodemailer).
        // transporter.sendMail(mailConfigurations, function (error, info) {
        //   if (error) {
        //     console.error("Email sending error:", error);
        //     return res.status(500).json({
        //       message: "Error sending email. Please try again later.",
        //     });
        //   }
        // });
        // Save the user to the database
        // console.log("Result:", result);

        res.status(200).json({ result, token ,message: "User added successfully" });
        console.log("Email Sent Successfully");
        // sent in email after The user's details are saved in the database.

      } else {
        return res.status(400).json({ message: "User already exists!!!" });
      }
    } catch (err) {
      // console.log(err);
      res.status(400).json({ message: "Something went wrong!" });
    }
  } else {
    res.redirect("http://localhost:3000/account/login");
  }
};

// Function to generate a unique 4-digit serial-wise ID
async function generateSerialId() {
  const lastUser = await User.findOne({}, {}, { sort: { serialId: -1 } });
  if (lastUser) {
    const lastSerialId = lastUser.serialId;
    const newSerialId = (lastSerialId + 1) % 10000; // Ensure it stays within 4 digits
    return newSerialId;
  } else {
    // If no users exist yet, start from 1
    return 1;
  }
}


const getUserbyIdController = async (req, res) => {
  const { id } = req.params; // Extract id from request params

  try {
    const user = await User.findOne({ _id: id });
    console.log('Fetched user ID from DATABASE:', user);

    if (!user || !user._id) {
      console.log("USER NOT FOUND")
      return res.status(404).json({ message: 'User not found' });
    }

    // console.log(user._id.toString(), 'Id from database'); // Log the retrieved _id
    // console.log('User found:', user._id.toString());
    console.log("user created SUCCESSFULLY");
    res.status(200).json({ user });
  } catch (error) {
    console.log('500 error msg getting:', error.message)
    res.status(500).json({ message: error.message });
  }
};

const getUserController = async (req, res) => {
  try {
    const users = await User.find();
    users.forEach(user => {
      console.log(user.firstName,"READ THE USERS FROM DATABASE TO BACKEND");
    });
    console.log('Fetched users from DATABASE:', users);
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(404).json({ message: error.message });
  }
};

const updateUserController = async (req, res) => {
  const { id } = req.params;
  const {
    companyName,
    firstName,
    lastName,
    departmemt,
    companyEmail,
    locations,
    mobileNumber,
    userRole,
  } = req.body;
  console.log("Updating User Data", typeof id);
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No User with id: ${id}`);

  const updatedUser = {
    companyName,
    firstName,
    lastName,
    companyEmail,
    departmemt,
    locations,
    mobileNumber,
    userRole,
    _id: id,
  };

  const status = await User.findByIdAndUpdate(id, updatedUser, { new: true });
  res.status(200).send(`Updated ${status}`);
};

const deleteUserController = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);

  await User.findByIdAndRemove(id);
  res.json({ message: `Deleted User Data with id: ${id}` });
};

const getuserQueryData = async (req, res) => {
  // console.log('Request URL received:', req.url);
  const user = basicAuth(req);
  // console.log("USER AUTHENTICATION",user)

  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  // console.log("Inside getuserQueryData");

  try {
  if (await roleVerified(user.name, user.pass)) {
    const { query, qvalue } = req.params;

    const filter = { companyEmail:qvalue };
    const collection = mongoose.connection.collection("users");

   

    setTimeout(async () => {
      try {
        // Your existing code that was inside the try block
        const values = await collection.find(filter).project({ _id: 1 }).toArray();
   
        // console.log("values",values)
        if (values && values.length > 0) {
          const GroupToDataList = values.map((value) => value._id.toString());
          res.status(200).json(GroupToDataList);
        } else {
          res.status(404).send(`No records found for query: ${query} and qvalue: ${qvalue}`);
        }
      } catch (error) {
        console.error("API Error:", error);
        res.status(500).send("Internal Server Error");
      }
    }, 500);
    // console.log(" data from db to B") // 2000 milliseconds = 2 seconds (Adjust the delay time as needed)
  } else {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }
} catch (error) {
  console.error("API Error:", error);
  res.status(500).send("Internal Server Error");
}
};
const getGroupDataController = async (req, res) => {
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  if (await roleVerified(user.name, user.pass)) {
    var { department, location } = req.params;
    const GroupToDataList = [];
    const collection = mongoose.connection.collection("users");
    location = location.charAt(0).toUpperCase() + location.slice(1);

    await collection
      .find({
        department: { $eq: department },
        locations: { $eq: location },
        userRole: { $not: { $eq: "admin" } },
      })
      .project({ _id: 1 })
      .toArray()
      .then((values) => {
        values.map((value) => {
          GroupToDataList.push(value._id);
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
    res.send(GroupToDataList);
  } else {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }
};

const getuserDataWithRoleController = async (req, res) => {
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  if (await roleVerified(user.name, user.pass)) {
    var { department, location, roleId } = req.params;
    const GroupToDataList = [];
    const collection = mongoose.connection.collection("users");
    location = location.charAt(0).toUpperCase() + location.slice(1);

    await collection
      .find({
        department: { $eq: department },
        locations: { $eq: location },
        userRole: { $eq: roleId },
      })
      .project({ _id: 1 })
      .toArray()
      .then((values) => {
        values.map((value) => {
          GroupToDataList.push(value._id);
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
    res.send(GroupToDataList);
  } else {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }
};

module.exports = {
  signinController,
  signupController,
  getuserQueryData,
  adduserController,
  getUserController,
  updateUserController,
  deleteUserController,
  getUserbyIdController,
  getGroupDataController,
  getuserDataWithRoleController,
};