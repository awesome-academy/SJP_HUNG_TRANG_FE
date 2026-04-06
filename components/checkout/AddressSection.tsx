"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Home,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const inputClass =
  "w-full px-3 py-2.5 rounded border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all";

interface AddressSectionProps {
  onAddressChange: (data: {
    fullName: string;
    phone: string;
    address: string;
    note: string;
  }) => void;
}

export default function AddressSection({
  onAddressChange,
}: AddressSectionProps) {
  const t = useTranslations("Checkout.address");
  const { data: session, status } = useSession();
  const [loadingUser, setLoadingUser] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          setLoadingUser(true);
          const res = await fetch(`/api/users/${session.user.id}`);
          if (!res.ok) throw new Error("Failed to fetch user data");

          const userData = await res.json();

          const initialData = {
            fullName: userData.fullName || "",
            phone: userData.phone || "",
            address: userData.address || "",
            note: "",
          };

          setForm(initialData);
          onAddressChange(initialData);

          if (userData.address && userData.phone) {
            setIsEditing(false);
          } else {
            setIsEditing(true);
          }
        } catch (error) {
          console.error(error);
          setIsEditing(true);
        } finally {
          setLoadingUser(false);
        }
      }

      if (status === "unauthenticated") {
        setIsEditing(true);
      }
    };

    fetchUserData();
  }, [session?.user?.id, status]);

  const handleChange = (key: string, value: string) => {
    const newForm = { ...form, [key]: value };
    setForm(newForm);
    onAddressChange(newForm);
  };

  const handleSave = () => {
    if (!form.fullName || !form.phone || !form.address) {
      toast(t("Please fill in all shipping information"));
      return;
    }
    setIsEditing(false);
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center py-10 bg-white rounded-lg border">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2 text-sm text-gray-500">
          {t("Loading user information")}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {t("Shipping Address")}
          </h2>
        </div>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-4">
          <Separator className="mb-2" />

          {status === "loading" ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
            </div>
          ) : !isEditing ? (
            <div className="bg-green-50/50 border border-green-100 rounded-lg p-4 relative group">
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 text-xs font-semibold text-green-600 hover:underline"
              >
                {t("Change")}
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm font-bold text-gray-800">
                    {form.fullName}
                  </span>
                  <span className="text-gray-300">|</span>
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600">{form.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Home className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600 flex-1">{form.address}</p>
                </div>
                {form.note && (
                  <p className="text-xs text-gray-400 italic font-medium">
                    {t("Note")}: "{form.note}"
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Form nhập liệu */
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
                    {t("Full Name")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("Name Example")}
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
                    {t("Phone Number")}
                  </label>
                  <input
                    type="tel"
                    placeholder={t("Phone Example")}
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
                  {t("Specific Address")}
                </label>
                <textarea
                  rows={2}
                  placeholder={t("Address Example")}
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className={cn(inputClass, "resize-none")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
                  {t("Note for shipper")}
                </label>
                <input
                  type="text"
                  placeholder={t("Note Example")}
                  value={form.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {form.address && status === "authenticated" && (
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="text-xs h-9"
                  >
                    {t("Cancel")}
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-6 h-9"
                >
                  {t("Use this address")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
