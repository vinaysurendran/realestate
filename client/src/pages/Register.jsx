import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext.jsx";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();

  const onSubmit = async (formData) => {
    try {
      const { data } = await api.post("/auth/register", formData);
      setUser(data.user);
      localStorage.setItem("token_check", "true");
      navigate("/add");
    } catch (error) {
      const errorMsg = error.response?.data?.errors 
        ? error.response.data.errors.map(e => e.msg).join('. ')
        : error.response?.data?.error || "Registration failed.";
      
      setError("root.serverError", { type: "manual", message: errorMsg });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>

        {errors.root?.serverError && (
          <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{errors.root.serverError.message}</p>
        )}

        {/* Form Fields */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
          <input id="name" {...register("name", { required: "Name is required" })} className={`shadow appearance-none border rounded w-full py-2 px-3 ${errors.name ? 'border-red-500' : ''}`} />
          {errors.name && <p className="text-red-500 text-xs italic mt-2">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email", { required: "Email is required" })} className={`shadow appearance-none border rounded w-full py-2 px-3 ${errors.email ? 'border-red-500' : ''}`} />
          {errors.email && <p className="text-red-500 text-xs italic mt-2">{errors.email.message}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} className={`shadow appearance-none border rounded w-full py-2 px-3 ${errors.password ? 'border-red-500' : ''}`} />
          {errors.password && <p className="text-red-500 text-xs italic mt-2">{errors.password.message}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">Phone Number (Optional)</label>
          <input 
            id="phoneNumber" 
            type="tel"
            {...register("phoneNumber")} 
            className={`shadow appearance-none border rounded w-full py-2 px-3 ${errors.phoneNumber ? 'border-red-500' : ''}`} 
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs italic mt-2">{errors.phoneNumber.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">I am a:</label>
          <select id="role" {...register("role")} className="shadow border rounded w-full py-2 px-3">
            <option>Owner</option>
            <option>Builder</option>
            <option>Agent</option>
          </select>
        </div>

        <button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full disabled:bg-blue-300">
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}