import { useState } from "react";
import { db } from "../firebase"; // Import your Firebase config
import { collection, addDoc, setDoc, doc } from "firebase/firestore";

const AddInvestmentProduct = () => {
    const [formData, setFormData] = useState(
        {
            "name": "Peppers",
            "category": "Vegetables Farming",
            "expectedROI": 22,
            "investmentPeriod": 3,
            "minimumInvestment": 6500,
            "availableUnits": 130,
            "unitPrice": 500,
            "riskLevel": "Medium",
            "description": "Pepper farming with moderate risk and steady returns.",
            "startDate": "2025-06-15",
            "endDate": "2025-09-15",
            "status": "Open"
        }






    );
    const [productId, setProductId] = useState(formData.name.toLowerCase());

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productRef = doc(db, "investmentProducts", productId);

        try {
            await setDoc(productRef, {
                ...formData,
                expectedROI: Number(formData.expectedROI),
                investmentPeriod: Number(formData.investmentPeriod),
                minimumInvestment: Number(formData.minimumInvestment),
                availableUnits: Number(formData.availableUnits),
                unitPrice: Number(formData.unitPrice),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            });
            alert("Investment product added successfully!");
        } catch (error) {
            alert("Error adding product: " + error.message);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Add Investment Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="number" name="expectedROI" placeholder="Expected ROI (%)" value={formData.expectedROI} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="number" name="investmentPeriod" placeholder="Investment Period (Months)" value={formData.investmentPeriod} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="number" name="minimumInvestment" placeholder="Minimum Investment" value={formData.minimumInvestment} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="number" name="availableUnits" placeholder="Available Units" value={formData.availableUnits} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="number" name="unitPrice" placeholder="Unit Price" value={formData.unitPrice} onChange={handleChange} className="w-full p-2 border rounded" required />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" required></textarea>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full p-2 border rounded" required />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Product</button>
            </form>
        </div>
    );
};

export default AddInvestmentProduct;
