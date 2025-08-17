import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, index: true },
    locationText: { type: String, required: true, index: true },
    // optional coordinates for future map features
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined } // [lng, lat]
    },
    sizeSqft: { type: Number },
    propertyType: { type: String, enum: ["House", "Apartment", "Land"], required: true },
    images: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

propertySchema.index({ title: "text", description: "text" });

const Property = mongoose.model("Property", propertySchema);
export default Property;
