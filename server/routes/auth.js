import { Router } from "express";
import { body, validationResult } from "express-validator";
import { registerUser, loginUser } from "../services/authService.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import cloudinary from "../utils/cloudinary.js"
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Must be a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("role").isIn(["Owner", "Builder", "Agent"]).withMessage("Invalid role"),
    body("phoneNumber").optional({ checkFalsy: true }).isMobilePhone('en-IN').withMessage("Must be a valid Indian mobile number"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { user, token } = await registerUser(req.body);
      res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .status(201)
        .json({ user });
    } catch (error) {
      next(error); // Pass error to central handler
    }
  }
);

router.post("/login", async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ user });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  }).json({ message: "Logged out successfully" });
});


router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
       res.status(404);
       throw new Error("User not found");
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.delete("/me", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Find all properties listed by the user
    const properties = await Property.find({ seller: userId });

    // 2. Collect all image URLs and delete them from Cloudinary
    if (properties.length > 0) {
      const publicIds = properties.flatMap(p => 
        p.images.map(url => {
          const parts = url.split("/");
          const publicIdWithExtension = parts.slice(parts.indexOf("realestate")).join("/");
          return publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
        })
      );
      
      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
      }
    }

    // 3. Delete all of the user's properties from the database
    await Property.deleteMany({ seller: userId });

    // 4. Delete the user account
    await User.findByIdAndDelete(userId);

    // 5. Clear the authentication cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    }).json({ message: "Account deleted successfully" });

  } catch (error) {
    next(error);
  }
});


export default router;