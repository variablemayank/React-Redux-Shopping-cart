const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productById = (req,res,next,id) => {
    Product.findById(id).exec((err,product) => {
        if(err || !product) {
            return res.status(400).json({
                error: "Product not found"
            });
        }
        req.product = product;
        next();
    });
}
exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }

        const {
            name,
            description,
            price,
            category,
            quantity,
        } = fields;

        if(
            !name ||
            !description || 
            !price ||
            !category || 
            !quantity 

        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }
        console.log("fields",fields);

        let product = new Product(fields);

        console.log("product",product)
        if (files.photo) {
            if(files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb in size"
                });
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }
      
        product.save((err, result) => {
            if (err) {
                console.log("asdas")
                console.log(result)
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

exports.read = (req,res) => {
    req.product.photo = undefined;
    return res.json(req.product);
}

exports.remove = (req,res) => {
    let product = req.product
    product.remove((err,deletedProduct) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            "messsage":"Product Deleted"
        });
    });
}

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }

        const {
            name,
            description,
            price,
            category,
            quantity,
            shipping,
        } = fields;

        if(
            !name ||
            !description || 
            !price ||
            !category || 
            !quantity || 
            !shipping 

        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }
        let product = req.product;
        product = _.extend(product,fields);
        console.log(files)
        if (files.photo) {
            if(files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb in size"
                });
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }
        console.log(product)
        product.save((err, result) => {
            if (err) {
                console.log("asdas")
                console.log(result)
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};


/** 
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival =  /products?sortBy=createAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

exports.list  = (req,res) => {
    let order = req.query.order ? req.query.order: 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy: '_id'
    let limit = req.query.limit ? req.query.limit : 6

    Product.find()
        .select("-photo") // select deselect
        .populate('category')
        .sort([[sortBy,order]])
        .limit(limit)
        .exec((err,data) => {
            if(err) {
                return res.status(400).json({
                    error: 'Produts not found'
                });
            }
            res.send(data)
        })

}