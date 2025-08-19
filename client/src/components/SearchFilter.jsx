import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export default function SearchFilter() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    // Clean up empty fields from the data object
    const searchParams = new URLSearchParams(
      Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== ''))
    ).toString();
    
    // Navigate to the listings page with the search parameters
    navigate(`/buy?${searchParams}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded-lg shadow-xl space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Keyword Search */}
        <input
          {...register("q")}
          placeholder="Keyword or Property ID"
          className="w-full p-3 border rounded-md"
        />

        {/* Property Category */}
        <select {...register("type")} className="w-full p-3 border rounded-md">
          <option value="">All Categories</option>
          <option>House</option>
          <option>Apartment</option>
          <option>Land</option>
          <option>Commercial</option>
          <option>Villa</option>
          <option>Resort</option>
        </select>

        {/* Posted By */}
        <select {...register("postedBy")} className="w-full p-3 border rounded-md">
          <option value="">Posted by (Any)</option>
          <option>Owner</option>
          <option>Builder</option>
          <option>Agent</option>
        </select>

        {/* Location */}
        <input
          {...register("district")}
          placeholder="District (e.g., Ernakulam)"
          className="w-full p-3 border rounded-md"
        />
        <input
          {...register("city")}
          placeholder="City (e.g., Kochi)"
          className="w-full p-3 border rounded-md"
        />
        <input
          {...register("locality")}
          placeholder="Locality (e.g., Kakkanad)"
          className="w-full p-3 border rounded-md"
        />
      </div>

      {/* Price Range */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          {...register("minPrice")}
          type="number"
          placeholder="Min Price (₹)"
          className="w-full p-3 border rounded-md"
        />
        <input
          {...register("maxPrice")}
          type="number"
          placeholder="Max Price (₹)"
          className="w-full p-3 border rounded-md"
        />
      </div>

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">
        Search Properties
      </button>
    </form>
  );
}