const basicAuth = require("basic-auth");
const mongoose = require("mongoose");
const { roleVerified } = require("./roleVerify");

const findRolesController = async (req, res) => {
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  if (await roleVerified(user.name, user.pass)) {
    const { roleId } = req.params;
    if (roleId !== "all") {
      const rolesAvailable = [];
      const collection = mongoose.connection.collection("roles");

      await collection
        .find({
          roleID: { $eq: roleId },
        })
        .project({ _id: 1 })
        .toArray()
        .then((values) => {
          values.map((value) => {
            rolesAvailable.push(value._id);
            return null;
          });
        })
        .catch((err) => {
          console.log(err.message);
        });
      res.send(rolesAvailable);
    } else {
      const rolesAvailable = [];
      const collection = mongoose.connection.collection("roles");

      await collection
        .find({})
        .project({ _id: 1 })
        .toArray()
        .then((values) => {
          values.map((value) => {
            rolesAvailable.push(value._id);
            return null;
          });
        })
        .catch((err) => {
          console.log(err.message);
        });
      res.send(rolesAvailable);
    }
  } else {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }
};
const getRolesCredsController = async (req, res) => {
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  if (user.name === "admin" && user.pass === "password123") {
    const rolesAvailable = {};
    const collection = mongoose.connection.collection("roles");
    await collection
      .find({})
      .project({ username: 1, password: 1 })
      .toArray()
      .then((values) => {
        values.map((value) => {
          rolesAvailable[value.username] = value.password;
          return null;
        });
        res.send(rolesAvailable);
      })
      .catch((err) => {
        console.log(err.message);
      });
  } else {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }
};

module.exports = {
  findRolesController,
  getRolesCredsController,
};
