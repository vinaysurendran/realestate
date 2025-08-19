import { useForm } from "react-hook-form";
import { useEffect } from "react";

export default function PropertyForm({ initialData, onSubmit, isSubmitting, serverError }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {}
  });

  // When the initialData is loaded (for editing), reset the form with those values.
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {initialData ? "Edit Property" : "Post Your Property"}
      </h2>

      {serverError && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {serverError}
        </p>
      )}

      {/* Form sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Property Title</label>
            <input id="title" {...register("title", { required: "Title is required" })} className={`shadow appearance-none border rounded w-full py-2 px-3 ${errors.title ? 'border-red-500' : ''}`} />
            {errors.title && <p className="text-red-500 text-xs italic mt-2">{errors.title.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
            <textarea id="description" {...register("description")} rows="5" className="shadow appearance-none border rounded w-full py-2 px-3"></textarea>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price.amount">Price (₹)</label>
              <input id="price.amount" type="number" {...register("price.amount", { required: "Price is required" })} className={`shadow appearance-none border rounded w-full py-2 px-3 ${errors.price?.amount ? 'border-red-500' : ''}`} />
              {errors.price?.amount && <p className="text-red-500 text-xs italic mt-2">{errors.price.amount.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price.perUnit">Rate</label>
              <select id="price.perUnit" {...register("price.perUnit")} className="shadow border rounded w-full py-2 px-3">
                <option>Total</option><option>Per Cent</option><option>Per SqFt</option>
              </select>
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location.district">District</label>
              <input id="location.district" {...register("location.district", { required: "District is required" })} className={`shadow appearance-none border rounded w-full py-2 px-3 ${errors.location?.district ? 'border-red-500' : ''}`} />
              {errors.location?.district && <p className="text-red-500 text-xs italic mt-2">{errors.location.district.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location.city">City / Town</label>
              <input id="location.city" {...register("location.city", { required: "City is required" })} className={`shadow appearance-none border rounded w-full py-2 px-3 ${errors.location?.city ? 'border-red-500' : ''}`} />
              {errors.location?.city && <p className="text-red-500 text-xs italic mt-2">{errors.location.city.message}</p>}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location.locality">Locality</label>
            <input id="location.locality" {...register("location.locality")} className="shadow appearance-none border rounded w-full py-2 px-3" />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="propertyType">Property Type</label>
              <select id="propertyType" {...register("propertyType")} className="shadow border rounded w-full py-2 px-3">
                <option>House</option><option>Apartment</option><option>Land</option>
                <option>Commercial</option><option>Villa</option><option>Resort</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sizeSqft">Area (Sq.Ft.)</label>
              <input id="sizeSqft" type="number" {...register("sizeSqft")} className="shadow appearance-none border rounded w-full py-2 px-3" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="googleMapsLink">Google Maps Link (Optional)</label>
            <input id="googleMapsLink" {...register("googleMapsLink")} placeholder="e.g., https://maps.app.goo.gl/..." className={`shadow appearance-none border rounded w-full py-2 px-3 ${errors.googleMapsLink ? 'border-red-500' : ''}`} />
            {errors.googleMapsLink && <p className="text-red-500 text-xs italic mt-2">{errors.googleMapsLink.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Images (up to 6)</label>
            <input type="file" multiple {...register("images")} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full disabled:bg-blue-300">
          {isSubmitting ? (initialData ? 'Saving...' : 'Publishing...') : (initialData ? 'Save Changes' : 'Publish Property')}
        </button>
      </div>
    </form>
  );
}
