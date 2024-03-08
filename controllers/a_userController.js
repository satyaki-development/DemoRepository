const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const config = require("config");
const nodemailer = require("nodemailer");
const basicAuth = require("basic-auth");
const mongoose = require("mongoose");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "workmanagementapp02@gmail.com", //secure_configuration.EMAIL_USERNAME,
    pass: "ljprpbfwrkrejmnu", //secure_configuration.PASSWORD
  },
});

// console.log("transporter", transporter )

const User = require("../models/user");
const { roleVerified } = require("./roleVerify");

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

// Adding Data to Database (adduserController):
// const adduserController = async (req, res) => {
//   // console.log(req.body,"addd req.body"); // Log the request body to inspect the data

//   if (req.body.accessToken.token.accessToken) {
//     const googleAccessToken = req.body.accessToken.token.accessToken;

//     const myobj = req.body;
//     // console.log(myobj,"myobj")  //whole form value data
//     const firstName = myobj.data.firstName.value;
//     // console.log(firstName, "firstName...");
//     const lastName = myobj.data.lastName.value;
//     // console.log(lastName, "lastName...");
//     const department = myobj.data.departments.value;
//     // console.log(department, "departmen...t");
//     const userRole = myobj.data.userroles.value;
//     // console.log(userRole, "userRole...");
//     const idNumber = myobj.data.idNumber.value;
//     // console.log(idNumber, "idNumber...");
//     const locations = myobj.data.locations.value;
//     // console.log(locations, "locations...");
//     const companyEmail = myobj.data.companyEmail.value;
//     // console.log(companyEmail, "companyEmail...");
//     const mobileNumber = myobj.data.mobileNumber.value;

//     // const existingUser = await User.findOne({ companyEmail }); // user null its getting to create data

//     // console.log("Existing", existingUser);
//     try {
//       if (
//         firstName === "" ||
//         lastName === "" ||
//         // department === "" ||
//         // userRole === "" ||
//         companyEmail === "" ||
//         locations === "" ||
//         mobileNumber === ""
//       ) {
//         return res.status(400).json({ message: "Invalid field!" });
//       }

//       const existingUser = await User.findOne({ companyEmail });
//       if (existingUser) {
//         return res.status(400).json({ message: "User already exists!" });
//       }

//       // Get the latest user to determine the next idNumber
//       const latestUser = await User.findOne().sort({ idNumber: -1 });
//       // console.log(latestUser ,"latestUser")

//       let nextIdNumber = 1;
//       if (latestUser && latestUser.idNumber) {
//         nextIdNumber = latestUser.idNumber + 1;
//       }

//       const result = await User.create({
//         idNumber: nextIdNumber, // Assign the calculated idNumber
//         firstName,
//         lastName,
//         department,
//         userRole,
//         companyEmail,
//         locations,
//         mobileNumber,
//       });

//       const token = jwt.sign(
//         {
//           email: result.email,
//           id: result._id,
//         },
//         config.get("JWT_SECRET"),
//         { expiresIn: "1h" }
//       );
//       const mailConfigurations = {
//         //     // It should be a string of sender/server email
//         from: "workmanagementapp02@gmail.com",

//         to: companyEmail,

//         // Subject of Email
//         subject: "Email Verification",

//         // This would be the text of email body
//         text: `Hi! There, You have recently visited
//             our website and entered your email.
//             Please follow the given link to verify your email
//             http://localhost:5000/verify/${token}
//             Thanks`,
//       };

//       transporter.sendMail(mailConfigurations, function (error, info) {
//         if (error) {
//           console.error("Email sending error:", error);
//           return res.status(500).json({
//             message: "Error sending email. Please try again later.",
//           });
//         }
//       });
//       // Log result and token
//       console.log("Result:", result);

//       const jsonResponse = {
//         result,
//         token,
//         idNumber: nextIdNumber,
//         message: "User created successfully!",
//       };
//       console.log("JSON Response:", jsonResponse);
//       res.status(200).json(jsonResponse);
//       // res
//       //   .status(200)
//       //   .json({
//       //     result,
//       //     token,
//       //     idNumber: nextIdNumber,
//       //     message: "User created successfully!",
//       //   }); // Include idNumber in the response
//         console.log("Email Sent Successfully");
//         // console.log("Email Sent Successfully");

//       // if (!existingUser) {
//       //   let nextIdNumber = 1; // Default if there are no users

//       //   const latestUser = await User.findOne().sort({ idNumber: -1 });
//       //   if (latestUser && latestUser.idNumber) {
//       //     nextIdNumber = latestUser.idNumber + 1;
//       //     console.log(nextIdNumber,"nextIdNumber")
//       //   }

//       //   const result = await User.create({
//       //     firstName,
//       //     lastName,
//       //     department,
//       //     userRole,
//       //     // idNumber,
//       //     idNumber: nextIdNumber,
//       //     companyEmail,
//       //     locations,
//       //     mobileNumber,
//       //   });
//       //   const token = jwt.sign(
//       //     {
//       //       email: result.companyEmail,
//       //       id: result._id,
//       //     },
//       //     JWT_SECRET,
//       //     { expiresIn: "1h" }
//       //   );
//       //   const mailConfigurations = {
//       //     // It should be a string of sender/server email
//       //     from: "workmanagementapp02@gmail.com",

