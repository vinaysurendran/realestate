import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import PropertyForm from "../components/PropertyForm";
import { useState } from "react";

const fetchProperty = async (id) => {
  const { data } = await api.get(`/properties/${id}`);
  return data;
};

const updateProperty = async ({ id, formData }) => {
  const fd = new FormData();
  // ... (flattenObject logic)
  const flattenObject = (obj, prefix = '') => { /* ... same as before ... */ };
  flattenObject(formData);

  const { data } = await api.put(`/properties/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState(null);

  // 1. Fetch the existing property data
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id),
  });

  // 2. Setup mutation for updating the data
  const mutation = useMutation({
    mutationFn: updateProperty,
    onSuccess: (data) => {
      // Invalidate queries to refetch data on other pages
      queryClient.invalidateQueries(['properties']);
      queryClient.invalidateQueries(['myProperties']);
      queryClient.invalidateQueries(['property', id]);
      navigate(`/p/${data._id}`);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.errors?.map(e => e.msg).join('. ') || error.response?.data?.error || "Update failed.";
      setServerError(errorMsg);
    }
  });

  const handleUpdateSubmit = (formData) => {
    setServerError(null);
    mutation.mutate({ id, formData });
  };

  if (isLoading) return <div className="text-center p-10">Loading property data...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <PropertyForm 
        initialData={property}
        onSubmit={handleUpdateSubmit}
        isSubmitting={mutation.isPending}
        serverError={serverError}
      />
    </div>
  );
}
