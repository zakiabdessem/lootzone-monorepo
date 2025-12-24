"use client";

import React, { useState } from "react";
import { Copy, Check, Lock, Mail, Key } from "lucide-react";

interface CredentialsCardProps {
    email: string;
    password: string;
    roomCode: string;
    pinCode: string;
}

const CredentialsCard: React.FC<CredentialsCardProps> = ({
    email,
    password,
    roomCode,
    pinCode,
}) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const CredentialField = ({
        label,
        value,
        icon: Icon,
        fieldName,
    }: {
        label: string;
        value: string;
        icon: React.ElementType;
        fieldName: string;
    }) => {
        const isCopied = copiedField === fieldName;
        return (
            <div className="bg-[#2c1269] border border-[#63e3c2]/40 rounded-xl p-4 hover:border-[#63e3c2] transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-[#63e3c2]" />
                        <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                            {label}
                        </label>
                    </div>
                    <button
                        onClick={() => handleCopy(value, fieldName)}
                        className="p-2 rounded-lg bg-[#4618AC] hover:bg-[#381488] text-white transition-colors"
                        aria-label={`Copy ${label}`}
                    >
                        {isCopied ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>
                </div>
                <div className="bg-[#1b0b48] rounded-lg p-3 font-mono text-lg text-white break-all">
                    {value}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-[#4618AC] via-[#6d3be8] to-[#8660fa] rounded-2xl p-8 shadow-2xl border border-[#63e3c2]/30">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Netflix Account Credentials</h1>
                    <p className="text-white/80">Room {roomCode} Access</p>
                </div>

                <div className="space-y-4">
                    <CredentialField
                        label="Email"
                        value={email}
                        icon={Mail}
                        fieldName="email"
                    />
                    <CredentialField
                        label="Password"
                        value={password}
                        icon={Key}
                        fieldName="password"
                    />
                    <CredentialField
                        label={`Room ${roomCode} PIN`}
                        value={pinCode}
                        icon={Lock}
                        fieldName="pin"
                    />
                </div>

                <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
                    <p className="text-sm text-yellow-100 text-center">
                        <strong>Important:</strong> Keep these credentials secure and do not share them with others.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CredentialsCard;

