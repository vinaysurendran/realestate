import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../api";
import PropertyForm from "../components/PropertyForm"; // Import the reusable form
import { useState } from "react";

// API function to create a new property listing
const createProperty = async (formData) => {
  const fd = new FormData();

  // Helper function to flatten nested form data for FormData
  const flattenObject = (obj, prefix = '') => {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (key === 'images') {
        Array.from(value).forEach(file => fd.append('images', file));
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flattenObject(value, newKey);
      } else if (value !== undefined && value !== null) {
        fd.append(newKey, value);
      }
    });
  };

  flattenObject(formData);
  
  const { data } = await api.post("/properties", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export default function AddProperty() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const mutation = useMutation({
    mutationFn: createProperty,
    onSuccess: (data) => {
      // On success, navigate to the new property's page
      navigate(`/p/${data._id}`);
    },
    onError: (error) => {
      // Handle and display errors from the server
      const errorMsg = error.response?.data?.errors?.map(e => e.msg).join('. ') 
                       || error.response?.data?.error 
                       || "An unexpected error occurred.";
      setServerError(errorMsg);
    }
  });

  // This function is passed to the PropertyForm component
  const handleCreateSubmit = (formData) => {
    setServerError(null); // Clear previous errors before a new submission
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <PropertyForm 
        onSubmit={handleCreateSubmit}
        isSubmitting={mutation.isPending}
        serverError={serverError}
      />
    </div>
  );
}
