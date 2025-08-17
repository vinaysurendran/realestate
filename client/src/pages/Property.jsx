import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function Property() {
  const { id } = useParams();
  const [p, setP] = useState(null);

  useEffect(() => { api.get(`/properties/${id}`).then(res => setP(res.data)); }, [id]);
  if (!p) return <div>Loading...</div>;

  return (
    <div>
      <h1>{p.title}</h1>
      <div style={{ display: "flex", gap: 8, overflow: "auto" }}>
        {p.images?.map((src,i)=>(<img key={i} src={src} alt="" style={{ width: 240, height: 160, objectFit: "cover" }}/>))}
      </div>
      <h3>${p.price?.toLocaleString()}</h3>
      <p><b>Location:</b> {p.locationText}</p>
      <p><b>Type:</b> {p.propertyType} {p.sizeSqft ? `• ${p.sizeSqft} sqft` : ""}</p>
      <p>{p.description}</p>
      {p.seller && (
        <div style={{ marginTop: 12 }}>
          <b>Seller:</b> {p.seller.name} • {p.seller.email}
        </div>
      )}
    </div>
  );
}
