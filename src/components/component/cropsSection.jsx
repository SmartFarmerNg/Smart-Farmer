import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CropsSection = ({ crops, cropsLoading }) => {
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
        <section className="w-full max-w-2xl mt-4 p-6 bg-white/30 backdrop-blur-md shadow-lg rounded-2xl border border-gray-200">
            <input
                type="text"
                className="w-full p-3 px-6 bg-gray-100 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0FA280] transition-all sticky top-2 z-10"
                placeholder="Search crop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <h2 className="text-xl font-bold mt-6 text-white">Top Crops to Invest In</h2>

            {cropsLoading ? (
                <p className="text-center text-gray-200 mt-4">Loading crops...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        {currentCrops.map((data, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white backdrop-blur-lg shadow-md p-5 rounded-xl text-center font-semibold border border-gray-300 transition-all flex justify-between items-center"
                            >
                                <div>
                                    <div className="text-lg text-gray-800">{data.name}</div>
                                    <div className="text-[#0FA280] font-bold text-sm mt-1 flex items-center gap-1">
                                        {data.expectedROI}% /{" "}
                                        <p className="text-gray-400 text-xs">{data.investmentPeriod} months</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/product/${data.id}`, { state: { product: data } })}
                                    className="bg-[#0FA280] text-white py-2 px-4 rounded-lg hover:bg-[#0d8b6d] transition-all cursor-pointer"
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
                                    ? "bg-[#0FA280] text-white"
                                    : "bg-gray-200 text-gray-700"
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
