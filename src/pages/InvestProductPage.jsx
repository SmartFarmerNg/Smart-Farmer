import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const InvestProductPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const investment = state?.investment;

    if (!investment) {
        return (
            <div className="p-6">
                <p className="text-red-500 font-semibold">No investment data found.</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    // const getProgress = () => {
    //     const start = investment.startDate?.toDate?.() || new Date(investment.startDate);
    //     const now = new Date();
    //     const duration = investment.investmentPeriod * 30 * 24 * 60 * 60 * 1000;
    //     const elapsed = now - start;
    //     const progress = (elapsed / duration) * 100;
    //     return Math.min(Math.max(progress, 0), 100);
    // };

    const getProgress = (inv) => {
        const startRaw = inv.productName === 'Fast Vegetables' ? inv.createdAt : inv.startDate;
        const start = new Date(startRaw);
        const now = new Date();
        const totalDays = inv.productName === 'Fast Vegetables'
            ? inv.investmentPeriod
            : inv.investmentPeriod * 30;
        const duration = totalDays * 24 * 60 * 60 * 1000; // convert days to ms
        const elapsed = now - start;
        const percentage = (elapsed / duration) * 100;
        return Math.min(Math.max(percentage, 0), 100); // clamp between 0-100
    };

    const progress = getProgress(investment);

    return (
        <div className=" min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md z-50">
                <h1 className="text-2xl font-bold text-center mb-4">{investment.productName}</h1>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
                    <div className="flex-1 space-y-2">
                        <p><strong>Amount:</strong> ₦{investment.investmentAmount.toLocaleString()}</p>
                        <p><strong>Units Bought:</strong> {investment.unitsBought}</p>
                        <p><strong>ROI:</strong> {investment.expectedROI}%</p>
                        <p><strong>Duration:</strong> {investment.investmentPeriod} {investment.productName === 'Fast Vegetables' ? 'days' : 'months'}</p>
                        <p className={`${investment.status === 'Active' ? 'text-green-500' : investment.status === 'Pending' ? 'text-amber-400' : 'text-red-500'}`}><strong className="text-black">Status:</strong> {investment.status}</p>
                        {investment.productName === 'Fast Vegetables' ? <p><strong>Start Date:</strong> {new Date(investment.createdAt).toLocaleDateString()}</p>
                            : <>
                                <p><strong>Start Date:</strong> {new Date(investment.startDate).toLocaleDateString()}</p>
                                <p><strong>Created At:</strong> {new Date(investment.createdAt).toLocaleDateString()}</p>
                            </>
                        }
                    </div>
                    <div className="w-32 h-32 mx-auto sm:mx-0">
                        <CircularProgressbar
                            value={progress}
                            text={`${Math.round(progress)}%`}
                            styles={buildStyles({
                                textSize: "24px",
                                textColor: "#0FA280",
                                pathColor: "#0FA280",
                                trailColor: "#e6e6e6",
                            })}
                        />
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>
                </div>
            </div>
        </div >
    );
};

export default InvestProductPage;
