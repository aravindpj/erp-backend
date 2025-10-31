const Business = require("../models/Client.model");
const moment = require("moment");
exports.register = async (req, res) => {
  try {
    const {
      businessName,
      abnAcn,
      businessAddress,
      postalAddress,
      phone,
      email,
      accountDeptContact,
      accountPhone,
      fax,
      accountEmail,
      invoiceEmail,
    } = req.body;
    console.log("inside client register==>", req.body);
    let client = await Business.findOne({ email });
    if (client) {
      return res.error({ status: 400, message: "Client already exist" });
    }
    client = new Business({
      businessName,
      abnAcn,
      businessAddress,
      postalAddress,
      phone,
      email,
      accountDeptContact,
      accountPhone,
      fax,
      accountEmail,
      invoiceEmail,
      createdDate: "",
      lastEditedDate: "",
    });
    await client.save();
    return res.success({
      status: 200,
      message: "Client created successfully",
      data: client,
    });
  } catch (error) {
    return res.error({ status: 500, error });
  }
};
exports.updateClient = async (req, res) => {
  try {
    const clientFields = {}
    for(let key in req.body){
       if(req.body[key] && key != "clientId"){
        clientFields[key] = req.body[key]
       }
    }
    client = await Business.findOneAndUpdate(
      { clientId: req.body.clientId },
      { $set: clientFields },
      { new: true }
    );
    if (!client) {
      return res.error({ status: 404, message: "Client not found" });
    }
    return res.success({
      status: 200,
      message: "Client updated successfully",
      data: client,
    });
  } catch (error) {
    console.log(error)
    return res.error({ status: 500, error });
  }
};

exports.getClients = async (req, res) => {
  try {
    const data = await Business.find();
    return res.success({ status: 200, data });
  } catch (error) {
    throw res.error({ status: 500 });
  }
};

exports.deleteClients = async (req, res) => {
  try {
    const data = await Business.findOneAndDelete({clientId:req.params.id});
    if(!data){
       return res.error({status:404,message:"Client not found"})
    }
    return res.success({status:200,message:"Client delete successfully",data})
  } catch (error) {
    throw res.error({ status: 500 });
  }
};