//       //     to: companyEmail,

//       //     // Subject of Email
//       //     subject: "Email Verification",

//       //     // This would be the text of email body
//       //     text: `Hi! There, You have recently visited
//       //     our website and entered your email.
//       //     Please follow the given link to verify your email
//       //     http://localhost:5000/verify/${token}
//       //     Thanks`,
//       //   };

//       //   transporter.sendMail(mailConfigurations, function (error, info) {
//       //     if (error) {
//       //       console.error("Email sending error:", error);
//       //       return res.status(500).json({
//       //         message: "Error sending email. Please try again later.",
//       //       });
//       //     }
//       //   });
//       //     // Log result and token
//       //     // con  sole.log("Result:", result);
//       //   res.status(200).json({ result, token, idNumber: nextIdNumber });// Include idNumber in the response
//       //   console.log("Email Sent Successfully");
//       // } else {
//       //   return res.status(400).json({ message: "User already exists!!!" });
//       // }
//     } catch (err) {
//       console.log(err);
//       res.status(500).json({ message: "Something went wrong!" });
//     }
//   } else {
//     res.redirect("http://localhost:3000/account/login");
//   }
//   // console.log("Existing userr frontend", existingUser);
// };

const adduserController = async (req, res) => {
  if (req.body.accessToken.token.accessToken) {
    const googleAccessToken = req.body.accessToken.token.accessToken;

    const myobj = req.body;
    const firstName = myobj.data.firstName.value;
    const lastName = myobj.data.lastName.value;
    const department = myobj.data.departments.value;
    const userRole = myobj.data.userroles.value;
    const idNumber = myobj.data.idNumber.value; // Get the idNumber from the request
    const locations = myobj.data.locations.value;
    const companyEmail = myobj.data.companyEmail.value;
    const mobileNumber = myobj.data.mobileNumber.value;

    try {
      const existingUserWithId = await User.findOne({ idNumber });
      if (existingUserWithId) {
        alert("User with this ID already exists!");
        return res
          .status(400)
          .json({ message: "User with this ID already exists!" });
      }

      const existingUserWithEmail = await User.findOne({ companyEmail });
      if (existingUserWithEmail) {
        alert("User with this EMAIL already exists!");
        return res
          .status(400)
          .json({ message: "User with this email already exists!" });
      }

      if (!idNumber) {
        return res.status(400).json({ message: "ID number is required!" });
      }

      if (!companyEmail) {
        return res.status(400).json({ message: "Company email is required!" });
      }

      const result = await User.create({
        firstName,
        lastName,
        department,
        userRole,
        idNumber, // Use the provided idNumber as the identifier
        companyEmail,
        locations,
        mobileNumber,
      });

      // Rest of your code

      const token = jwt.sign(
        {
          email: result.companyEmail,
          id: result._id, // Use MongoDB's generated _id as the user ID
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
        // Rest of your mail configurations
      };

      // Rest of your email sending logic
      transporter.sendMail(mailConfigurations, function (error, info) {
        if (error) {
          console.error("Email sending error:", error);
          return res.status(500).json({
            message: "Error sending email. Please try again later.",
          });
        }
      });

      console.log(result, ":Result");
      res.status(200).json({ result, token });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: "Something went wrong!" });
    }
  } else {
    res.redirect("http://localhost:3000/account/login");
  }
};

const getUserbyIdController = async (req, res) => {
  const { id } = req.params; // Extract id from request params

  console.log(id, "get id"); // Log the ID to inspect the value

  try {
    // const user = await User.findById(id);
    const user = await User.findOne({ _id: id });
    console.log(user,"user")
    if (!user) {
      console.log("user not found")
      return res.status(404).json({ message: "User not found" });
    }
    // console.log(user._id.toString(), "Id from database");
       console.log("user created")
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserController = async (req, res) => {
  try {
    const user = await User.find();
    console.log(user, "ALL USER from database");

    res.status(200).json({ user });
  } catch (error) {
    console.error("USERS Error:", error.message); // Log error
    res.status(404).json({ message: error.message });
  }
};
// const getUserController = async (req, res) => {
//   try {
//     const users = await User.find(); // Changed variable name to plural for clarity
//     console.log("ALL USERS from the database:", users);

//     res.status(200).json({ users }); // Send the users array as JSON response
//   } catch (error) {
//     console.error("USERS Error:", error.message); // Log error
//     res.status(500).json({ message: "Internal Server Error" }); // Better status code for internal server error
//   }
// };

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
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  if (await roleVerified(user.name, user.pass)) {
    var { query, qvalue } = req.params;
    const GroupToDataList = [];
    const collection = mongoose.connection.collection("users");
    const filter = {
      [query]: { $eq: qvalue },
    };
    // console.log(filter);

    await collection
      .find(filter)
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
