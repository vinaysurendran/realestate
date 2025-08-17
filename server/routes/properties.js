import { Router } from "express";
import Property from "../models/Property.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../utils/multer.js";
import cloudinary from "../utils/cloudinary.js";

const router = Router();

// List with filtering & search
router.get("/", async (req, res) => {
  try {
    const { q, minPrice, maxPrice, type, location, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (type) filter.propertyType = type;
    if (location) filter.locationText = new RegExp(location, "i");
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Property.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// Get one
router.get("/:id", async (req, res) => {
  const prop = await Property.findById(req.params.id).populate("seller", "name email");
  if (!prop) return res.status(404).json({ error: "Not found" });
  res.json(prop);
});

// Create (auto-publish)
router.post(
  "/",
  requireAuth,
  upload.array("images", 6),
  async (req, res) => {
    try {
      const { title, description, price, locationText, sizeSqft, propertyType, lng, lat } = req.body;

      const imageUrls = [];
      for (const file of req.files || []) {
        const uploaded = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString("base64")}`, {
          folder: "realestate/properties"
        });
        imageUrls.push(uploaded.secure_url);
      }

      const property = await Property.create({
        title,
        description,
        price: Number(price),
        locationText,
        sizeSqft: sizeSqft ? Number(sizeSqft) : undefined,
        propertyType,
        images: imageUrls,
        seller: req.user.id,
        coordinates: lng && lat ? { type: "Point", coordinates: [Number(lng), Number(lat)] } : undefined
      });

      // Auto-publish = immediately available after create
      res.status(201).json(property);
    } catch (e) {
        console.error("Create property error:", e);
        res.status(400).json({ error: "Create failed", details: e.message });
    }
  }
);

// Update (owner only)
router.put("/:id", requireAuth, async (req, res) => {
  const prop = await Property.findById(req.params.id);
  if (!prop) return res.status(404).json({ error: "Not found" });
  if (prop.seller.toString() !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  Object.assign(prop, req.body);
  await prop.save();
  res.json(prop);
});

// Delete (owner only)
router.delete("/:id", requireAuth, async (req, res) => {
  const prop = await Property.findById(req.params.id);
  if (!prop) return res.status(404).json({ error: "Not found" });
  if (prop.seller.toString() !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  await prop.deleteOne();
  res.json({ ok: true });
});

export default router;
