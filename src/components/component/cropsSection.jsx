import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LoaderIcon } from "lucide-react";

const CropsSection = ({ crops, cropsLoading, theme, accent }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCrops, setFilteredCrops] = useState([]);
    const cropsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        // Filter crops based on the search term
        const filtered = crops.filter((crop) =>
            crop.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCrops(filtered);
    }, [searchTerm, crops]);

    // Calculate the crops to display based on pagination
    const indexOfLastCrop = currentPage * cropsPerPage;
    const indexOfFirstCrop = indexOfLastCrop - cropsPerPage;
    const currentCrops = filteredCrops.slice(indexOfFirstCrop, indexOfLastCrop);

    // Handle page change
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <section className={`w-full mt-4 p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200 text-gray-900'} backdrop-blur-md shadow-lg rounded-2xl border border-gray-200 z-50`}>
            <input
                type="text"
                className={`w-full p-3 px-6 ${theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[${accent}] transition-all sticky top-2 z-10`}
                placeholder="Search crop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <h2 className={`text-xl font-bold mt-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Top Crops to Invest In</h2>

            {cropsLoading ? (
                <p className="text-center text-gray-200 mt-4 flex items-center justify-center gap-1 w-full">Loading crops<LoaderIcon className="animate-spin" /></p>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        {currentCrops.map((data, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.95 }}
                                className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} backdrop-blur-lg shadow-md p-5 rounded-xl text-center font-semibold border border-gray-300 transition-all flex justify-between items-center`}
                            >
                                <div>
                                    <div className={`text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} text-start`}>{data.name}</div>
                                    <div className={`text-[${accent}] font-bold text-sm mt-1 flex items-center gap-1`}>
                                        {data.expectedROI}% /{" "}
                                        <p className="text-gray-400 text-xs">{data.investmentPeriod} months</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/product/${data.id}`, { state: { product: data } })}
                                    className={`bg-[${accent}] ${accent === '#ECF87F' || accent === '#75E6DA' ? 'text-black' : 'text-white'} font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-all cursor-pointer`}
                                >
                                    Invest Now
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-4 gap-2">
                        {Array.from({ length: Math.ceil(filteredCrops.length / cropsPerPage) }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index + 1)}
                                className={`px-4 py-2 rounded-lg cursor-pointer ${currentPage === index + 1
                                    ? `bg-[${accent}] text-white`
                                    : theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default CropsSection;