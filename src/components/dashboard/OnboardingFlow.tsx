import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { User as UserIcon, FileText, CreditCard, ArrowRight, Check, SkipForward, Upload, Loader2 } from "lucide-react";

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
  user: User | null;
}

type Step = "profile" | "kyc" | "identity" | "complete";

const OnboardingFlow = ({ open, onComplete, user }: OnboardingFlowProps) => {
  const [step, setStep] = useState<Step>("profile");
  const [loading, setLoading] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    country: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
  });

  // KYC data
  const [kycData, setKycData] = useState({
    id_type: "",
    id_number: "",
    id_expiry: "",
  });

  // Government ID
  const [governmentIdType, setGovernmentIdType] = useState("");
  const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async () => {
    if (!profileData.full_name || !profileData.phone || !profileData.country) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.full_name,
        phone: profileData.phone,
        date_of_birth: profileData.date_of_birth || null,
        country: profileData.country,
        address: profileData.address || null,
        city: profileData.city || null,
        state: profileData.state || null,
        postal_code: profileData.postal_code || null,
        profile_completed: true,
      })
      .eq("id", user?.id);

    setLoading(false);
    if (error) {
      toast.error("Failed to save profile");
      return;
    }

    // Send welcome email
    try {
      await supabase.functions.invoke("send-welcome-email", {
        body: { email: user?.email, type: "profile_complete", name: profileData.full_name },
      });
    } catch (e) {
      console.error("Failed to send email:", e);
    }

    setStep("kyc");
  };

  const handleKycSubmit = async () => {
    if (kycData.id_type && kycData.id_number) {
      // Store KYC data - for now we're marking it as submitted
      await supabase
        .from("profiles")
        .update({ kyc_status: "submitted" })
        .eq("id", user?.id);
    }
    setStep("identity");
  };

  const handleSkipKyc = () => {
    setStep("identity");
  };

  const handleIdentitySubmit = async () => {
    if (!governmentIdFile || !governmentIdType) {
      toast.error("Please select an ID type and upload a screenshot");
      return;
    }

    setUploading(true);
    try {
      // Upload the government ID screenshot
      const fileExt = governmentIdFile.name.split(".").pop();
      const fileName = `${user?.id}-gov-id-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from("deposit-screenshots")
        .upload(fileName, governmentIdFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("deposit-screenshots")
        .getPublicUrl(fileName);

      // Update profile with government ID info
      await supabase
        .from("profiles")
        .update({ 
          kyc_status: "pending_review",
          government_id_type: governmentIdType,
          government_id_url: publicUrl
        })
        .eq("id", user?.id);

      setStep("complete");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload ID. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkipIdentity = () => {
    setStep("complete");
  };

  const handleComplete = () => {
    onComplete();
  };

  const steps = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "kyc", label: "KYC", icon: FileText },
    { id: "identity", label: "ID", icon: CreditCard },
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        {step !== "complete" && (
          <>
            <DialogHeader>
            <DialogTitle className="text-center text-xl">
                {step === "profile" && "Complete Your Profile"}
                {step === "kyc" && "KYC Verification"}
                {step === "identity" && "Government Issued ID"}
              </DialogTitle>
            </DialogHeader>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step === s.id 
                        ? "bg-primary text-primary-foreground" 
                        : steps.findIndex(st => st.id === step) > i
                          ? "bg-green-500 text-white"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {steps.findIndex(st => st.id === step) > i ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-1 ${
                      steps.findIndex(st => st.id === step) > i ? "bg-green-500" : "bg-secondary"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 1: Profile Information */}
        {step === "profile" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={profileData.full_name}
                  onChange={(e) => handleProfileChange("full_name", e.target.value)}
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  placeholder="+1 234 567 8900"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={profileData.date_of_birth}
                  onChange={(e) => handleProfileChange("date_of_birth", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Country *</Label>
                <Input
                  placeholder="United States"
                  value={profileData.country}
                  onChange={(e) => handleProfileChange("country", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Input
                  placeholder="123 Main Street"
                  value={profileData.address}
                  onChange={(e) => handleProfileChange("address", e.target.value)}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  placeholder="New York"
                  value={profileData.city}
                  onChange={(e) => handleProfileChange("city", e.target.value)}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  placeholder="NY"
                  value={profileData.state}
                  onChange={(e) => handleProfileChange("state", e.target.value)}
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  placeholder="10001"
                  value={profileData.postal_code}
                  onChange={(e) => handleProfileChange("postal_code", e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleProfileSubmit} disabled={loading}>
              {loading ? "Saving..." : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: KYC Verification (Skippable) */}
        {step === "kyc" && (
          <div className="space-y-4">
            <Card className="p-4 bg-secondary/50 border-primary/20">
              <p className="text-sm text-muted-foreground text-center">
                Complete KYC verification to unlock all features. You can skip this for now.
              </p>
            </Card>

            <div className="space-y-4">
              <div>
                <Label>ID Type</Label>
                <Input
                  placeholder="Passport / Driver's License / National ID"
                  value={kycData.id_type}
                  onChange={(e) => setKycData(prev => ({ ...prev, id_type: e.target.value }))}
                />
              </div>
              <div>
                <Label>ID Number</Label>
                <Input
                  placeholder="Enter your ID number"
                  value={kycData.id_number}
                  onChange={(e) => setKycData(prev => ({ ...prev, id_number: e.target.value }))}
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={kycData.id_expiry}
                  onChange={(e) => setKycData(prev => ({ ...prev, id_expiry: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleSkipKyc}>
                <SkipForward className="w-4 h-4 mr-2" />
                Skip
              </Button>
              <Button className="flex-1" onClick={handleKycSubmit}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Government Issued Identification (Skippable) */}
        {step === "identity" && (
          <div className="space-y-4">
            <Card className="p-4 bg-secondary/50 border-primary/20">
              <p className="text-sm text-muted-foreground text-center">
                Upload a screenshot of your Government Issued Identification for enhanced verification. You can skip this for now.
              </p>
            </Card>

            <div>
              <Label>ID Type</Label>
              <Input
                placeholder="e.g., Passport, Driver's License, National ID"
                value={governmentIdType}
                onChange={(e) => setGovernmentIdType(e.target.value)}
              />
            </div>

            <div>
              <Label>Upload ID Screenshot</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {governmentIdFile ? governmentIdFile.name : "Click to upload screenshot"}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setGovernmentIdFile(file);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleSkipIdentity}>
                <SkipForward className="w-4 h-4 mr-2" />
                Skip
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleIdentitySubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Complete Screen */}
        {step === "complete" && (
          <div className="py-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 mx-auto flex items-center justify-center">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome, {profileData.full_name}!</h2>
              <p className="text-muted-foreground">
                Your account is ready. Start trading now!
              </p>
            </div>
            <Button className="w-full" onClick={handleComplete}>
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow;
