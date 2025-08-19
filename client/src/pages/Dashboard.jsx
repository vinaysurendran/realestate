import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../api";

// API function to fetch the current user's properties
const fetchMyProperties = async () => {
  const { data } = await api.get("/properties/mine/all");
  return data;
};

// API function to delete a property
const deleteProperty = async (id) => {
  await api.delete(`/properties/${id}`);
};

export default function Dashboard() {
  const queryClient = useQueryClient();

  // Query to fetch the properties
  const { data: properties, isLoading, isError, error } = useQuery({
    queryKey: ['myProperties'],
    queryFn: fetchMyProperties,
  });

  // Mutation for deleting a property
  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      // When a delete is successful, refetch the properties list to update the UI
      queryClient.invalidateQueries({ queryKey: ['myProperties'] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="text-center p-10">Loading your properties...</div>;
  if (isError) return <div className="text-center p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Properties</h1>
        <Link to="/add" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm">
          + Add New Property
        </Link>
      </div>

      {properties && properties.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-600">You haven't posted any properties yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {properties && properties.map((prop) => (
              <li key={prop._id} className="p-4 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50">
                <div className="flex items-center mb-4 sm:mb-0 flex-grow">
                  <img 
                    src={prop.images?.[0] || 'https://placehold.co/100x100/e2e8f0/e2e8f0?text=No+Image'} 
                    alt={prop.title} 
                    className="w-24 h-24 object-cover rounded-md mr-4"
                  />
                  <div>
                    <Link to={`/p/${prop._id}`} className="text-lg font-semibold text-blue-600 hover:underline">{prop.title}</Link>
                    <p className="text-gray-500">{prop.location.city}, {prop.location.district}</p>
                    <p className="text-gray-800 font-bold">₹{prop.price.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-4 flex-shrink-0">
                  <Link 
                    to={`/edit-property/${prop._id}`}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(prop._id)} 
                    disabled={deleteMutation.isPending && deleteMutation.variables === prop._id}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-300"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === prop._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
