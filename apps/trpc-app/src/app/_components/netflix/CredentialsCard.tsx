"use client";

import React, { useState } from "react";
import { Copy, Check, Lock, Mail, Key, Shield } from "lucide-react";
import { Button } from "~/app/_components/landing/ui/button";

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
        labelAr,
        labelFr,
        value,
        icon: Icon,
        fieldName,
    }: {
        label: string;
        labelAr: string;
        labelFr: string;
        value: string;
        icon: React.ElementType;
        fieldName: string;
    }) => {
        const isCopied = copiedField === fieldName;
        return (
            <div className="bg-white rounded-none shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#4618AC]/10 rounded-md">
                            <Icon className="w-4 h-4 text-[#4618AC]" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-[#212121] uppercase tracking-wide">
                                {label}
                            </label>
                            <div className="flex gap-2 text-[10px] text-gray-500">
                                <span>{labelAr}</span>
                                <span>•</span>
                                <span>{labelFr}</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(value, fieldName)}
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        aria-label={`Copy ${label}`}
                    >
                        {isCopied ? (
                            <Check className="w-4 h-4 text-[#23c299]" />
                        ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                        )}
                    </Button>
                </div>
                <div className="bg-[#f8f7ff] rounded-md p-3 font-mono text-sm text-[#212121] break-all border border-gray-100 select-all">
                    {value}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-none shadow-lg p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[#212121] mb-2">
                        Netflix Account Credentials
                    </h1>
                    <p className="text-xs text-gray-500 mb-2">
                        بيانات حساب Netflix • Informations du compte Netflix
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#23c299]/10 rounded-full">
                        <Lock className="w-3.5 h-3.5 text-[#23c299]" />
                        <p className="text-sm font-medium text-[#23c299] uppercase tracking-wide">
                            Room {roomCode} Access
                        </p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                        الوصول للغرفة {roomCode} • Accès à la salle {roomCode}
                    </p>
                </div>

                {/* Credentials */}
                <div className="space-y-4 mb-6">
                    <CredentialField
                        label="Email"
                        labelAr="البريد الإلكتروني"
                        labelFr="E-mail"
                        value={email}
                        icon={Mail}
                        fieldName="email"
                    />
                    <CredentialField
                        label="Password"
                        labelAr="كلمة المرور"
                        labelFr="Mot de passe"
                        value={password}
                        icon={Key}
                        fieldName="password"
                    />
                    <CredentialField
                        label={`Room ${roomCode} PIN Code`}
                        labelAr={`رمز PIN للغرفة ${roomCode}`}
                        labelFr={`Code PIN de la salle ${roomCode}`}
                        value={pinCode}
                        icon={Lock}
                        fieldName="pin"
                    />
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-none p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <Shield className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-yellow-900 mb-1">
                                Security Notice • إشعار الأمان • Avis de sécurité
                            </p>
                            <p className="text-xs text-yellow-800 leading-relaxed mb-2">
                                Keep these credentials secure and do not share them with others. 
                                This access link is time-limited and will expire automatically.
                            </p>
                            <p className="text-xs text-yellow-800 leading-relaxed mb-2" dir="rtl">
                                احتفظ بهذه البيانات بشكل آمن ولا تشاركها مع الآخرين. 
                                رابط الوصول هذا محدود بوقت وسينتهي تلقائياً.
                            </p>
                            <p className="text-xs text-yellow-800 leading-relaxed">
                                Gardez ces identifiants en sécurité et ne les partagez pas avec d'autres. 
                                Ce lien d'accès est limité dans le temps et expirera automatiquement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CredentialsCard;

