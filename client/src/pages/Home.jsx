import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import SearchFilter from '../components/SearchFilter';

const FeaturedListings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['featuredProperties'],
    queryFn: async () => {
      const { data } = await api.get('/properties?limit=4');
      return data.items;
    },
  });

  if (isLoading) return <div className="text-center p-4">Loading...</div>;
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map(p => (
        <Link key={p._id} to={`/p/${p._id}`} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
          <div className="overflow-hidden h-52">
            <img 
              src={p.images?.[0] || 'https://placehold.co/400x300/e2e8f0/e2e8f0?text=No+Image'} 
              alt={p.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 truncate" title={p.title}>{p.title}</h3>
            <p className="text-blue-600 font-bold text-xl my-2">₹{p.price?.amount?.toLocaleString()}</p>
            <p className="text-gray-600 text-sm truncate">{p.location?.city}, {p.location?.district}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default function Home() {
  return (
    <div className="space-y-16 md:space-y-24">
      <div className="relative -mt-6 -mx-6 md:-mx-8">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
          alt="Modern Kerala home" 
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center shadow-lg mb-8">
            The Key to Your Kerala Home
          </h1>
          <div className="w-full max-w-4xl">
            <SearchFilter />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-3xl font-semibold mb-2 text-gray-800">Have a Property to Sell or Rent?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Join thousands of owners and agents. Post your property for free and connect with genuine buyers across Kerala.</p>
          <Link to="/add" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105 inline-block">
            Post Your Property for FREE
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Fresh on the Market</h2>
        <FeaturedListings />
      </div>
    </div>
  );
}
