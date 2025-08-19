import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "../api";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../contexts/UserContext.jsx";

const fetchProperty = async (id) => {
  const { data } = await api.get(`/properties/${id}`);
  return data;
};

const sendInquiry = async (data) => {
  const response = await api.post('/inquiries', data);
  return response.data;
};

// A small, reusable component for displaying key info with icons
const InfoPill = ({ icon, text }) => (
  <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
    <span role="img" aria-hidden="true">{icon}</span>
    <span>{text}</span>
  </div>
);

export default function Property() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [mainImage, setMainImage] = useState(null);
  const [showContact, setShowContact] = useState(false);

  const { data: p, isLoading, isError, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id),
  });

  // Set the main image once the property data is loaded
  useEffect(() => {
    if (p?.images?.[0]) {
      setMainImage(p.images[0]);
    }
  }, [p]);
  
  const mutation = useMutation({
    mutationFn: sendInquiry,
    onSuccess: () => {
      alert("Your inquiry has been sent successfully!");
      reset();
    },
    onError: (err) => {
      alert(`Error: ${err.response?.data?.error || "Could not send inquiry."}`);
    }
  });

  const onInquirySubmit = (formData) => {
    mutation.mutate({
      propertyId: id,
      message: formData.message,
    });
  };

  if (isLoading) return <div className="text-center p-10">Loading Property Details...</div>;
  if (isError) return <div className="text-center p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Image Gallery Section */}
          <div className="lg:col-span-3 p-4">
            <div className="h-96 rounded-lg overflow-hidden mb-2 shadow-inner">
              <img src={mainImage || 'https://placehold.co/800x600/e2e8f0/e2e8f0?text=No+Image'} alt={p.title} className="w-full h-full object-cover"/>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {p.images?.map((src, i) => (
                <img 
                  key={i} 
                  src={src} 
                  alt={`Thumbnail ${i+1}`} 
                  onClick={() => setMainImage(src)}
                  className={`w-24 h-20 object-cover rounded-md cursor-pointer border-2 transition-all ${mainImage === src ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-300'}`}
                />
              ))}
            </div>
          </div>

          {/* Property Details & Contact Section */}
          <div className="lg:col-span-2 p-6 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{p.title}</h1>
            <p className="text-gray-500 mt-1 text-md">{p.location?.city}, {p.location?.district}</p>
            
            <p className="text-blue-600 font-bold text-4xl my-4">
              ₹{p.price?.amount?.toLocaleString()}
              <span className="text-lg font-normal text-gray-500"> {p.price?.perUnit !== 'Total' ? `(${p.price?.perUnit})` : ''}</span>
            </p>

            <div className="flex flex-wrap gap-3 my-4">
              <InfoPill icon="🏠" text={p.propertyType} />
              {p.sizeSqft && <InfoPill icon="📏" text={`${p.sizeSqft} sqft`} />}
              <InfoPill icon="👤" text={`Posted by ${p.postedBy}`} />
            </div>

            <div className="mt-4 border-t pt-4">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{p.description}</p>
            </div>

            {p.googleMapsLink && (
              <div className="mt-4">
                <a href={p.googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded transition-colors">
                  <span role="img" aria-label="map">🗺️</span> View Location on Map
                </a>
              </div>
            )}

            {p.seller && (
              <div className="mt-auto pt-6">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-2">Contact {p.seller.name}</h3>
                  {user ? (
                    user.id !== p.seller._id ? (
                      <div>
                        {showContact ? (
                          <div className="space-y-2">
                            <p className="text-gray-800"><strong>Email:</strong> {p.seller.email}</p>
                            {p.seller.phoneNumber && <p className="text-gray-800"><strong>Phone:</strong> {p.seller.phoneNumber}</p>}
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowContact(true)}
                            className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
                          >
                            Show Contact Details
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">This is your property.</p>
                    )
                  ) : (
                    <p className="text-sm text-gray-600">Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> to see contact details.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
