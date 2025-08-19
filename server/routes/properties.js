import { Router } from "express";
import { body, validationResult } from "express-validator";
import Property from "../models/Property.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../utils/multer.js";
import cloudinary from "../utils/cloudinary.js";

const router = Router();

// List with filtering & search
router.get("/", async (req, res, next) => {
  try {
    // FIX: Added 'postedBy' to the list of variables from req.query
    const { q, minPrice, maxPrice, type, district, city, postedBy, listingType, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 12 } = req.query;
    const filter = {};

    if (q) filter.$text = { $search: q };
    if (type) filter.propertyType = type;
    if (district) filter['location.district'] = new RegExp(district, "i");
    if (city) filter['location.city'] = new RegExp(city, "i");
    if (listingType) filter.listingType = listingType;
    if (postedBy) filter.postedBy = postedBy; // This line is now correct

    if (minPrice || maxPrice) filter['price.amount'] = {};
    if (minPrice) filter['price.amount'].$gte = Number(minPrice);
    if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);

    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions = { [sortBy]: sortOrder };

    const [items, total] = await Promise.all([
      Property.find(filter).sort(sortOptions).skip(skip).limit(Number(limit)),
      Property.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) {
    next(e);
  }
});

// Get one
router.get("/:id", async (req, res, next) => {
    try {
        const prop = await Property.findById(req.params.id).populate("seller", "name email phoneNumber");
        if (!prop) return res.status(404).json({ error: "Not found" });
        res.json(prop);
    } catch(e) {
        next(e);
    }
});

// GET LOGGED-IN USER'S PROPERTIES
router.get("/mine/all", requireAuth, async (req, res, next) => {
  try {
    const properties = await Property.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    next(error);
  }
});

// Create (auto-publish)
router.post(
  "/",
  requireAuth,
  upload.array("images", 6),
  [
    // --- REMOVED GEO VALIDATION, ADDED URL VALIDATION ---
    body("title").notEmpty().withMessage("Title is required"),
    body("price.amount").isNumeric().withMessage("Price must be a number"),
    body("location.district").notEmpty().withMessage("District is required"),
    body("location.city").notEmpty().withMessage("City is required"),
    body("propertyType").notEmpty().withMessage("Property type is required"),
    body("googleMapsLink").optional({ checkFalsy: true }).isURL().withMessage("Please enter a valid Google Maps URL."),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // --- UPDATED DESTRUCTURING ---
      const {
        title, description, propertyType,
        'price.amount': priceAmount, 'price.perUnit': pricePerUnit,
        'location.district': district, 'location.city': city, 'location.locality': locality,
        sizeSqft, googleMapsLink // Changed from lng/lat
      } = req.body;

      const seller = await User.findById(req.user.id);
      if (!seller) {
          res.status(404);
          throw new Error("Seller account not found");
      }

      const imageUrls = [];
      for (const file of req.files || []) {
        const uploaded = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString("base64")}`, {
          folder: "realestate/properties"
        });
        imageUrls.push(uploaded.secure_url);
      }

      // --- UPDATED PROPERTY DATA OBJECT ---
      const propertyData = {
          title, description,
          price: { amount: Number(priceAmount), perUnit: pricePerUnit },
          location: { district, city, locality },
          sizeSqft: sizeSqft ? Number(sizeSqft) : undefined,
          propertyType, images: imageUrls,
          seller: req.user.id,
          postedBy: seller.role,
          googleMapsLink: googleMapsLink || undefined // Save the link
      };
      
      const property = await Property.create(propertyData);
      res.status(201).json(property);

    } catch (e) {
        next(e);
    }
  }
);

// Update (owner only)
router.put("/:id", requireAuth, async (req, res, next) => {
    try {
        const prop = await Property.findById(req.params.id);
        if (!prop) return res.status(404).json({ error: "Not found" });
        if (prop.seller.toString() !== req.user.id) return res.status(403).json({ error: "Forbidden" });
        Object.assign(prop, req.body);
        await prop.save();
        res.json(prop);
    } catch(e) {
        next(e);
    }
});

// Delete (owner only)
router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
        const prop = await Property.findById(req.params.id);
        if (!prop) return res.status(404).json({ error: "Not found" });
        if (prop.seller.toString() !== req.user.id) return res.status(403).json({ error: "Forbidden" });
        
        if (prop.images && prop.images.length > 0) {
            const publicIds = prop.images.map(url => {
              const parts = url.split("/");
              const publicIdWithExtension = parts.slice(parts.indexOf("realestate")).join("/");
              return publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
            });
            await cloudinary.api.delete_resources(publicIds);
        }
        
        await prop.deleteOne();
        res.json({ ok: true });
    } catch(e) {
        next(e);
    }
});

router.put(
  "/:id",
  requireAuth,
  upload.array("images", 6),
  [
    // Validation remains the same
    body("title").notEmpty().withMessage("Title is required"),
    body("price.amount").isNumeric().withMessage("Price must be a number"),
    body("location.district").notEmpty().withMessage("District is required"),
    body("location.city").notEmpty().withMessage("City is required"),
    body("propertyType").notEmpty().withMessage("Property type is required"),
    body("googleMapsLink").optional({ checkFalsy: true }).isURL().withMessage("Please enter a valid Google Maps URL."),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        res.status(404);
        throw new Error("Property not found");
      }

      if (property.seller.toString() !== req.user.id) {
        res.status(403);
        throw new Error("User not authorized to update this property");
      }

      // Build the update object from the request body
      const {
        title, description, propertyType,
        'price.amount': priceAmount, 'price.perUnit': pricePerUnit,
        'location.district': district, 'location.city': city, 'location.locality': locality,
        sizeSqft, googleMapsLink
      } = req.body;

      const updateData = {
        title,
        description,
        propertyType,
        sizeSqft: sizeSqft ? Number(sizeSqft) : undefined,
        googleMapsLink: googleMapsLink || undefined,
        price: {
          amount: Number(priceAmount),
          perUnit: pricePerUnit,
        },
        location: {
          district,
          city,
          locality,
        },
      };

      // Use findByIdAndUpdate for a more reliable update
      const updatedProperty = await Property.findByIdAndUpdate(
        req.params.id,
        { $set: updateData }, // Use $set to update the fields
        { new: true, runValidators: true } // Options: return the updated doc and run schema validators
      );

      res.json(updatedProperty);

    } catch (e) {
      next(e);
    }
  }
);

export default router;
