const Master = require("../models/Master.model");

exports.saveDesignation = async (req, res) => {
  try {
    const { label } = req.body;
    if(!label) return res.error({status:500,message:"Designation name required"})
    let data = new Master.DesignationSchema({ label });
    data = await data.save()
    return res.success({status:200,message:"Created successfully",data})
  } catch (error) {
    console.log(error)
    return res.error({status:500,error})
  }
};

exports.saveDepartment = async (req, res) => {
  try {
    const { label } = req.body;
    if(!label) return res.error({status:500,message:"Department name required"})
    let data = new Master.DepartmentSchema({ label });
    data = await data.save()
    return res.success({status:200,message:"Created successfully",data})
  } catch (error) {
    console.log(error)
    return res.error({status:500,error})
  }
};

exports.saveUserRole = async (req, res) => {
  try {
    const { label } = req.body;
    if(!label) return res.error({status:500,message:"User role required"})
    let data = new Master.UserRolesSchema({ label });
    data = await data.save()
    return res.success({status:200,message:"Created successfully",data})
  } catch (error) {
    console.log(error)
    return res.error({status:500,error})
  }
};

exports.getMasters = async (req, res) => {
  try {
    const {master} = req.params
    const masterTypes = {
         designation:"DesignationSchema",
         department:"DepartmentSchema",
         userrole:"UserRolesSchema",
    }
    if(!masterTypes[master]) return res.error({status:404,message:"Master not found"})
    let data = await (Master[masterTypes[master]]).find()
    if(!data) return res.error({status:500})
    return res.success({status:200,data})
  } catch (error) {
    console.log(error)
    return res.error({status:500,error})
  }
};

exports.deleteMasters = async (req, res) => {
  try {
    const {id} = req.body
    const {master} = req.params
    const masterTypes = {
         designation:"DesignationSchema",
         department:"DepartmentSchema",
         userrole:"UserRolesSchema",
    }
    console.log("delete master id ======>",id)
    console.log("req.body ======>",req.body)
    if(!masterTypes[master]) return res.error({status:404,message:"Master not found"})
    await (Master[masterTypes[master]]).findByIdAndDelete(id)
    let data = await (Master[masterTypes[master]]).find()
    if(!data) return res.error({status:500})
    return res.success({status:200,data,message:"Deleted successfully"})
  } catch (error) {
    console.log(error)
    return res.error({status:500,error})
  }
};
