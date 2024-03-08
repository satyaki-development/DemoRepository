const { roleVerified } = require("./roleVerify");
const basicAuth = require("basic-auth");
const mongoose = require("mongoose");

const groupsSchema = mongoose.Schema({
  groups: mongoose.Schema.Types.Mixed,
  GroupsIds: Array,
});

const Groups = mongoose.model("groups", groupsSchema);
// console.log("GROUPS Data" , Groups)

const getAllGroupsController = async (req, res) => {
  const user = basicAuth(req);
  // console.log("ALL GROUP ", user)  // Credentials { name: 'admin', pass: 'password123' } 

  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  if (await roleVerified(user.name, user.pass)) {
    // const collection = mongoose.connection.collection("groupData");
    try {
      const data = await Groups.findOne();
      // console.log(".....", data)  //groupd data id-1,2,3,4
      const { groups, GroupsIds } = data; 
      // console.log("{ groups, GroupsIds } ..........###", { groups, GroupsIds })    //groupd data id-1,2,3,4
      res.status(200).json({ groups, GroupsIds });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
    res.status(500);
  } else {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }
};
const updateGroupsController = async (req, res) => {
  const user = basicAuth(req);
  // console.log("ALL UPDATE GROUP ", user)   //Credentials { name: 'admin', pass: 'password123' }

  const { groups, GroupsIds } = req.body;  
  // console.log("GROUPD ID'S :: ",{ groups, GroupsIds } );   //groupd data id-1,2,3,4
  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  if (await roleVerified(user.name, user.pass)) {
    const updatedData = { groups: groups, GroupsIds: GroupsIds };
    // console.log("UPDATEdATA", updatedData) //groupd data id-1,2,3,4
    try {
      // console.log(JSON.stringify(groups));
      const status = await Groups.findOneAndUpdate({
        // groups: updatedData.groups,
        groups: groups,
        GroupsIds: GroupsIds,
      });
      // console.log('*************************************************');
      // console.log("Satus :", status.groups);
      if (status) {
        console.log("Updated Data of Groups to Frontend");
        res.status(200).json({ message: "Updated" });
        // console.log("Updated Data of Groups to Frontend");
      } else {
        console.log(error)
        res.status(404).json({ message: "Not Updated" });
      }
    } catch (error) {
      res.status(500).json({ message: error });
    }
  } else {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }
};
const createTemplateByIdController = async (req, res) => {
  const user = basicAuth(req);
  // console.log("ALL UPDATE GROUP ", user)   //Credentials { name: 'admin', pass: 'password123' }

  const { groups, GroupsIds } = req.body;  
  // console.log("GROUPD ID'S :: ",{ groups, GroupsIds } );   //groupd data id-1,2,3,4
  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  if (await roleVerified(user.name, user.pass)) {
    const updatedData = { groups: groups, GroupsIds: GroupsIds };
    // console.log("UPDATEdATA", updatedData) //groupd data id-1,2,3,4
    try {
      // console.log(JSON.stringify(groups));
      const status = await Groups.findOneAndUpdate({
        // groups: updatedData.groups,
        groups: groups,
        GroupsIds: GroupsIds,
      });
      // console.log('*************************************************');
      // console.log("Satus :", status.groups);
      if (status) {
        console.log("Updated Data of Groups to Frontend");
        res.status(200).json({ message: "Updated" });
        // console.log("Updated Data of Groups to Frontend");
      } else {
        console.log(error)
        res.status(404).json({ message: "Not Updated" });
      }
    } catch (error) {
      res.status(500).json({ message: error });
    }
  } else {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }
};

module.exports = {
  getAllGroupsController,
  updateGroupsController,
  createTemplateByIdController,
};
