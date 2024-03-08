const { designationName, roleVerified } = require("./roleVerify");
const basicAuth = require("basic-auth");
const mongoose = require("mongoose");

const templateSchema = mongoose.Schema({
  template: Array,
  templateId: Number,
  designationName: String,
});

const TemplateModel = mongoose.model("template", templateSchema);

const getAllTemplatesController = async (req, res) => {
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  if (await roleVerified(user.name, user.pass)) {
    try {
      const data = await TemplateModel.findOne();
      const { template, designationName } = data;
      // res.status(200).json({ template, designationName });
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  } else {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }
};

const getTemplatebydesigController = async (req, res) => {
  const { designationName } = req.params; // Extract designationName from request params
  console.log(req.params)

  try {
    const template = await TemplateModel.findOne({ designationName: designationName });
    console.log('Fetched template designationName from DATABASE:', template);

    if (!template || !template.designationName) {
      console.log("template NOT FOUND")
      return res.status(404).json({ message: 'template not found' });
    }
    console.log("template fetched SUCCESSFULLY");
    res.status(200).json({ template });
  } catch (error) {
    console.log('500 error msg getting:', error.message)
    res.status(500).json({ message: error.message });
  }
};


const updatetemplateController = async (req, res) => {
  const { designationName } = req.params;
  const {
    customtemplate
  } = req.body;

  const oldTemplate = getTemplatebydesigController(req,res)
  console.log(oldTemplate)

//   const updatedTemplate = {
// };

//   const status = await User.findByIdAndUpdate(id, updatedUser, { new: true });
  res.status(200).send(`Updated`);
};

const createTemplateByIdController = async (req, res) => {
  const user = basicAuth(req);

  const { designationName } = req.body;

  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }

  if (await roleVerified(user.name, user.pass)) {
    const updatedData = {
      template: [
        {
          default: {
            data1: { percentage: 5, number: "ICP 1", id: "icp1tab1" },
            data2: { percentage: 52, number: "ICP 2", id: "icp2tab1" },
            data3: { percentage: 35, number: "ICP 3", id: "icp3tab1" },
            className: ["rowsheadtyles"],
            columns: [
              "Emp Segment Range",
              "Budgeted H/C",
              "Avg. Sales Cycle",
              "Avg.Deal Size",
              "Revenue Share By ICP",
              "Revenue Share By ICP($$)",
              "Transaction share ICP",
              "Pipeline Goal by ICP($$)",
              "Pipeline Goal by ICP($$)",
              "Pipeline Goal by ICP(Trns)",
              "Pipeline Goal by ICP(Trns)",
              "Per Rep Productivity ($$)",
            ],
            row1: ["5000+", "", "", "", 40, "", "", 400, "", 400, "", ""],
            row2: ["5000-4999", "", "", "", 20, "", "", 400, "", 400, "", ""],
            row3: ["1-4999", "", "", "", 40, "", "", 400, "", 400, "", ""],
          },
        },
      ],
      templateId: 0, // Set the templateId as needed
      designationName: designationName,
    };

    const existingDesignationName = await TemplateModel
    .find({ designationName: { $eq: designationName } })
    // .toArray()
    .then((values) => {
      if (values.length > 0) {
        return values[0];
      }
    });
// const existingDesignationName = await Template.findOne({ designationName });
if (existingDesignationName) {
  // alert("designation already exists!");
  return res
    .status(400)
    .json({ message: " Designation already exists!" });
}
    try {

      const status = await TemplateModel.create(updatedData);

      if (status) {
        console.log("Created Data in template to Frontend");
        res.status(201).json({ message: "Created" });
      } else {
        console.log(error);
        res.status(404).json({ message: "Not Created" });
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
  getAllTemplatesController,
  updatetemplateController,
  createTemplateByIdController,
  getTemplatebydesigController
};
