import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/auth/register", form);
    localStorage.setItem("token", data.token);
    navigate("/add");
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
      <h2>Create account</h2>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
      <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
      <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
      <button>Register</button>
    </form>
  );
}
