import { CircleDollarSign } from 'lucide-react';
import React from 'react'

const BalanceCard = ({ label, amount, Icon, showBalance, toggleShowBalance }) => (
    <button onClick={toggleShowBalance} className="text-left relative">
        <p className="text-xs flex items-center justify-between">
            {label}
            <span className="p-1 rounded-full hover:bg-gray-200 cursor-pointer">
                {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
            </span>
        </p>
        <p className="text-sm font-bold">
            NGN {typeof amount === 'number' ? (showBalance ? amount.toLocaleString() : '****') : <LoaderIcon className="animate-spin w-4 h-4" />}
        </p>
        <Icon className="absolute left-5 top-3 w-16 h-16 text-[#0FA280] opacity-20 -rotate-20" />
        <CircleDollarSign className="absolute right-10 top-3 w-16 h-16 text-[#0FA280] opacity-20 rotate-20" />
    </button>
);


export default BalanceCard