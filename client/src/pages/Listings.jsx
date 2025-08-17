import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Listings() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMin] = useState("");
  const [maxPrice, setMax] = useState("");

  const fetchData = async () => {
    const params = { q, location, type, minPrice, maxPrice };
    const { data } = await api.get("/properties", { params });
    setItems(data.items);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <h1>Properties for Sale</h1>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 12 }}>
        <input placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
        <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
        <select value={type} onChange={e=>setType(e.target.value)}>
          <option value="">Any type</option>
          <option>House</option><option>Apartment</option><option>Land</option>
        </select>
        <input placeholder="Min Price" value={minPrice} onChange={e=>setMin(e.target.value)} />
        <input placeholder="Max Price" value={maxPrice} onChange={e=>setMax(e.target.value)} />
      </div>
      <button onClick={fetchData}>Filter</button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
        {items.map(p => (
          <Link key={p._id} to={`/p/${p._id}`} style={{ border: "1px solid #ddd", padding: 8, textDecoration: "none", color: "inherit" }}>
            {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: "100%", height: 160, objectFit: "cover" }} />}
            <h3>{p.title}</h3>
            <div>${p.price?.toLocaleString()}</div>
            <div>{p.locationText} • {p.propertyType}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
