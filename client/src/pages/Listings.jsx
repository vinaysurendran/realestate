import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api";
import SearchFilter from "../components/SearchFilter";

const fetchProperties = async (filters) => {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== ''))
  );
  const { data } = await api.get(`/properties?${params.toString()}`);
  return data;
};

export default function Listings({ listingType }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // This function converts search params from the URL into an object for our state
  const getFiltersFromParams = () => ({
    q: searchParams.get('q') || "", 
    city: searchParams.get('city') || "", 
    district: searchParams.get('district') || "", 
    type: searchParams.get('type') || "", 
    minPrice: searchParams.get('minPrice') || "", 
    maxPrice: searchParams.get('maxPrice') || "",
    postedBy: searchParams.get('postedBy') || "",
    sortBy: "createdAt", 
    sortOrder: "desc", 
    page: parseInt(searchParams.get('page') || '1', 10),
    listingType: listingType || ""
  });

  const [filters, setFilters] = useState(getFiltersFromParams());

  useEffect(() => {
    setFilters(getFiltersFromParams());
  }, [searchParams, listingType]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    keepPreviousData: true,
  });

  // This is the custom submit handler for the listings page
  const handleSearch = (formData) => {
    const newFilters = { ...filters, ...formData, page: 1 };
    setFilters(newFilters);
    setSearchParams(Object.fromEntries(Object.entries(newFilters).filter(([_, v]) => v != null && v !== '')));
  };
  
  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    setSearchParams(Object.fromEntries(Object.entries(newFilters).filter(([_, v]) => v != null && v !== '')));
  }

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Properties for {listingType || "All Listings"}
        </h1>
        <SearchFilter initialValues={filters} onSubmit={handleSearch} />
      </div>

      {isLoading && <p className="text-center py-10">Loading properties...</p>}
      {isError && <p className="text-center py-10 text-red-500">Error: {error.message}</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.items.map(p => (
              // --- THIS IS THE FIX: Added 'relative' class ---
              <Link key={p._id} to={`/p/${p._id}`} className="relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="overflow-hidden h-48">
                  <img src={p.images?.[0] || 'https://placehold.co/400x300/e2e8f0/e2e8f0?text=No+Image'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate" title={p.title}>{p.title}</h3>
                  <p className="text-blue-600 font-bold text-xl my-2">
                    ₹{p.price?.amount?.toLocaleString()}
                    {p.price?.perUnit !== 'Total' && (
                      <span className="text-base font-normal text-gray-500"> / {p.price.perUnit}</span>
                    )}
                  </p>
                  <p className="text-gray-600 text-sm truncate">{p.location?.city}, {p.location?.district}</p>
                  <p className="text-gray-500 text-xs mt-1">{p.propertyType}{p.sizeSqft ? ` • ${p.sizeSqft} sqft` : ''}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="flex justify-center items-center mt-8 space-x-4">
              <button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page <= 1 || isLoading} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <span className="font-semibold">Page {data.page} of {data.pages}</span>
              <button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page >= data.pages || isLoading} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </>
      )}
    </div>
  );
}
