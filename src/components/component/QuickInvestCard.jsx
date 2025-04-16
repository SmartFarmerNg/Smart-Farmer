import React from "react";
import { useNavigate } from "react-router-dom";
import { BadgePercent } from "lucide-react";

const QuickInvestCard = ({ investment }) => {
    const navigate = useNavigate();

    const {
        productName,
        expectedROI,
        ROIFrequency,
        minWithdrawalDays,
        minimumInvestment,
        minimumInvestmentPeriod,
        status,
    } = investment;

    const handleInvest = () => {
        navigate(`/invest/quick-invest/fast-vegetable/${productName}`, { state: { investment } });
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-4 hover:shadow-xl transition duration-300 ease-in-out w-full my-5 z-10">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">{productName}</h2>
                <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                        }`}
                >
                    {status === "open" ? "Available" : "Closed"}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                    <p className="font-medium">ROI</p>
                    <p>{expectedROI}% {ROIFrequency}</p>
                </div>
                <div>
                    <p className="font-medium">Investment Period</p>
                    <p>{minimumInvestmentPeriod} days</p>
                </div>
                <div>
                    <p className="font-medium">Min Withdrawal</p>
                    <p>{minWithdrawalDays} days</p>
                </div>
                <div>
                    <p className="font-medium">Min Investment</p>
                    <p>₦{minimumInvestment.toLocaleString()}</p>
                </div>
            </div>

            <button
                onClick={handleInvest}
                disabled={status !== "open"}
                className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-xl transition ${status === "open"
                    ? "bg-[#0FA280] hover:bg-[#0d8b6d]"
                    : "bg-gray-300 cursor-not-allowed"
                    }`}
            >
                <BadgePercent size={18} />
                Invest Now
            </button>
        </div>
    );
};

export default QuickInvestCard;
