import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function AddProperty() {
  const [form, setForm] = useState({
    title:"", description:"", price:"", locationText:"",
    sizeSqft:"", propertyType:"House", lng:"", lat:""
  });
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => v && fd.append(k, v));
    Array.from(images).forEach(file => fd.append("images", file));
    const { data } = await api.post("/properties", fd, { headers: { "Content-Type":"multipart/form-data" }});
    navigate(`/p/${data._id}`);
  };

  return (
    <form onSubmit={submit} style={{ display:"grid", gap:8, maxWidth:520 }}>
      <h2>Add a Property (auto-publish)</h2>
      <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
      <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
      <input placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})}/>
      <input placeholder="Location" value={form.locationText} onChange={e=>setForm({...form, locationText:e.target.value})}/>
      <input placeholder="Size (sqft)" value={form.sizeSqft} onChange={e=>setForm({...form, sizeSqft:e.target.value})}/>
      <select value={form.propertyType} onChange={e=>setForm({...form, propertyType:e.target.value})}>
        <option>House</option><option>Apartment</option><option>Land</option>
      </select>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <input placeholder="Longitude" value={form.lng} onChange={e=>setForm({...form, lng:e.target.value})}/>
        <input placeholder="Latitude" value={form.lat} onChange={e=>setForm({...form, lat:e.target.value})}/>
      </div>
      <input type="file" multiple onChange={e=>setImages(e.target.files)} />
      <button>Publish</button>
    </form>
  );
}
