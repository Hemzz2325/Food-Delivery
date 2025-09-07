
import item from "../models/itemModel.js";
import { uploadToCloudinary } from "../utils/imageUploader.js";

export const addItem =async(req,res)=>{
    try{
        const{name,category,foodtype,price}=req.body;
        let image;
        if(req.file){
            image=await uploadToCloudinary(req.file.path)
        }
        const shop=await shop.findOne({owner:req.userId})
        if(!shop){
            return res.status(400).json({message:"No shop found"})
        }
        const item=await item.create({
            name,image:image.secure_url,
            shop:shop._id,
            category,foodtype,price
        })
        return res.status(201).json({message:"Item added",item})
    }catch(error){
        console.error("Add item error:",error)
        return res.status(500).json({message:"Add item error",error:error.message})
    }
}

export const editItem =async(req,res)=>{
    try{
        const itemId=req.params.itemId
        const{name,category,foodtype,price}=req.body;
        let image;
        if(req.file){
            image=await uploadToCloudinary(req.file.path)
        }
        const item=await item.findByIdAndUpdate(itemId,{
            name,image:image.secure_url,
            category,foodtype,price
        },{new:true})
        if(!item){
            return res.status(400).json({message:"No item found"})
        }
        return res.status(201).json({message:"Item edited",item})
    }catch(error){
        console.error("Edit item error:",error)
        return res.status(500).json({message:"Edit item error",error:error.message})
    }
}
