import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    listingType: { type: String, enum: ["Sale", "Rent"], required: true, default: "Sale" },
    price: { 
        amount: { type: Number, required: true },
        perUnit: { type: String, enum: ["Total", "Per Cent", "Per SqFt"], default: "Total" }
    },
    location: {
        district: { type: String, required: true, index: true },
        city: { type: String, required: true, index: true },
        locality: { type: String, index: true },
    },
    // --- REPLACED COORDINATES WITH GOOGLE MAPS LINK ---
    googleMapsLink: { type: String, trim: true },
    sizeSqft: { type: Number },
    propertyType: { type: String, enum: ["House", "Apartment", "Land", "Commercial", "Villa", "Resort"], required: true },
    features: [{ type: String }],
    images: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postedBy: { type: String, enum: ["Owner", "Builder", "Agent"], required: true }
  },
  { timestamps: true }
);

propertySchema.index({ title: "text", description: "text", "location.city": "text" });

const Property = mongoose.model("Property", propertySchema);
export default Property;
